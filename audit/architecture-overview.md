# Gambaran Seni Bina — NotaMesyuarat

## Gaya seni bina

SPA klien-penuh (client-only): tiada backend sendiri, tiada pelayan aplikasi.
Semua logika berjalan dalam pelayar; storan ialah IndexedDB/localStorage.
Integrasi luaran (OpenCode, Google Drive, WebDAV) dipanggil terus dari pelayar
pengguna dengan kredensial milik pengguna.

```
┌────────────────────────── Pelayar (PWA) ─────────────────────────┐
│                                                                  │
│  React 18 (App.jsx — aliran 3 langkah)                           │
│    ├─ recorder.js  → MediaRecorder + AnalyserNode                │
│    ├─ whisper.js   → transformers.js (Whisper ONNX q8, cache)    │
│    ├─ minutes.js   → extractive summarizer (luar talian)         │
│    ├─ exporters.js → jsPDF / .doc / Markdown / papan keratan     │
│    ├─ opencode.js  → gateway OpenCode (Gemini / model teks)      │
│    ├─ cloud.js ─ gdrive.js → WebDAV / Drive REST v3              │
│    └─ IndexedDB (mesyuarat) + localStorage (tetapan/kunci)       │
│                                                                  │
│  Service worker (network-first, cache same-origin GET)           │
└──────────────────────────────────────────────────────────────────┘
         ↗ API luaran hanya bila pengguna memilih mod awan/AI
```

## Aliran data utama

1. **Input audio**: rakaman (MediaRecorder, webm) atau muat naik fail
   (semakan jenis `audio/*|video/*`) atau import awan (WebDAV PROPFIND → GET).
   Auto-upload pilihan selepas input — **ROSAK** (lihat DEF-FUNC-001).
2. **Transkripsi**: on-device (Whisper, model 50–250MB dimuat sekali, cache
   pelayar) atau OpenCode (audio→base64→Gemini; audio dihantar keluar secara
   eksplisit). Hasil dibersihkan daripada halusinasi berulang.
3. **Nota**: extractive luar talian (sentiasa tersedia) atau AI OpenCode
   (gugur ke kaedah pantas jika gagal/tiada kunci — tingkah laku gugur
   disengajakan dan berfungsi).
4. **Penyimpanan/eksport**: IndexedDB (senarai id + rekod penuh), PDF/Word/MD/klip.

## Keputusan reka bentuk ketara

- **Satu-fail `App.jsx`** (1,270 baris) — diputuskan projek; semua keadaan
  dalam satu komponen. Boleh diselenggara untuk skala semasa tetapi makin
  berisiko apabila berkembang.
- ** Privasi sebagai sempadan**: mod on-device tidak membuat sebarang panggilan
  rangkaian (disahkan: `whisper.js` hanya memuat model dari HF CDN; audio tak
  dihantar). Mod AI/awan adalah pilihan eksplisit.
- **Kredensial dalam pelayar**: mematuhi peraturan projek; kata laluan WebDAV
  disimpan teks jelas dalam localStorage (lihat SEC-001).
- **OAuth berkeadaban**: Google Drive token dalam memori dengan luput 60s awal;
  skop penuh `auth/drive` (lihat SEC-002).

## Kualiti dalaman diperhatikan

Positif: pemisahan lib/komponen yang bersih, komentar bahasa Melayu bermakna,
pengendalian ralat konsisten (try/catch + mesej pengguna), `async/await`
konsisten, tiada keadaan global tersembunyi selain cache modul whisper/gdrive.

Risiko: `maybeAutoUpload` dirujuk tetapi **tidak ditakrifkan** dalam `App.jsx`
(kesan sisa penstrukturan semula — laporan fungsional); komponen `Skeleton`
dieksport tetapi hanya digunakan secara tidak langsung.
