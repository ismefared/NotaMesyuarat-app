/* Ujian pelayar audit — NotaMesyuarat (Playwright, Chromium).
 * Jalankan terhadap pelayan preview (dist). Hasil: JSON + screenshots.
 */
const { chromium } = require('/Users/mohdfaridshamsudin/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const AUDIT = '/Users/mohdfaridshamsudin/Documents/Default Project/NotaMesyuarat-app/audit';
const SHOTS = path.join(AUDIT, 'evidence/screenshots');
const BASE = 'http://localhost:4173';
const results = [];

function rec(id, name, status, note = '', evidence = '') {
  results.push({ id, name, status, note, evidence });
  console.log(`[${status}] ${id} ${name} — ${note}`);
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const consoleErrors = [];

  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  // TC-01 — aplikasi dimuat
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const title = await page.title();
  const brand = await page.locator('.wordmark-name').textContent();
  rec('TC-01', 'App dimuat / pengepala', brand === 'NotaMesyuarat' ? 'PASS' : 'FAIL',
    `title="${title}", brand="${brand}"`, 'TC-01_DASHBOARD_DESKTOP_LOAD.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-01_DASHBOARD_DESKTOP_LOAD.png'), fullPage: true });

  // TC-02 — langkah 2 & 3 terkunci awal
  const step2disabled = await page.locator('.step').nth(1).isDisabled();
  const step3disabled = await page.locator('.step').nth(2).isDisabled();
  rec('TC-02', 'Stepper terkunci sebelum input', step2disabled && step3disabled ? 'PASS' : 'FAIL',
    `step2 disabled=${step2disabled}, step3 disabled=${step3disabled}`);

  // TC-03 — muat naik fail tidak sah (.txt) → tiada audio block (status tak dipaparkan pada langkah 1)
  const txtPath = path.join(AUDIT, 'evidence', 'bukan-audio.txt');
  fs.writeFileSync(txtPath, 'ini bukan audio');
  await page.locator('.mode-tab').nth(1).click();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(txtPath);
  await page.waitForTimeout(500);
  const audioBlockShown = await page.locator('.audio-block').count();
  const statusText1 = await page.locator('.content .hint, .content .status').allTextContents();
  rec('TC-03', 'Fail tidak sah ditolak + status dilihat?', audioBlockShown === 0 ? 'PASS' : 'FAIL',
    `audio-block muncul=${audioBlockShown}; status dilihat pada langkah 1: ${JSON.stringify(statusText1).slice(0, 160)}`,
    'TC-03_UPLOAD_INVALID_TXT.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-03_UPLOAD_INVALID_TXT.png'), fullPage: true });

  // TC-04 — muat naik WAV sah → audio block + langkah 2 terbuka
  const wavPath = path.join(AUDIT, 'evidence', 'uji-audio.wav');
  await fileInput.setInputFiles(wavPath);
  await page.waitForTimeout(500);
  const audioCount = await page.locator('.audio-block audio, .loaded-file audio').count();
  const step2enabled = !(await page.locator('.step').nth(1).isDisabled());
  rec('TC-04', 'Muat naik WAV sah', audioCount === 1 && step2enabled ? 'PASS' : 'FAIL',
    `audio element=${audioCount}, step2 enabled=${step2enabled}`, 'TC-04_UPLOAD_WAV.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-04_UPLOAD_WAV.png'), fullPage: true });

  // TC-05 — OpenCode transkripsi tanpa API key → mesej ralat dilihat (langkah 2)
  await page.locator('.step').nth(1).click();
  await page.locator('.mode-tab').nth(1).click(); // tab OpenCode
  await page.locator('button:has-text("Jana transkrip")').click();
  await page.waitForTimeout(400);
  const step2status = await page.locator('.content .hint.status-animated').textContent();
  rec('TC-05', 'OpenCode tanpa API key → ralat jelas', /API key/i.test(step2status || '') ? 'PASS' : 'FAIL',
    `status="${(step2status || '').trim()}"`, 'TC-05_OPENCODE_NO_KEY.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-05_OPENCODE_NO_KEY.png'), fullPage: true });

  // TC-06 — transkripsi on-device (model tiny) — best-effort, requires network
  let tc06 = 'BLOCKED', tc06note = 'tidak dijalankan';
  try {
    await page.locator('.mode-tab').nth(0).click(); // On-device
    await page.locator('#model-select').selectOption('tiny');
    await page.locator('button:has-text("Jana transkrip")').click();
    await page.waitForFunction(
      () => {
        const ta = document.querySelector('.content textarea.transcript');
        if (!ta) return true; // app mara ke langkah 3 selepas transkripsi berjaya
        if (ta.value.length > 0) return true;
        const st = document.querySelector('.content .hint.status-animated')?.textContent || '';
        return /gagal|tiada suara/i.test(st);
      },
      undefined,
      { timeout: 240000 }
    );
    const hasTa = await page.locator('.content textarea.transcript').count();
    const tr = hasTa ? await page.locator('.content textarea.transcript').inputValue() : '';
    const st = await page.locator('.content .hint.status-animated').textContent().catch(() => '');
    const atNotes = await page.locator('.content textarea.minutes').count();
    tc06 = tr.length > 0 || /tiada suara/i.test(st || '') || atNotes === 1 ? 'PASS' : 'FAIL';
    tc06note = `panjang transkrip=${tr.length}, langkah nota=${atNotes === 1}, status="${(st || '').trim().slice(0, 60)}"`;
  } catch (e) {
    tc06note = `gagal: ${String(e).slice(0, 140)}`;
  }
  rec('TC-06', 'Transkripsi Whisper on-device (tiny)', tc06, tc06note, 'TC-06_TRANSCRIBE_TINY.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-06_TRANSCRIBE_TINY.png'), fullPage: true });

  // TC-07 — isi transkrip secara sintetik → langkah 3 → jana nota extractive
  const sample = [
    'Terima kasih semua hadir. Mesyuarat ini untuk membincangkan sistem e-Perolehan baharu.',
    'Keputusan: pihak jabatan bersetuju melaksanakan modul e-Perolehan fasa satu tahun ini.',
    'Encik Ali akan sedikan draf keperluan sebelum hujung bulan.',
    'Puan Siti perlu hantar permohonan bajet kepada unit kewangan minggu depan.',
    'Kita juga perlu kemaskini polisi keselamatan data mengikut piawaian terkini.',
    'Sekian, mesyuarat ditangguhkan dengan penuh kesyukuran.',
  ].join(' ');
  // Jika transkripsi berjaya, app dah di langkah 3 — kembali ke langkah 2
  if ((await page.locator('.content textarea.transcript').count()) === 0) {
    await page.locator('.step').nth(1).click();
  }
  await page.locator('.content textarea.transcript').fill(sample);
  const nextBtn = page.locator('button:has-text("Teruskan ke nota")');
  if (await nextBtn.count()) await nextBtn.click();
  await page.locator('button:has-text("Jana nota")').click();
  await page.waitForFunction(() => {
    const v = document.querySelector('.content textarea.minutes')?.value || '';
    return v.includes('# Minit Mesyuarat');
  }, undefined, { timeout: 15000 });
  const minutesText = await page.locator('.content textarea.minutes').inputValue();
  rec('TC-07', 'Jana nota extractive (minit)', minutesText.includes('## Keputusan') && minutesText.includes('## Tindakan') ? 'PASS' : 'FAIL',
    `panjang nota=${minutesText.length}, ada seksyen Keputusan/Tindakan`, 'TC-07_MINIT_GENERATED.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-07_MINIT_GENERATED.png'), fullPage: true });

  // TC-08 — eksport PDF / Word / Markdown / salin
  const downloads = [];
  page.on('download', (d) => downloads.push(d.suggestedFilename()));
  await page.locator('button:has-text("PDF")').click();
  await page.locator('button:has-text("Word")').click();
  await page.locator('button:has-text("Markdown")').click();
  await page.waitForTimeout(1200);
  rec('TC-08', 'Eksport PDF/Word/Markdown', downloads.length >= 3 ? 'PASS' : 'FAIL',
    `fail dimuat turun: ${downloads.join(', ')}`);

  // TC-09 — simpan mesyuarat → toast + sidebar
  await page.locator('button:has-text("Simpan")').click();
  await page.waitForTimeout(600);
  const toast = await page.locator('.toast').textContent().catch(() => null);
  const items = await page.locator('.meeting-item:not(.skeleton-meeting)').count();
  rec('TC-09', 'Simpan mesyuarat', /disimpan/i.test(toast || '') && items >= 1 ? 'PASS' : 'FAIL',
    `toast="${toast}", item sidebar=${items}`, 'TC-09_SAVED.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-09_SAVED.png'), fullPage: true });

  // TC-10 — simpan lagi sekali → dedup (pembetulan DEF-FUNC-005)
  await page.locator('button:has-text("Simpan")').click().catch(() => {});
  await page.waitForTimeout(600);
  const items2 = await page.locator('.meeting-item:not(.skeleton-meeting)').count();
  const saveDisabled = await page.locator('button:has-text("Simpan")').isDisabled().catch(() => 'tiada-butang');
  rec('TC-10', 'Simpan berulang → tiada pendua (dedup)', items2 === items ? 'PASS' : 'FAIL',
    `item sebelum=${items}, selepas=${items2}, butang dilumpuhkan=${saveDisabled}`);

  // TC-11 — kekal selepas muat semula (IndexedDB)
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const persisted = await page.locator('.meeting-item:not(.skeleton-meeting)').count();
  rec('TC-11', 'Data kekal selepas muat semula', persisted >= 1 ? 'PASS' : 'FAIL', `item=${persisted}`);

  // TC-12 — buka mesyuarat tersimpan
  await page.locator('.meeting-item .kebab-wrap button').first().click();
  await page.locator('.kebab-menu button:has-text("Buka")').click();
  await page.waitForTimeout(500);
  const minutesReopened = (await page.locator('.content textarea.minutes').inputValue()).length;
  rec('TC-12', 'Buka mesyuarat tersimpan', minutesReopened > 0 ? 'PASS' : 'FAIL', `panjang nota=${minutesReopened}`);

  // TC-13 — butang "Lihat semua" telah dibuang (pembetulan DEF-UX-003)
  const lihatBtn = await page.locator('button:has-text("Lihat semua")').count();
  rec('TC-13', '"Lihat semua" dibuang (pembetulan)', lihatBtn === 0 ? 'PASS' : 'FAIL',
    `bilangan butang=${lihatBtn} — butang mati tidak lagi wujud`);

  // TC-14 — padam dengan pengesahan (pembetulan DEF-UX-004)
  const beforeDel = await page.locator('.meeting-item:not(.skeleton-meeting)').count();
  page.once('dialog', (d) => d.dismiss()); // Batal — tiada pemadaman
  await page.locator('.meeting-item .kebab-wrap button').first().click();
  await page.locator('.kebab-menu button:has-text("Padam")').click();
  await page.waitForTimeout(500);
  const afterCancel = await page.locator('.meeting-item:not(.skeleton-meeting)').count();
  page.once('dialog', (d) => d.accept()); // Sahkan pemadaman
  await page.locator('.meeting-item .kebab-wrap button').first().click();
  await page.locator('.kebab-menu button:has-text("Padam")').click();
  await page.waitForTimeout(500);
  const afterDel = await page.locator('.meeting-item:not(.skeleton-meeting)').count();
  rec('TC-14', 'Padam dengan pengesahan (batal + sahkan)',
    afterCancel === beforeDel && afterDel === beforeDel - 1 ? 'PASS' : 'FAIL',
    `sebelum=${beforeDel}, selepas batal=${afterCancel}, selepas sahkan=${afterDel}`);

  // TC-15 — tema gelap
  await page.locator('.theme-option:has-text("Gelap")').click();
  const themeDark = await page.evaluate(() => document.documentElement.dataset.theme);
  rec('TC-15', 'Tema gelap diaktifkan', themeDark === 'dark' ? 'PASS' : 'FAIL', `data-theme=${themeDark}`,
    'TC-15_DARK_THEME.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-15_DARK_THEME.png'), fullPage: true });
  await page.locator('.theme-option:has-text("Sistem")').click();

  // TC-16 — modal awan: buka/tutup dengan Escape
  await page.locator('button[aria-label="Tetapan awan"]').click();
  await page.waitForTimeout(300);
  const modalVisible = await page.locator('.modal').count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const modalClosed = (await page.locator('.modal').count()) === 0;
  rec('TC-16', 'Modal awan buka/tutup (Escape)', modalVisible === 1 && modalClosed ? 'PASS' : 'FAIL',
    `modal terbuka=${modalVisible}, tertutup dengan Escape=${modalClosed}`, 'TC-16_CLOUD_MODAL.png');
  await page.screenshot({ path: path.join(SHOTS, 'TC-16_CLOUD_MODAL.png'), fullPage: true });

  // TC-17 — ralat sambungan WebDAV dikendalikan
  await page.locator('button[aria-label="Tetapan awan"]').click();
  await page.locator('#c-url').fill('https://takwujud.contoh.invalid/remote.php/dav');
  await page.locator('#c-user').fill('uji');
  await page.locator('#c-pass').fill('lalalala');
  await page.locator('button:has-text("Uji sambungan")').click();
  await page.waitForFunction(() => /gagal/i.test(document.querySelector('.modal .hint')?.textContent || ''), { timeout: 20000 });
  const hints = await page.locator('.modal .hint').allTextContents();
  const cloudErr = hints.find((h) => /gagal/i.test(h)) || hints[hints.length - 1] || '';
  rec('TC-17', 'Ralat WebDAV dikendalikan dengan mesej jelas', /gagal/i.test(cloudErr || '') ? 'PASS' : 'FAIL',
    `mesej="${(cloudErr || '').trim().slice(0, 100)}"`);
  await page.keyboard.press('Escape');

  // TC-18 — responsive: screenshots + overflow mengufuk
  for (const vp of [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1366x768', width: 1366, height: 768 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '390x844', width: 390, height: 844 },
    { name: '360x800', width: 360, height: 800 },
  ]) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() =>
      document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth + 1);
    rec(`TC-18-${vp.name}`, `Overflow mengufuk @${vp.name}`, overflow ? 'FAIL' : 'PASS',
      `scrollWidth>clientWidth=${overflow}`, `TC-18_RESPONSIVE_${vp.name.replace('x', 'x')}.png`);
    await page.screenshot({ path: path.join(SHOTS, `TC-18_RESPONSIVE_${vp.name}.png`), fullPage: true });
  }

  // TC-19 — ralat konsol
  rec('TC-19', 'Ralat konsol pelayar', consoleErrors.length === 0 ? 'PASS' : 'WARN',
    `${consoleErrors.length} ralat: ${consoleErrors.slice(0, 5).join(' | ').slice(0, 300)}`);

  await browser.close();
  fs.writeFileSync(path.join(AUDIT, 'test-cases', 'browser-test-results.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), browser: 'chromium (playwright 1.59.1)', baseUrl: BASE, results }, null, 2));
  console.log('SELESAI — hasil ditulis ke audit/test-cases/browser-test-results.json');
})();
