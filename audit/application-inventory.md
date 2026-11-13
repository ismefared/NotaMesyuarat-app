# Inventori Aplikasi — NotaMesyuarat

## Ringkasan

Aplikasi web satu-halaman (SPA) untuk rakaman mesyuarat → transkrip → minit
mesyuarat / draf skop keperluan. Berjalan sepenuhnya dalam pelayar (on-device);
audio tidak dihantar ke pelayan melainkan pengguna memilih mod OpenCode atau
import/eksport awan secara eksplisit.

## Teknologi

| Komponen | Teknologi | Versi |
|---|---|---|
| UI | React | ^18.3.1 |
| Bina | Vite | ^5.4.21 |
| Transkripsi | @huggingface/transformers (Whisper ONNX, q8) | ^3.3.1 |
| Storan | IndexedDB melalui idb-keyval + localStorage | ^6.2.1 |
| Eksport PDF | jsPDF | ^4.2.1 |
| PWA | manifest + service worker tersuai | — |

## Inventori modul

| Fail | Baris | Tanggungjawab |
|---|---|---|
| `src/App.jsx` | 1270 | Komponen utama: aliran 3 langkah (Audio→Transkrip→Nota), tema, storan mesyuarat, modal awan, UI penuh |
| `src/lib/whisper.js` | 137 | Transkripsi on-device (tiny/base/small), pembersihan halusinasi, 6 bahasa |
| `src/lib/opencode.js` | 160 | Transkripsi Gemini + jana nota AI melalui gateway OpenCode; API key dalam localStorage |
| `src/lib/recorder.js` | 89 | Pembalut MediaRecorder + AnalyserNode (gelombang, jam) |
| `src/lib/minutes.js` | 180 | Penjana nota extractive luar talian (rumasan/keputusan/tindakan, skop) |
| `src/lib/exporters.js` | 142 | Eksport PDF (jsPDF) dan Word (.doc HTML) |
| `src/lib/cloud.js` | 210 | Klien WebDAV (PROPFIND/PUT/GET) + pengahulu Google Drive |
| `src/lib/gdrive.js` | 231 | OAuth GIS + Drive REST v3 (upload multipart, senarai, cari, muat turun) |
| `src/lib/prompts.js` | 39 | Prompt BM untuk minit/skop |
| `src/components/feedback.jsx` | 91 | Spinner, ProcessTracker, BusyButton, Skeleton |
| `src/components/icons.jsx` | 321 | Ikon SVG |
| `src/components/ZikirPanel.jsx` | 86 | Panel inspirasi rohani (giliran ikut sesi) |
| `public/sw.js` | 17 | Service worker network-first |
| `public/manifest.webmanifest` | 18 | Manifest PWA — **nama lama "Isyarat" (silap)** |

## Inventori laluan UI

| Langkah | Fungsi | Komponen |
|---|---|---|
| 1 | Rakam / muat naik / import awan + butiran mesyuarat | `.mode-tabs`, `.record-stage`, `.upload-area`, `.cloud-area` |
| 2 | Pilih enjin (on-device/OpenCode), transkripsi, edit transkrip | `.mode-tabs`, `textarea.transcript` |
| 3 | Pilih jenis nota (minit/skop), jana, simpan, eksport | `textarea.minutes` |
| Modal | Tetapan awan (WebDAV/Drive) | `.modal` |
| Sidebar | Mesyuarat terkini (buka/padam), panel zikir | `.sidebar` |

## Inventori API luaran

| Endpoint | Kegunaan | Kredensial |
|---|---|---|
| `https://opencode.ai/inference/google/v1beta/models/gemini-3.5-flash-lite:generateContent` | Transkripsi ketepatan tinggi | API key (localStorage) |
| `https://opencode.ai/inference/openai/v1/chat/completions` | Jana nota AI | API key (localStorage) |
| `https://www.googleapis.com/drive/v3/*` | Drive (senarai/upload/muat turun) | OAuth token GIS |
| Pelayan WebDAV pengguna | Import/eksport fail audio | Basic auth (localStorage) |
| `https://accounts.google.com/gsi/client` | Pustaka OAuth | — |

## Storan data

| Kunci | Lokasi | Kandungan |
|---|---|---|
| `notamesyuarat:meetings` + `:id` | IndexedDB | Senarai + rekod mesyuarat (transkrip, nota, butiran) |
| `notamesyuarat:opencode-key` | localStorage | API key OpenCode (teks jelas) |
| `notamesyuarat:cloud` | localStorage | Konfig WebDAV/Drive **termasuk kata laluan** (teks jelas) |
| `notamesyuarat:theme` | localStorage | Tema |
| `notamesyuarat:zikir-count` | localStorage | Giliran zikir |
| Cache SW `notamesyuarat-v1` | Cache Storage | Aset GET same-origin |

## Ujian sedia ada

Tiada test suite, tiada linter. Sahkan dengan `npm run build` sahaja.

## Kebergantungan — status audit

`npm audit`: **4 kerentanan (1 moderate, 3 high)** — vite→esbuild; @huggingface/transformers→sharp (CVE libvips/libheif/librsvg). Pembaiki memerlukan naik taraf besar (transformers v4). Tiada laluan eksploitasi pelayar-dijana dikenal pasti untuk kes penggunaan luar talian.
