# Laporan Kesediaan Produksi — NotaMesyuarat v0.2.0

Tarikh: 16 November 2026 · Baseline kelulusan: `ff2bd3c` + pelaksanaan v5
Klasifikasi: **READY WITH DOCUMENTED EXCEPTIONS**

## 1. Semakan binaan & deployment

| Semakan | Keputusan | Bukti |
|---|---|---|
| `npm run build` | PASS | Vite 7, 447 modul, ~4.5 s |
| Bundle utama | 755.97 kB (228 kB gzip) | output binaan |
| Chunk eksport lengai | 388 kB (127 kB gzip) | output binaan |
| WASM ONNX | 21.6 MB, dimuat atas permintaan | output binaan |
| Aset statik | `dist/` dengan `base: './'` | `vite.config.js` |
| PWA | manifest + service worker network-first | `public/` |
| `npm audit` | 0 kerentanan | npm 11.19 |
| Ujian unit | 9/9 | Vitest |
| Regresi pelayar | 18 PASS / 0 FAIL aplikasi | Playwright |
| Silang pelayar | Chromium, WebKit, Firefox (smoke) 12/12 | Playwright |

## 2. Keperluan persekitaran

- Node ≥ 20.19 (dibangunkan pada Node 24.21); npm 11.
- Hosting HTTPS (WASM, service worker, PWA memerlukan secure context).
- Akses rangkaian untuk muat turun model HF (sekali) dan integrasi pilihan.
- Tiada pemboleh ubah persekitaran/rahsia di sisi pelayan — kredensial pengguna disimpan dalam pelayar.
- CSP meta disertakan; disyorkan tambah header CSP `frame-ancestors 'none'` di peringkat hosting.

## 3. Operasi & pemantauan

| Item | Status | Nota |
|---|---|---|
| Health check | N/A | Aplikasi statik; tiada backend |
| Logging | Terhad | `console.error` untuk ralat; tiada telemetri (by design, privasi) |
| Backup data pengguna | Tanggungjawab pengguna | Data dalam IndexedDB; eksport PDF/Word/MD; awan pilihan |
| Pemulihan bencana | Separa | Cache service worker; data pelayar tidak disegerakkan |
| Kemas kini | Automatik | SW network-first; pengguna muat semula |

## 4. Gerbang kualiti

| Gerbang | Status | Bukti / sebab |
|---|---|---|
| G1 Dokumentasi | **PASSED** | 10 batasan didaftarkan & dipetakan; manual v1.1 |
| G2 Kelengkapan implementasi | **PASSED WITH EXCEPTIONS** | KL-006/007 (kredensial luar), KL-008 (persekitaran ujian) |
| G3 Pengesahan fungsional | **PASSED** | Kriteria penerimaan KL-001/002/005/010 lulus |
| G4 Regresi | **PASSED** | Suite penuh; tiada kemerosotan |
| G5 Keselamatan | **PASSED** | 0 kerentanan; tiada critical/high terbuka |
| G6 Prestasi & kebolehpercayaan | **PASSED** | Load median 47 ms; tiada regresi; bundle −49% |
| G7 Dokumentasi akhir | **PASSED** | Manual + laporan sepadan implementasi |
| G8 Kesediaan produksi | **PASSED WITH DOCUMENTED EXCEPTIONS** | Blocker luaran didokumenkan |

## 5. Pengecualian didokumenkan

1. **KL-006 OpenCode e2e** — memerlukan API key pengguna sebenar. Laluan ralat/mock diuji.
2. **KL-007 Google Drive e2e** — memerlukan OAuth Client ID. Logik disemak; e2e belum.
3. **KL-008 Rakaman mic automatik** — sandbox tidak membenarkan `getUserMedia`; disyorkan ujian manual pada peranti.
4. **KL-009 Lighthouse** — diganti dengan navigation timing setempat; CWV medan belum diukur.
5. **WebKit/Firefox** — smoke 4 kriteria sahaja, bukan suite penuh.
6. **SEC-001** — kredensial localStorage diterima risiko, CSP aktif.

## 6. Senarai semak pelancaran

- [x] Binaan produksi lulus
- [x] Ujian unit + regresi lulus
- [x] Tiada kerentanan dependensi
- [x] CSP aktif
- [x] Manifest/PWA betul
- [x] Manual pengguna dikemas kini
- [ ] Ujian e2e OpenCode & Drive (perlu kredensial)
- [ ] Ujian rakaman pada peranti sebenar
- [ ] Header CSP `frame-ancestors` di hosting (disyorkan)
- [ ] Lighthouse CI (disyorkan)

## 7. Keputusan

Aplikasi boleh dikeluarkan untuk penggunaan produksi dengan pengecualian yang didokumenkan. Tiada isu critical/high terbuka. Pengecualian 1–3 memerlukan akses luaran/peranti dan tidak menghalang penggunaan teras (on-device).
