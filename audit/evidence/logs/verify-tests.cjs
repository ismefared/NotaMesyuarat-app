/* Sahkan semula TC-06 (transkripsi) dan TC-17 (ralat WebDAV) */
const { chromium } = require('/Users/mohdfaridshamsudin/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const AUDIT = '/Users/mohdfaridshamsudin/Documents/Default Project/NotaMesyuarat-app/audit';
const SHOTS = path.join(AUDIT, 'evidence/screenshots');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));

  // TC-06 semula
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.locator('.mode-tab').nth(1).click();
  await page.locator('input[type="file"]').setInputFiles(path.join(AUDIT, 'evidence', 'uji-audio.wav'));
  await page.waitForTimeout(400);
  await page.locator('.mode-tab').nth(0).click(); // On-device (langkah 2)
  await page.locator('#model-select').selectOption('tiny');
  await page.locator('button:has-text("Jana transkrip")').click();
  // Tunggu sehingga langkah 3 aktif ATAU status gagal/tiada suara
  await page.waitForFunction(
    () => document.querySelector('.step-3') !== null ||
      [...document.querySelectorAll('.step')].some(s => s.getAttribute('aria-current') === 'step' && s.textContent.includes('Nota')) ||
      /gagal|tiada suara/i.test(document.body.textContent)
      ? true : false,
    undefined, { timeout: 240000 }
  ).catch(() => {});
  await page.waitForTimeout(1000);
  const curStep = await page.locator('.step[aria-current="step"] .step-label').textContent().catch(() => 'tiada');
  const bodyText = await page.evaluate(() => document.body.textContent);
  const failed = /gagal/i.test(bodyText);
  console.log(`TC-06-RECHECK: langkah aktif="${curStep}", gagal=${failed}`);
  await page.screenshot({ path: path.join(SHOTS, 'TC-06_TRANSCRIBE_TINY.png'), fullPage: true });

  // TC-17 semula — WebDAV tak wujud
  await page.locator('button[aria-label="Tetapan awan"]').click();
  await page.locator('#c-url').fill('https://takwujud.contoh.invalid/remote.php/dav');
  await page.locator('#c-user').fill('uji');
  await page.locator('#c-pass').fill('lalalala');
  await page.locator('button:has-text("Uji sambungan")').click();
  await page.waitForFunction(
    () => /gagal/i.test(document.querySelector('.modal-body')?.textContent || ''),
    undefined, { timeout: 30000 }
  );
  // Ambil mesej pertama selepas "Gagal" (bukan hint statik)
  const modalText = await page.locator('.modal-body').textContent();
  const match = modalText.match(/Gagal[^.]*[.]?/);
  console.log(`TC-17-RECHECK: mesej="${match ? match[0].slice(0, 120) : 'tiada'}"`);
  await page.screenshot({ path: path.join(SHOTS, 'TC-17_WEBDAV_ERROR.png'), fullPage: true });

  console.log(`PageError semasa sesi: ${errs.length}: ${errs.slice(0,3).join(' | ')}`);
  await browser.close();
})();
