# Laporan Pelaksanaan Ujian — NotaMesyuarat

Tarikh: 16 November 2026 · Binaan produksi (`npm run build` → `npm run preview:4173`)
Alat: Playwright 1.59.1 (Chromium, WebKit, Firefox), Vitest 5.1, axe-core 4.10.2, npm audit

## 1. Ringkasan eksekutif

| Kategori | Dijalankan | Lulus | Gagal | Disekat |
|---|---|---|---|---|
| Regresi fungsional (Chromium) | 20 | 18 | 0 (2 artifak skrip, disahkan PASS secara terarah) | 0 |
| Batasan diketahui (KL suite) | 6 | 5 | 0 | 1 (KL-008 mic) |
| Silang pelayar (Chromium/WebKit/Firefox) | 12 | 12 | 0 | 0 |
| Ujian unit (Vitest) | 9 | 9 | 0 | 0 |
| Integrasi API (intercept) | 4 | 4 | 0 | 0 |
| Aksesibiliti (axe-core) | 4 imbasan | 4 | 0 | 0 |
| Prestasi (navigation timing) | 3 larian | — | — | — |

## 2. Regresi fungsional — hasil

Sumber: `audit/test-cases/browser-test-results.json`, log `audit/evidence/logs/run-v5-final.log`.

- **18 PASS** termasuk: muat naik, ralat fail tidak sah, OpenCode tanpa kunci, jana nota, eksport PDF/Word/MD, simpan, dedup, kekalan data, buka, butang mati dibuang, padam dengan pengesahan, tema, modal, 5 viewport responsif.
- **TC-06 & TC-17**: kegagalan skrip ujian yang diketahui (pemilih/teks); disahkan **PASS** melalui ujian terarah — transkripsi Whisper e2e mara ke langkah Nota, ralat WebDAV memaparkan "Sambungan gagal".
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

`npx vitest run`: **9/9 PASS** (2 fail ujian) — `minutes.js` (seksyen minit/skop, butiran, kes tepi) dan `exporters.js` (markdown→HTML, pengekodan XSS, senarai/pengepala).

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
2. OpenCode e2e dengan kredensial sebenar (KL-006).
3. Google Drive e2e dengan OAuth Client ID (KL-007).
4. Audio panjang sebenar (>1 jam) — tidak diuji; had masa/memori.
5. Lighthouse/Core Web Vitals medan (KL-009) — diganti metrik setempat.
6. Ujian WebKit/Firefox hanya smoke 4 kriteria, bukan suite penuh.
