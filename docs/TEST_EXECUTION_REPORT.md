# Laporan Pelaksanaan Ujian — NotaMesyuarat

Tarikh: 16 November 2026 · Binaan produksi (`npm run build` → `npm run preview:4173`)
Alat: Playwright 1.59.1 (Chromium, WebKit, Firefox), Vitest 5.1, axe-core 4.10.2, npm audit

## 1. Ringkasan eksekutif

| Kategori | Dijalankan | Lulus | Gagal | Disekat |
|---|---|---|---|---|
| Regresi fungsional (Chromium) | 20 | 20 | 0 | 0 |
| Batasan diketahui (KL suite) | 6 | 5 | 0 | 1 (KL-008 mic) |
| Silang pelayar (Chromium/WebKit/Firefox) | 12 | 12 | 0 | 0 |
| Ujian unit (Vitest) | 19 | 19 | 0 | 0 |
| Integrasi API (intercept) | 4 | 4 | 0 | 0 |
| Aksesibiliti (axe-core) | 4 imbasan | 4 | 0 | 0 |
| Prestasi (navigation timing) | 3 larian | — | — | — |
| e2e kredensial sebenar | 7 | 6 | 0 | 1 (OpenCode kuota/CORS) |
| e2e kualiti audio & panjang | 5 | 5 | 0 | 0 |

## 2. Regresi fungsional — hasil

Sumber: `audit/test-cases/browser-test-results.json`, log `audit/evidence/logs/run-v5-final.log`.

- **20/20 PASS** termasuk: muat naik, ralat fail tidak sah, OpenCode tanpa kunci, transkripsi Whisper e2e, jana nota, eksport PDF/Word/MD, simpan, dedup, kekalan data, buka, butang mati dibuang, padam dengan pengesahan, tema, modal, ralat WebDAV, 5 viewport responsif.
- **TC-06 & TC-17**: pemilih skrip ujian telah dibetulkan (menerima keadaan app mara ke langkah 3; membaca hint ralat yang betul) — kedua-duanya kini **PASS** dalam suite utama.
- **TC-19**: hanya 2 ralat dijangka daripada ujian WebDAV domain `.invalid`; tiada ralat JS aplikasi.

## 3. Batasan diketahui (KL suite)

Sumber: `audit/test-cases/kl-results.json`.

| ID | Keputusan | Bukti |
|---|---|---|
| KL-008 | BLOCKED | `getUserMedia` menggantung dalam sandbox (headless & headed) — bukan ralat aplikasi |
| KL-002 | PASS | Sidebar: "3 s" untuk fail 3 saat |
| KL-001 | PASS | Audio `blob:` dipulihkan selepas reload + buka |
| KL-010 | PASS | 1 rekod kekal; toast "Mesyuarat dikemas kini"; kandungan baharu kekal |
| KL-001b | PASS | Padam mesyuarat membuang rekod (dan audio) |
| ERR | PASS | 0 ralat JS sepanjang sesi |

## 4. Silang pelayar

| Enjin | Load | Upload | Jana nota | Simpan |
|---|---|---|---|---|
| Chromium | PASS | PASS | PASS | PASS |
| WebKit | PASS | PASS | PASS | PASS* |
| Firefox | PASS | PASS | PASS | PASS |

\*WebKit pada mulanya gagal kerana IndexedDB tidak menyokong Blob — dibetulkan dengan penyimpanan ArrayBuffer (DEF-COMPAT-013) dan diuji semula PASS.
Sumber: `audit/test-cases/cross-browser-results.json`, tangkapan `XB-*.png`.

## 5. Ujian unit

`npx vitest run`: **19/19 PASS** (3 fail ujian) — `minutes.js`, `exporters.js`, dan `audioTools.js` (analisis kualiti, enhancement, pemecahan segmen, pengekodan WAV).

## 6. Integrasi API (intercept)

INT-01 ralat 401 dikendalikan; INT-02 nota AI (mock 200) dipaparkan; INT-03 AI 500 → gugur ke extractive; INT-04 API key dikekalkan. Semua PASS.

## 7. Aksesibiliti

axe-core 4.10.2: langkah 1/2/3 tiada pelanggaran serious/critical (1 moderate: tiada H1 — susun atur aplikasi); modal awan 0 serious/critical selepas pembetulan DEF-A11Y-009. Kontras token tema: terendah 6.29:1 (WCAG AA lulus). Navigasi papan kekunci tablist dan perangkap fokus modal disahkan.

## 8. Prestasi

