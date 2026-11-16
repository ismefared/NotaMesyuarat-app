# Laporan Audit Aplikasi — NotaMesyuarat (Kitaran v5)

Tarikh: 16 November 2026 · Baseline: `ff2bd3c` → pelaksanaan v5
Kaedah: AIAAA v3 (10 fasa), AAERA, CAQA v2.0 · Baca-sahaja untuk audit; pelaksanaan berasingan.

## 1. Gambaran aplikasi

SPA klien-penuh (React 18 + Vite 7, PWA). Tiada backend. Storan: IndexedDB (mesyuarat + audio), localStorage (tetapan/kredensial). Integrasi opt-in: OpenCode (Gemini/model teks), Google Drive REST v3 (OAuth GIS), WebDAV. Transkripsi on-device: Whisper ONNX (transformers.js v4).

## 2. Modul (18)

| Modul | Baris | Penilaian |
|---|---|---|
| `src/App.jsx` | ~1,330 | Teras aliran 3 langkah; kini termasuk simpan audio, dedup, edit-in-place, aksesibiliti |
| `src/lib/whisper.js` | 137 | On-device ASR; pembersihan halusinasi; 6 bahasa |
| `src/lib/opencode.js` | 160 | Gateway AI; pengendalian ralat HTTP |
| `src/lib/recorder.js` | 118 | MediaRecorder + AnalyserNode + `getAudioDuration()` baharu |
| `src/lib/minutes.js` | 180 | Penjana extractive luar talian |
| `src/lib/exporters.js` | 145 | PDF/Word; escape HTML; dimuat lengai |
| `src/lib/cloud.js` | 212 | WebDAV/Drive; skop OAuth minimum |
| `src/lib/gdrive.js` | 240 | OAuth + Drive REST; cache token sedar-skop |
| `src/lib/prompts.js` | 39 | Prompt BM |
| `components/*` | ~500 | Feedback, ikon, panel zikir |
| `public/sw.js`, `manifest` | 35 | PWA; manifest betul |
| `index.html` | 18 | CSP; metadata |
| Ujian (`*.test.js`, `vitest.config.js`) | ~150 | 9 ujian unit |

## 3. Penemuan mengikut dimensi

### 3.1 Fungsional
- Semua aliran teras lulus (20 kes; rujuk `TEST_EXECUTION_REPORT.md`).
- **Baharu diselesaikan**: audio disimpan & dipulihkan (KL-001); tempoh fail betul (KL-002); edit mesyuarat mengemas kini rekod (KL-010).
- Laluan ralat: muat naik tidak sah, tiada API key, 401, 500, WebDAV gagal, kuota storan — semuanya memberi mesej BM yang jelas.

### 3.2 Integrasi
- OpenCode: kontrak 401/200/500 diuji melalui intercept; gugur ke extractive berfungsi.
- WebDAV: ralat rangkaian dikendalikan; Basic auth daripada localStorage (diterima risiko).
- Drive: skop minimum (`drive.file`) lalai, skop penuh hanya `searchAll`; e2e tidak diuji (tiada Client ID).

### 3.3 Data
- IndexedDB: rekod mesyuarat + audio (ArrayBuffer); padam membersihkan kedua-duanya.
- **Cacat ditemui & dibetulkan**: WebKit menolak Blob dalam IDB → simpan sebagai ArrayBuffer (DEF-COMPAT-013).
- Tiada pendua semasa simpan berulang atau semasa edit.

### 3.4 UX / Aksesibiliti
- Tiada overflow pada 5 viewport; tema gelap/cerah; skeleton/pemuatan/empty state lengkap.
- axe: 0 serious/critical selepas pembetulan modal; kontras AA.
- Tablist boleh dinavigasi dengan anak panah; modal memerangkap fokus.

### 3.5 Prestasi
- Bundle utama 755.97 kB (228 kB gzip) — turun 49% berbanding baseline 1,471 kB.
- Median Load 47 ms setempat; model ASR dimuat atas permintaan.

### 3.6 Keselamatan
- `npm audit`: 0 kerentanan (vite 7, transformers 4.3.2).
- CSP aktif; `unsafe-eval` dan `blob:` diperlukan oleh ONNX Runtime (didokumenkan).
- Tiada XSS disahkan; eksport mengekod HTML.

## 4. Penemuan baharu kitaran ini

| ID | Dapatan | Keterukan | Status |
|---|---|---|---|
| DEF-COMPAT-013 | WebKit IndexedDB menolak Blob; simpan gagal & ralat null | MEDIUM | RESOLVED & VERIFIED |
| KL-010 / DEF-DATA-012 | Edit mesyuarat tersimpan mencipta pendua | MEDIUM | RESOLVED & VERIFIED |

## 5. Percanggahan dokumentasi vs implementasi

| Dokumentasi lama | Keadaan sebenar | Tindakan |
|---|---|---|
| "Audio tidak disimpan" | Kini disimpan | Manual v1.1 dikemas kini |
| "Butang Simpan dilumpuhkan selepas simpan" | Benar; ditambah "edit mengemas kini" | Manual v1.1 |
| Kredensial dalam localStorage | Benar; CSP mitigasi | Kekal didokumenkan |

## 6. Kesimpulan audit

Aplikasi pada baseline adalah kukuh (tiada penyekat), dengan satu jurang fungsian ketara (audio tidak disimpan) dan satu jurang integriti data (edit→pendua) yang kini diselesaikan. Tiada dapatan kritikal terbuka. Batasan yang tinggal adalah inherent, bergantung kredensial luar, atau had persekitaran ujian.
