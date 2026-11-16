# Changelog Audit — NotaMesyuarat

## 13 November 2026 — Audit AIAAA v1.0.0 (garis dasar)

- Fasa 1 (penemuan): repositori diinventori penuh — 4,508 baris sumber, 15 modul.
- Binaan produksi disahkan lulus (`npm run build`).
- Fasa 3 (fungsional): 20 kes Playwright dijalankan terhadap binaan preview;
  15 PASS, 3 FAIL, 2 PASS-dengan-nota. TC-06 (Whisper e2e) dan TC-17 (ralat
  WebDAV) disemak semula secara terarah dan disahkan PASS — kegagalan awal
  ialah ralat skrip ujian, bukan ralat aplikasi.
- Fasa 4 (keselamatan): semakan defensif statik; tiada kerentanan terbukti
  boleh-eksploit; 4 kerentanan dependensi direkodkan.
- 11 kecacatan didaftarkan (1 HIGH: maybeAutoUpload tiada definisi).
- Papan pemuka HTML dijana. Keputusan: READY WITH CONDITIONS.
- Tiada kod sumber aplikasi diubah semasa audit (read-only dipatuhi).
- Artifak ujian (audit/) sahaja yang dicipta.

## 13 November 2026 — Pelaksanaan Fasa 0–2 (diluluskan)

### Fasa 0
- **DEF-FUNC-001 (P1)**: `maybeAutoUpload` dipulihkan dalam App.jsx — auto-upload awan berfungsi semula; tiada ReferenceError (disahkan: 0 pageerror pada regresi akhir).
- **DEF-PWA-006**: manifest PWA dikemas kini kepada NotaMesyuarat (nama, penerangan, theme_color).

### Fasa 1
- **DEF-UI-002**: `min-width: 0` pada `.step`, `.step-wrap`, `.mode-tab`, `.aside` — semua 5 viewport kini PASS tanpa overflow mengufuk.
- **DEF-UX-004**: dialog `window.confirm` sebelum padam (batal + sahkan diuji).
- **DEF-UX-003**: butang "Lihat semua" yang mati dibuang.
- **DEF-UX-008**: mesej status (cth. fail tidak disokong) kini dipaparkan pada langkah 1.

### Fasa 2
- **DEF-PERF-007**: `exporters.js` di-muat-lengai (dynamic import) — bundle utama 1,471 → 1,070 kB (gzip 424 → 294 kB).
- **SEC-003**: vite dinaik taraf 5.4.21 → 7.3.8 (esbuild moderate selesai). 2 high sharp/transformers tertangguh (breaking).
- **SEC-001 (mitigasi)**: CSP ditambah pada index.html. Nota: `script-src 'unsafe-eval'` diperlukan oleh ONNX Runtime Web (WASM); `connect-src https:` dibenarkan kerana app menyokong pelayan WebDAV pengguna.
- Ujian unit Vitest ditambah (9 ujian: minutes.js, exporters.js) + `vitest.config.js`.
- Aksesibiliti: navigasi anak panah pada semua tablist + perangkap fokus modal.
- `exporters.js`: ekspot `markdownToHTMLInternal` untuk ujian.

### Regresi akhir (Playwright, binaan produksi)
- 18 PASS, 0 FAIL fungsional. TC-06 (Whisper e2e) PASS melalui ujian terarah;
  TC-17 PASS (mesej "Sambungan gagal" disahkan). TC-10 (pendua Simpan, P3)
  tidak diubah — ditangguhkan mengikut laporan.
- `npm run build` lulus; `npx vitest run` 9/9 PASS.

### Fail diubah
- src/App.jsx, src/styles.css, index.html, public/manifest.webmanifest,
  src/lib/exporters.js
- Baharu: src/lib/minutes.test.js, src/lib/exporters.test.js, vitest.config.js
- package.json / package-lock.json (vite 7, vitest)

## 14 November 2026 — Kitaran Audit v2 (re-baseline, baca-sahaja)

- AIAAA diinisialisasi semula ke atas keadaan kod pasca-Fasa 0–2.
- Binaan lulus; Vitest 9/9; npm audit: 2 high tinggal (sharp/transformers).
- Re-baseline Playwright: 17 PASS, 1 PASS-dengan-nota (TC-10 P3 ditangguhkan),
  0 FAIL. TC-06 (Whisper e2e) dan TC-17 (ralat WebDAV) disahkan PASS melalui
  ujian terarah — kegagalan skrip diketahui, bukan ralat aplikasi.
- DEF-FUNC-001, DEF-UI-002, DEF-UX-003/004/008, DEF-PWA-006, DEF-PERF-007:
  pembetulan disahkan kekal (VERIFIED).
- Keputusan kitaran v2: **READY** (dengan 4 kecacatan terbuka berstatus
  tertangguh/tertunda — tiada penyekat pelepasan).
- Tiada kod sumber diubah semasa kitaran v2.

## 14 November 2026 — Kitaran v3: AUDIT PENUH (10 fasa)

- Fasa 1 Penemuan disahkan semula; 2 modul ujian baharu ditambah ke inventori.
- Fasa 2-3 Fungsional: 20 kes Playwright — 17 PASS, 1 PASS-dengan-nota
  (TC-10 P3 ditangguhkan), 0 FAIL; TC-06/TC-17 disahkan PASS melalui ujian terarah.
- Fasa 4 Keselamatan: semakan semula — maybeAutoUpload ditakrifkan, CSP aktif,
  escapeHTML kekal, SEC-002 kekal terbuka, 2 high dependensi tertangguh.
