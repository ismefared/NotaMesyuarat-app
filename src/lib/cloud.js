/**
 * Klien storan awan WebDAV untuk NotaMesyuarat.
 * Sesuai dengan Nextcloud, ownCloud, atau mana-mana pelayan WebDAV.
 *
 * Konfigurasi disimpan dalam localStorage pelayar sahaja.
 * Rujukan protokol: RFC 4918 (PROPFIND, PUT, GET).
 */

const CFG_KEY = 'notamesyuarat:cloud';

const DEFAULT_CFG = {
  cloudType: 'webdav', // 'webdav' | 'gdrive'
  baseUrl: '',
  username: '',
  password: '',
  folder: 'notamesyuarat',
  autoUpload: false,
  gdriveClientId: '',
  searchAll: false, // GDrive: cari keseluruhan Drive, bukan hanya folder app
};

export function getCloudConfig() {
  try {
    return { ...DEFAULT_CFG, ...JSON.parse(localStorage.getItem(CFG_KEY)) };
  } catch {
    return { ...DEFAULT_CFG };
  }
}

export function saveCloudConfig(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
}

function joinUrl(base, folder, name) {
  const parts = [base.replace(/\/+$/, '')];
  if (folder) parts.push(folder.replace(/^\/+|\/+$/g, ''));
  if (name) parts.push(name.split('/').map(encodeURIComponent).join('/'));
  return parts.join('/');
}

function dirUrl(cfg) {
  const url = joinUrl(cfg.baseUrl, cfg.folder, '');
  return url.endsWith('/') ? url : `${url}/`;
}

function authHeaders(cfg, extra = {}) {
  const h = { ...extra };
  if (cfg.username) {
    h.Authorization = `Basic ${btoa(`${cfg.username}:${cfg.password}`)}`;
  }
  return h;
}

/** Uji sambungan ke folder awan. Kembalikan true jika OK, atau bentol ralat. */
export async function testCloud(cfg) {
  if (cfg.cloudType === 'gdrive') {
    const { getAccessToken, ensureGDriveFolder, scopeFor } = await import('./gdrive');
    if (!cfg.gdriveClientId) {
      throw new Error('Masukkan Google OAuth Client ID dahulu.');
    }
    const token = await getAccessToken(cfg.gdriveClientId, scopeFor(!!cfg.searchAll));
    await ensureGDriveFolder(token);
    return true;
  }
  const res = await fetch(dirUrl(cfg), {
    method: 'PROPFIND',
    headers: authHeaders(cfg, { Depth: '0' }),
  });
  if (res.status === 404) {
    throw new Error('Folder tidak dijumpai. Cuba buat folder tersebut dahulu di pelayan awan anda.');
  }
  if (res.status === 401) {
    throw new Error('Kredensial salah (HTTP 401).');
  }
  if (!res.ok && res.status !== 207) {
    throw new Error(`HTTP ${res.status}`);
  }
  return true;
}

/** Muat naik blob ke folder awan, ikut jenis awan. Kembalikan penanda fail. */
export async function uploadToCloud(blob, filename, cfg) {
  if (cfg.cloudType === 'gdrive') {
    const { getAccessToken, ensureGDriveFolder, gDriveUpload } = await import('./gdrive');
    const token = await getAccessToken(cfg.gdriveClientId, scopeFor(!!cfg.searchAll));
    const folderId = await ensureGDriveFolder(token);
    const id = await gDriveUpload(token, folderId, blob, filename);
    return `gdrive:${id}`;
  }
  const url = joinUrl(cfg.baseUrl, cfg.folder, filename);
  const res = await fetch(url, {
    method: 'PUT',
    headers: authHeaders(cfg, {
      'Content-Type': blob.type || 'application/octet-stream',
    }),
    body: blob,
  });
  if (!res.ok && res.status !== 201 && res.status !== 204) {
    throw new Error(`HTTP ${res.status}`);
  }
  return url;
}

const AUDIO_EXT = /\.(mp3|m4a|wav|webm|ogg|oga|mp4|mov|aac|flac)$/i;

/** Pautkan folder awan untuk dibuka dalam tab pelayar.
 *  WebDAV: URL folder terus. GDrive: URL antara muka web Drive. */