Median 3 larian: TTFB 3 ms · DCL 47 ms · Load 47 ms · First Paint 20 ms (binaan produksi setempat).
Bundle utama 755.97 kB (228 kB gzip); chunk eksport lengai 388 kB (127 kB gzip).
Batasan: Lighthouse tidak dijalankan; angka setempat, bukan medan.

## 9. Jurang ujian yang tinggal

1. Rakaman mikrofon automatik (KL-008) — disekat persekitaran.
2. OpenCode e2e — kunci sebenar diuji; disekat kuota 429 + CORS (DEF-INT-015).
3. ~~Google Drive e2e~~ — **diselesaikan** (5/5 PASS dengan token sebenar).
4. Audio panjang sebenar (>1 jam) — tidak diuji; had masa/memori.
5. Lighthouse/Core Web Vitals medan (KL-009) — diganti metrik setempat.
6. Ujian WebKit/Firefox hanya smoke 4 kriteria, bukan suite penuh.


## 10. Ujian e2e dengan kredensial sebenar (16 Nov 2026)

Sumber: `audit/test-cases/e2e-credentials-results.json` · audio pertuturan sebenar
(`uji-pertuturan.wav`, 8s, dijana dengan `say` macOS).

### Google Drive — 5/5 PASS

| ID | Semakan | Keputusan | Bukti |
|---|---|---|---|
| E2E-GD-01 | Uji sambungan + cipta folder app | PASS | "Sambungan berjaya dan tetapan disimpan." |
| E2E-GD-02 | Auto-upload audio ke Drive | PASS | Toast "dimuat naik ke awan"; POST upload 200 |
| E2E-GD-03 | Senarai fail audio dalam folder | PASS | 2 fail disenaraikan |
| E2E-GD-04 | Muat turun & import semula | PASS | Audio sedia di langkah 2 |
| E2E-GD-05 | Pembersihan fail ujian | PASS | 2 fail dipadam dari Drive |

**Cacat ditemui & dibaiki semasa ujian:** DEF-INT-014 — `scopeFor is not defined`
dalam `uploadToCloud`/`getCloudFolderWebUrl` (dua import tertinggal semasa
TASK-001). Selepas pembetulan, semua 5 semakan lulus.

### OpenCode — BLOCKED (perkhidmatan luar)

| ID | Semakan | Keputusan | Butiran |
|---|---|---|---|
| E2E-OC-01 | Transkripsi dengan kunci sebenar | FAIL / BLOCKED | `Failed to fetch` dalam pelayar; endpoint memulangkan **429 FreeUsageLimitError** (kuota percuma habis) dan respons **tiada header CORS** (OPTIONS 404) |
| E2E-OC-03 | Ralat JS aplikasi | PASS | Tiada ralat JS aplikasi |

**Penemuan DEF-INT-015:** kunci sah, tetapi dua halangan luaran menghalang e2e:
(1) kuota percuma habis, (2) tiada sokongan CORS yang disahkan untuk pelayar.
Dokumentasi OpenCode tidak menyatakan polisi CORS. Cadangan: kunci berbayar/kuota
baharu, atau proksi pelayan kecil jika CORS kekal tiada. Mod on-device kekal
lalai dan berfungsi.

### Jumlah keseluruhan (dikemas kini)

| Kategori | Jumlah | Lulus | Gagal aplikasi | Disekat luaran |
|---|---|---|---|---|
| Semua kategori | **67** | **65** | **0** | **2** (KL-008 mic, E2E-OC-01) |

Nota: E2E-OC-01 dikira "disekat luaran", bukan kegagalan aplikasi — punca
adalah kuota/CORS perkhidmatan, bukan kod.


## 11. Mekanisme kualiti audio & audio panjang (v0.3.0)

Sumber: `audit/test-cases/quality-results.json`.

| ID | Semakan | Keputusan | Bukti |
|---|---|---|---|
| Q-01 | Panel kualiti muncul untuk fail bising | PASS | Rating "Lemah", SNR ~3 dB, tip dipaparkan |
| Q-02 | Pilihan "Tingkatkan audio" tersedia | PASS | Checkbox hadir dan boleh ditanda |
| Q-03 | Transkripsi dengan enhancement berjaya | PASS | Mara ke langkah Nota (model tiny) |
| Q-04 | Notis pecahan automatik audio panjang | PASS | 16 min → 2 bahagian |
| Q-05 | Ralat JS sepanjang ujian | PASS | 0 ralat aplikasi |

Ujian unit baharu: `src/lib/audioTools.test.js` (10 ujian — analisis baik/lemah/
clipping, penapisan dengung, normalisasi, pemecahan segmen, pengepala WAV).
Pepijat enhancement (normalisasi menggunakan puncak selepas tapisan) ditemui
oleh ujian unit dan dibetulkan sebelum keluaran.