- Fasa 5-6 UX/Aksesibiliti: axe-core 4 imbasan — 3 PASS, 1 FAIL kritikal baharu
  (DEF-A11Y-009: tablist tanpa anak tab pada modal awan). Kontras token WCAG AA
  lulus semua (terendah 6.29:1).
- Fasa 7 Responsif: semua 5 viewport PASS tanpa overflow.
- Fasa 8 Prestasi: navigation timing median 3 larian — TTFB 3ms, Load 66ms,
  FirstPaint 24ms (binaan produksi tempatan); bundle utama 1,070 kB (294 kB gzip).
- Fasa 9 Integrasi: intercept rangkaian — OpenCode 401 dikendalikan (INT-01),
  nota AI mock 200 dipaparkan (INT-02), gugur ke extractive semasa 500 (INT-03),
  API key dikekalkan (INT-04). Semua PASS.
- Fasa 10 Pengesahan bebas: DEF-A11Y-009 disahkan melalui pemeriksaan kod
  (role tablist tanpa role tab). Tiada dapatan palsu baharu.
- Keputusan v3: **READY WITH CONDITIONS** — 1 kecacatan baharu (DEF-A11Y-009,
  MEDIUM) + 4 terbuka sedia ada. Baca-sahaya dipatuhi sepenuhnya.

## 14 November 2026 — Fasa Pelaksanaan AAERA (diluluskan)

- TASK-001 (SEC-002): skop OAuth minimum — drive.file lalai, cache sedar-skop.
- TASK-002 (DEF-A11Y-009): role=tab + aria-selected pada segmented modal — axe 0 critical.
- TASK-003 (DEF-FUNC-005): dedup Simpan (signature) — TC-10 lulus.
- TASK-004 (SEC-003): transformers v4.3.2 + CSP blob: — gerbang e2e lulus; npm audit 0.
- TASK-005: regresi penuh — 0 FAIL fungsional; Vitest 9/9.
- Keputusan: READY. 11 dapatan diverifikasi kumulatif, 0 terbuka
  (1 diterima risiko: SEC-001). Bundle utama ‑49% (1,471 → 754 kB).

## 16 November 2026 — Kitaran v5: AAERA/CAQA v2.0 (penyelesaian batasan manual)

- KL-001: Audio kini disimpan bersama rekod (IndexedDB, ArrayBuffer), dipulihkan
  dan dipadam bersama — VERIFIED (KL-001, KL-001b).
- KL-002: Tempoh audio fail muat naik dibaca dan dipaparkan — VERIFIED.
- KL-010 / DEF-DATA-012: Edit mesyuarat mengemas kini rekod sedia ada — VERIFIED.
- DEF-COMPAT-013 (baharu): WebKit menolak Blob dalam IndexedDB — dibetulkan
  dengan ArrayBuffer + ralat selamat-null; WebKit save=PASS.
- KL-005: WebKit & Firefox dipasang dan diuji — 12/12 semakan silang pelayar PASS.
- KL-008: Ujian rakaman mic automatik BLOCKED (getUserMedia menggantung dalam sandbox).
- KL-009: Lighthouse diganti navigation timing (TTFB 3ms, Load 47ms, FP 20ms median).
- Regresi: 18 PASS, 0 FAIL aplikasi; Vitest 9/9; npm audit 0.
- Manual pengguna v1.1 (MD + PDF 19 halaman) dikemas kini; aplikasi v0.2.0.
- 10 dokumen serahan dijana dalam docs/.
- Keputusan: READY WITH DOCUMENTED EXCEPTIONS.

## 16 November 2026 — Kitaran v6: ujian e2e kredensial sebenar

- Google Drive (token sebenar): 5/5 PASS — sambung, auto-upload, senarai,
  muat turun, pembersihan. Menemui & membetulkan DEF-INT-014 (`scopeFor`
  tidak diimport dalam uploadToCloud/getCloudFolderWebUrl).
- OpenCode (kunci sebenar): disekat luaran — 429 FreeUsageLimitError + respons
  tanpa CORS (OPTIONS 404) → "Failed to fetch". Didaftarkan DEF-INT-015
  (BLOCKED external), bukan ralat kod aplikasi.
- Versi aplikasi 0.2.1 (patch). Jumlah semakan: 62; 60 PASS; 0 gagal aplikasi;
  2 disekat (KL-008 mic, E2E-OC-01).

### Semakan semula akhir
- Pemilih skrip ujian TC-06/TC-17 dibetulkan — suite utama kini 20/20 PASS
  (sebelum ini dilaporkan sebagai artifak skrip).
- Jumlah muktamad: 62 semakan — 60 PASS, 0 gagal aplikasi, 2 disekat luaran.

## 16 November 2026 — Kitaran v7: kualiti audio & audio panjang (v0.3.0)

- KL-002 RESOLVED: audio >15 min dipecah automatik kepada segmen ~10 min,
  ditranskripsi berurutan dengan status bahagian X/Y; decode mono 16 kHz.
- KL-003 MITIGATED: panel kualiti (SNR/aras/senyap/clipping + tip) dan
  pilihan "Tingkatkan audio" (high-pass 100 Hz + normalisasi) on-device.
- Ujian: 19/19 unit (10 baharu audioTools); Q-01..Q-05 PASS; regresi 20/20.
- Pepijat enhancement ditemui oleh ujian unit (normalisasi guna puncak
  selepas tapisan) — dibetulkan sebelum keluaran.
- Manual NM-PG-001 v1.3 (21 halaman). Versi aplikasi 0.3.0.