export async function getCloudFolderWebUrl(cfg) {
  if (cfg.cloudType === 'gdrive') {
    const { getAccessToken, ensureGDriveFolder } = await import('./gdrive');
    if (!cfg.gdriveClientId) throw new Error('Masukkan Google OAuth Client ID dahulu.');
    const token = await getAccessToken(cfg.gdriveClientId, scopeFor(!!cfg.searchAll));
    const folderId = await ensureGDriveFolder(token);
    return `https://drive.google.com/drive/folders/${folderId}`;
  }
  return dirUrl(cfg);
}

/** Adakah awan telah dikonfigurasi mengikut jenisnya? */
export function isCloudConfigured(cfg) {
  if (cfg.cloudType === 'gdrive') return !!cfg.gdriveClientId;
  return !!cfg.baseUrl;
}

/** Senarai fail audio dalam folder awan (WebDAV atau Google Drive). */
export async function listCloudFiles(cfg) {
  if (cfg.cloudType === 'gdrive') {
    const { getAccessToken, ensureGDriveFolder, gDriveList, gDriveSearchAll, scopeFor } = await import('./gdrive');
    if (!cfg.gdriveClientId) throw new Error('Masukkan Google OAuth Client ID dahulu.');
    const token = await getAccessToken(cfg.gdriveClientId, scopeFor(!!cfg.searchAll));
    if (cfg.searchAll) return await gDriveSearchAll(token);
    const folderId = await ensureGDriveFolder(token);
    return await gDriveList(token, folderId);
  }
  const res = await fetch(dirUrl(cfg), {
    method: 'PROPFIND',
    headers: authHeaders(cfg, { Depth: '1' }),
  });
  if (res.status === 401) throw new Error('Kredensial salah (HTTP 401).');
  if (!res.ok && res.status !== 207) throw new Error(`HTTP ${res.status}`);

  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const responses = [...doc.getElementsByTagName('*')].filter(
    (el) => el.localName === 'response'
  );

  const files = [];
  for (const rEl of responses) {
    const isCollection = [...rEl.getElementsByTagName('*')].some(
      (el) => el.localName === 'collection'
    );
    if (isCollection) continue;

    const hrefEl = [...rEl.children].find((c) => c.localName === 'href');
    if (!hrefEl) continue;
    const href = decodeURIComponent(hrefEl.textContent);
    const name = href.replace(/\/+$/, '').split('/').pop();
    if (!name || !AUDIO_EXT.test(name)) continue;

    let size = 0;
    let modified = 0;
    for (const el of rEl.getElementsByTagName('*')) {
      if (el.localName === 'getcontentlength') size = Number(el.textContent);
      if (el.localName === 'getlastmodified') {
        modified = new Date(el.textContent).getTime();
      }
    }
    const fullHref = href.startsWith('http') ? href : new URL(href, cfg.baseUrl).href;
    files.push({ name, size, modified, href: fullHref });
  }
  files.sort((a, b) => b.modified - a.modified);
  return files;
}

/** Muat turun satu fail dari awan dengan indikator kemajuan.
 *  `fileRef` = URL WebDAV atau 'gdrive:<id>'. `onProgress(percent)` pilihan.
 *  Kembalikan Blob. */
export async function downloadFromCloud(fileRef, cfg, onProgress) {
  let url = fileRef;
  let headers = {};
  if (fileRef.startsWith('gdrive:')) {
    const { getAccessToken, gapiHeaders, scopeFor } = await import('./gdrive');
    const token = await getAccessToken(cfg.gdriveClientId, scopeFor(!!cfg.searchAll));
    headers = gapiHeaders(token);
    url = `https://www.googleapis.com/drive/v3/files/${fileRef.slice(7)}?alt=media`;
  } else {
    headers = authHeaders(cfg);
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const total = Number(res.headers.get('Content-Length')) || 0;
  // Tanpa stream (atau saiz tak diketahui) — terus ke Blob penuh
  if (!res.body || !total) {
    return await res.blob();
  }

  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(Math.round((received / total) * 100));
  }
  return new Blob(chunks, { type: res.headers.get('Content-Type') || 'application/octet-stream' });
}
