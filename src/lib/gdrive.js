/**
 * Sokongan Google Drive untuk NotaMesyuarat.
 *
 * Guna Drive REST API v3 dengan OAuth2 token daripada Google Identity
 * Services (token client). Pengguna perlu:
 *  1. Cipta projek di Google Cloud Console (percuma)
 *  2. Aktifkan "Google Drive API"
 *  3. Cipta "OAuth Client ID" jenis Web application
 *  4. Tambah origin app (contoh: http://localhost:4174) pada
 *     "Authorized JavaScript origins"
 *  5. Tampal Client ID (berbentuk xxxx.apps.googleusercontent.com) ke sini
 *
 * Rujukan: https://developers.google.com/drive/api/v3/about-sdk
 */

const SCOPE = 'https://www.googleapis.com/auth/drive';
// SEC-002: prinsip keistimewaan minimum — drive.file cukup untuk fail yang
// dicipta app (folder app, muat naik, muat turun). Skop penuh hanya dipinta
// bila pengguna mengaktifkan mod "cari keseluruhan Drive".
const SCOPE_MINIMAL = 'https://www.googleapis.com/auth/drive.file';
const APP_FOLDER = 'notamesyuarat';

/** Skop diperlukan ikut operasi: searchAll perlu akses seluruh Drive. */
export function scopeFor(searchAll) {
  return searchAll ? SCOPE : SCOPE_MINIMAL;
}

let tokenClient = null;
let accessToken = null;
let tokenExpiry = 0;
let tokenScope = null;

/**
 * Pastikan pustaka GIS dimuat dan tokenClient sedia.
 * Menunggu sehingga window.google.accounts.oauth2.tokenClient wujud.
 */
function loadGSI() {
  return new Promise((resolve, reject) => {
    // Sudah sedia? Terima kedua-dua API: tokenClient (baru) atau
    // initTokenClient (pabrik, versi pustaka semasa)
    const ready = () =>
      typeof window.google?.accounts?.oauth2?.tokenClient === 'function' ||
      typeof window.google?.accounts?.oauth2?.initTokenClient === 'function';
    const failMsg = 'Pustaka Google Identity dimuat tetapi tidak lengkap. Cuba muat semula halaman.';

    if (ready()) {
      resolve();
      return;
    }
    // Skrip tag lama mungkin masih memuat — tunggu dengan poll
    const existing = document.querySelector('script[src*="accounts.google.com/gsi"]');
    if (existing) {
      let tries = 0;
      const poll = window.setInterval(() => {
        tries += 1;
        if (ready()) {
          window.clearInterval(poll);
          resolve();
        } else if (tries > 50) {
          window.clearInterval(poll);
          reject(new Error(failMsg));
        }
      }, 100);
      return;
    }
    // Belum ada — suntik skrip baru
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (ready()) {
        resolve();
      } else {
        reject(new Error(failMsg));
      }
    };
    s.onerror = () => reject(new Error('Gagal memuat pustaka Google Identity. Semak sambungan internet.'));
    document.head.appendChild(s);
  });
}

/**
 * Dapatkan token akses dengan Client ID pengguna.
 * Kembalikan access token. Bentol ralat jika gagal.
 */
export async function getAccessToken(clientId, scope = SCOPE_MINIMAL) {
  // Token cache hanya sah jika skopnya sepadan
  if (accessToken && tokenScope === scope && Date.now() < tokenExpiry) return accessToken;
  if (!clientId) throw new Error('Masukkan Google OAuth Client ID dahulu.');

  await loadGSI();

  accessToken = await new Promise((resolve, reject) => {
    try {
      // Versi GIS baharu guna initTokenClient (pabrik); versi lama tokenClient
      const oauth2 = window.google.accounts.oauth2;
      const factory = typeof oauth2.initTokenClient === 'function' ? oauth2.initTokenClient : oauth2.tokenClient;
      factory({
        client_id: clientId,
        scope,
        callback: (resp) => {
          if (resp.error) reject(new Error(`Google OAuth: ${resp.error}`));
          else {
            tokenExpiry = Date.now() + (resp.expires_in - 60) * 1000;
            tokenScope = scope;
            resolve(resp.access_token);
          }
        },
        error_callback: (err) => reject(new Error(err.message || 'OAuth dibatalkan.')),
      }).requestAccessToken();
    } catch (err) {
      reject(new Error(`OAuth gagal dimulakan: ${err.message}`));
    }
  });
  return accessToken;
}

export function gapiHeaders(token, extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

/**
 * Uji sambungan: pastikan token sah dan folder app wujud (cipta jika tiada).
 * Kembalikan ID folder app.
 */
export async function ensureGDriveFolder(token) {
  const q = encodeURIComponent(
    `name='${APP_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    { headers: gapiHeaders(token) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.files?.length) return data.files[0].id;

  // Folder tiada — cipta
  const create = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: gapiHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        name: APP_FOLDER,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );
  if (!create.ok) throw new Error(`Cipta folder gagal: HTTP ${create.status}`);
  const folder = await create.json();
  return folder.id;
}

/** Muat naik blob ke folder Google Drive. Kembalikan ID fail. */
export async function gDriveUpload(token, folderId, blob, filename) {
  const boundary = `notamesyuarat-${Date.now()}`;
  const metadata = { name: filename, parents: [folderId] };
  const multipartBody =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: ${blob.type || 'application/octet-stream'}\r\n\r\n`;
  const tail = `\r\n--${boundary}--`;
  const body = new Blob([multipartBody, blob, tail]);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: gapiHeaders(token, { 'Content-Type': `multipart/related; boundary=${boundary}` }),
      body,
    }
  );
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err.error?.message || msg;
    } catch {
      // kekal
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.id;
}

/** Senarai fail audio dalam folder app Google Drive. */
export async function gDriveList(token, folderId) {
  const q = encodeURIComponent(
    `'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`
  );
  const orderBy = encodeURIComponent('modifiedTime desc');
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,size,modifiedTime)&orderBy=${orderBy}&pageSize=100`,
    { headers: gapiHeaders(token) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const AUDIO = /\.(mp3|m4a|wav|webm|ogg|oga|mp4|mov|aac|flac)$/i;
  return (data.files || [])
    .filter((f) => AUDIO.test(f.name))
    .map((f) => ({
      id: f.id,
      name: f.name,
      size: Number(f.size || 0),
      modified: new Date(f.modifiedTime).getTime(),
    }));
}

/**
 * Cari fail audio/video di KESELURUHAN Google Drive pengguna
 * (bukan hanya folder app). Guna bila cfg.searchAll aktif.
 */
export async function gDriveSearchAll(token) {
  const q = encodeURIComponent(
    `trashed=false and (mimeType contains 'audio/' or mimeType contains 'video/')`
  );
  const orderBy = encodeURIComponent('modifiedTime desc');
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,size,modifiedTime)&orderBy=${orderBy}&pageSize=100`,
    { headers: gapiHeaders(token) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.files || []).map((f) => ({
    id: f.id,
    name: f.name,
    size: Number(f.size || 0),
    modified: new Date(f.modifiedTime).getTime(),
  }));
}

/** Muat turun kandungan fail audio dari Google Drive. Kembalikan Blob. */
export async function gDriveDownload(token, fileId) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: gapiHeaders(token) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.blob();
}
