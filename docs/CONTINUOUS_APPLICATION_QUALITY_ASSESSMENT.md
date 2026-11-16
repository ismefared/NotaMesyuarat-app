# Penilaian Kualiti Aplikasi Berterusan (CAQA) — NotaMesyuarat

Tarikh: 16 November 2026 · Kitaran: **CAQA-1 selesai · CAQA-2 (pengesahan semula) selesai**
Skop: keseluruhan aplikasi (18 modul, UI, storan, integrasi, aksesibiliti, prestasi, keselamatan, dokumentasi)

## Kitaran 1 — DISCOVER → ASSESS → PRIORITIZE → IMPLEMENT → TEST → VALIDATE

### 1.1 Skop yang diperiksa

- Manual pengguna penuh (13 bahagian + lampiran), README, AGENTS.md, laporan audit v1–v3, daftar kecacatan.
- Semua modul sumber; laluan data IndexedDB/localStorage; integrasi OpenCode/Drive/WebDAV; service worker; manifest; CSP.
- Enjin pelayar: Chromium, WebKit, Firefox (baharu dipasang).

### 1.2 Dapatan

| ID | Klasifikasi | Dapatan | Keterukan | Root cause | Tindakan |
|---|---|---|---|---|---|
| KL-001 | Functional Gap | Audio tidak disimpan bersama rekod | P1 | Tiada penulisan blob ke IndexedDB | Dilaksanakan: simpan ArrayBuffer, pulihkan, padam bersama |
| KL-002 | Functional/Data | Tempoh fail muat naik sentiasa 0 | P2 | `durationSec = elapsed` sahaja | Dilaksanakan: `getAudioDuration()`, paparan saat/minit |
| KL-010 | Confirmed Defect | Edit mesyuarat → pendua baharu | P1 | `randomUUID()` setiap simpan | Dilaksanakan: `currentId`, update-in-place, `updatedAt`, susunan senarai |
| DEF-COMPAT-013 | Confirmed Defect (baru) | WebKit: simpan gagal (IDB tolak Blob); ralat `null` | P2 | WebKit tidak menyokong Blob dalam IDB; akses `err.message` tidak selamat | Dilaksanakan: ArrayBuffer + ralat selamat-null + audio gagal tidak menggagalkan nota |
| KL-005 | Test Gap | WebKit/Firefox tidak diuji | P2 | Enjin tiada | Dijalankan: 12/12 semakan lulus |
| KL-008 | Test Gap | Mic tidak diuji automatik | P2 | Sandbox mic | Percubaan; BLOCKED persekitaran |
| KL-009 | Tooling Gap | Tiada Lighthouse | P3 | Alat tiada | Diganti navigation timing |

### 1.3 Implementasi & fail terjejas

- `src/App.jsx` — simpan/pulih/padam audio, tempoh, update-in-place, petunjuk UI, ralat storan.
- `src/lib/recorder.js` — `getAudioDuration()`.
- `PANDUAN-PENGGUNA.md`, `docs/panduan-pengguna.print.html`, PDF v1.1.

### 1.4 Bukti ujian

- Regresi fungsional: 18 PASS, 0 FAIL aplikasi.
- KL suite: 5 PASS, 1 BLOCKED (mic).
- Silang pelayar: 12/12 PASS.
- Unit: 9/9 PASS.
- Tiada ralat JS aplikasi sepanjang sesi ujian.

### 1.5 Regresi

Tiada regresi. Semua pembetulan terdahulu (DEF-FUNC-001, DEF-UI-002, DEF-UX-003/004/008, DEF-PWA-006, DEF-PERF-007, DEF-A11Y-009, SEC-002/003) kekal VERIFIED.

## Kitaran 2 — PENILAIAN SEMULA INDEPENDEN

1. Semak semula kod selepas perubahan: tiada `Blob` disimpan terus ke IDB; semua akses ralat menggunakan optional chaining; audio gagal tidak menghalang simpan nota.
2. Jalankan semula suite penuh + KL + silang pelayar + unit — semua keputusan konsisten.
3. Semak dokumentasi vs tingkah laku: manual v1.1 sepadan (audio disimpan, edit mengemas kini, tempoh dipaparkan).
4. Semak semula risiko: tiada dapatan kritikal/tinggi baharu; tiada pendua dapatan.

**Kesimpulan kitaran 2:** tiada penemuan baharu bernilai tinggi yang selamat dilaksanakan dalam skop semasa.

## Dapatan terbuka / tertangguh

| ID | Klasifikasi | Sebab | Tindakan diperlukan |
|---|---|---|---|
| KL-008 | Test Gap | `getUserMedia` menggantung dalam sandbox | Jalankan ujian rakaman pada peranti sebenar |
| KL-006 | External Dependency | Perlu API key OpenCode | Uji e2e dengan kredensial pengguna |
| KL-007 | External Dependency | Perlu OAuth Client ID Drive | Uji e2e dengan kredensial pengguna |
| KL-009 | Tooling Gap | Lighthouse tiada | Jalankan Lighthouse dalam CI |
| KL-003/004 | Inherent | Ciri model / reka bentuk | Terima; didokumenkan |
| SEC-001 | Accepted Risk | Kredensial localStorage | CSP aktif; semak semula jika ancaman berubah |

## Risiko sisa

1. Audio dalam IndexedDB meningkatkan penggunaan storan; kuota pelayar boleh dicapai pada mesyuarat panjang. Mitigasi: amaran dokumentasi + ralat simpan audio tidak menggagalkan nota.
2. Ujian WebKit/Firefox adalah smoke, bukan suite penuh.
3. Integrasi luar (OpenCode/Drive) hanya disahkan melalui mock/ralat.
4. `unsafe-eval` dalam CSP diperlukan oleh ONNX Runtime — permukaan XSS kekal bergantung pada CSP script-src dan pengekodan output.

## Cadangan keluaran akan datang

1. Ujian e2e OpenCode & Drive menggunakan akaun ujian berasingan (rahsia dalam env, bukan repo).
2. Lighthouse CI + bajet saiz bundle.
3. Ujian rakaman mikrofon pada peranti sebenar (manual atau device farm).
4. Pertimbangkan pemampatan audio (Opus/bitrate rendah) sebelum simpan untuk menjimatkan kuota.
5. Pertimbangkan eksport/import arkib mesyuarat (JSON + audio) untuk migrasi peranti.

## Penilaian akhir

**Selesai dalam skop.** Semua batasan boleh tindak telah diselesaikan atau disekat dengan justifikasi; tiada kecacatan kritikal/tinggi terbuka; semua gerbang wajib lulus atau lulus dengan pengecualian didokumenkan. Aplikasi tidak didakwa "bebas kecacatan" — hanya disahkan dalam skop dan bukti yang direkodkan.
