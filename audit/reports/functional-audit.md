# Laporan Audit Fungsional — NotaMesyuarat

Tarikh: 13 Nov 2026 · Kaedah: Playwright (Chromium) terhadap binaan produksi + semakan kod
Hasil penuh: `../test-cases/browser-test-results.json`

## Ringkasan

Aliran kerja teras (input audio → transkripsi → nota → simpan → buka → eksport)
**berfungsi hujung-ke-hujung**, termasuk transkripsi Whisper on-device sebenar.
Satu pepijat fungsional tahap tinggi (auto-upload rosak) dan beberapa isu UX
fungsional ditemui.

## Apa yang disahkan BERFUNGSI (dengan bukti)

| Fungsi | Bukti |
|---|---|
| Pemuatan app, stepper terkunci awal | TC-01, TC-02 |
| Penolakan fail bukan-audio | TC-03 |
| Muat naik WAV → auto-lompat langkah 2, pemain audio | TC-04 + tangkapan skrin |
| Ralat jelas bila OpenCode tiada API key | TC-05 |
| Transkripsi Whisper e2e (model tiny, muat model + inferens) | TC-06 ujian susulan — app mara ke langkah Nota |
| Jana nota extractive dengan seksyen lengkap | TC-07 (946 aksara) |
| Eksport PDF, Word, Markdown | TC-08 (3 fail dimuat turun) |
| Simpan ke IndexedDB + toast + sidebar | TC-09 |
| Kekekalan data selepas muat semula | TC-11 |
| Buka mesyuarat tersimpan | TC-12 |
| Tema gelap | TC-15 |
| Modal awan: buka/tutup Escape | TC-16 |
| Ralat WebDAV dikendalikan dengan mesej | TC-17 (disahkan semula) |

## Pepijat fungsional

1. **DEF-FUNC-001 (HIGH, P1)** — `maybeAutoUpload` tidak ditakrifkan.
   ReferenceError pada setiap rakaman selesai/muat naik; ciri auto-upload awan
   (checkbox dengan janji UI) tidak berfungsi langsung.
2. **DEF-FUNC-005 (LOW, P3)** — Simpan berulang menghasilkan pendua tanpa amaran.
3. **DEF-UX-008 (LOW, P3)** — Mesej gagal muat naik tidak dirender pada langkah 1.

## Senario tidak diuji / disekat

- Rakaman mikrofon sebenar (getUserMedia) — kod disemak statik; `stop()`
  mengendalikan pembersihan stream/audiocontext dengan betul.
- OpenCode transkripsi/jana nota e2e (perlu API key sebenar). Laluan gugur ke
  kaedah pantas apabila AI gagal disahkan melalui bacaan kod (App.jsx:359-382)
  — reka bentuk gugur yang baik.
- Google Drive e2e (perlu OAuth Client ID).
- Model Whisper base/small — model sama seperti tiny pada laluan kod sama.

## Penilaian kebolehpercayaan aliran

Gugur dan pengendalian ralat konsisten: setiap operasi tak segerak membungkus
try/catch, menyampaikan mesej Bahasa Melayu kepada pengguna, dan tidak
membiarkan UI tergantung (`finally { setBusy(null) }`). Kualiti ini di atas
purata untuk app sebesar ini.
