# Laporan Audit Prestasi — NotaMesyuarat

Tarikh: 13 Nov 2026 · Kaedah: analisis binaan + pemerhatian semasa ujian
Batasan: Lighthouse tidak dijalankan; Core Web Vitals tidak diukur secara
instrument. Dapatan prestasi bersifat analitik, bukan terukur medan.

## Komposisi binaan (vite build, 13 Nov 2026)

| Aset | Saiz | Gzip |
|---|---|---|
| index-*.js (utama) | **1,471 kB** | **424 kB** |
| html2canvas-*.js | 201 kB | 48 kB |
| purify.es-*.js | 30 kB | 12 kB |
| index.es-*.js | 151 kB | 52 kB |
| gdrive-*.js (lengai) | 3.5 kB | 1.5 kB |
| ort-wasm-simd-threaded.jsep.wasm | 21,596 kB | (dimuat atas permintaan model) |
| CSS | 20 kB | 4.6 kB |

## Dapatan

### DEF-PERF-007 — Bundle awal besar, eksport tidak di-muat-lengai (MEDIUM, P2)
jsPDF + html2canvas + purify (~233 kB gzip ~60 kB) termasuk dalam chunk awal
melalui `import { exportPDF, exportWord } from './lib/exporters'` statik, walaupun
eksport hanya berlaku selepas klik pengguna. **Pembetulan murah**: dynamic
import dalam pengendali klik → jangkaan pengurangan ketara pada muat awal.

### Model Whisper — dimuat atas permintaan (BAIK)
Model 50–250 MB dimuat hanya bila pengguna mentranskripsi, dengan kemajuan
dan cache pelayar. WASM 21 MB ort berlaku atas permintaan. Reka bentuk betul.

### Pemerhatian runtime
- Muat app dari cache SW network-first — pantas semasa ujian.
- Tiada render berlebihan ketara diperhatikan; animasi gelombang hanya semasa
  rakaman (rafRef dibatalkan selepas berhenti).
- Storan: rekod mesyuarat penuh (termasuk transkrip panjang) dalam IndexedDB
  dengan pembacaan senarai Promise.all — mencukupi untuk puluhan rekod;
  akan menjadi perlahan pada ratusan rekod (pemerhatian, bukan isu semasa).

## Keadaan pengukuran

Binaan dijalankan pada Node v24.21.0, macOS 25.6.0. Tiada pengukuran medan
atau maktab. Cadangan untuk audit akan datang: jalankan Lighthouse desktop &
mobile pada binaan preview untuk garis dasar terukur.
