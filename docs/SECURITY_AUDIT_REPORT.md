# Laporan Audit Keselamatan — NotaMesyuarat (v5)

Tarikh: 16 November 2026 · Kaedah: semakan statik defensif + `npm audit` + ujian rangkaian terkawal (intercept). Tiada pengujian eksploitasi langsung.

## Ringkasan

| Kategori | Bilangan |
|---|---|
| Critical | 0 |
| High (terbuka) | 0 |
| Medium (terbuka) | 0 |
| Low / diterima risiko | 2 (SEC-001, CSP `unsafe-eval` — didokumenkan) |
| Kerentanan dependensi | **0** (`npm audit`) |

## Dapatan & status

| ID | Dapatan | Keterukan | Status | Nota |
|---|---|---|---|---|
| SEC-003 | Kerentanan dependensi (sharp/libvips, esbuild) | MEDIUM | **RESOLVED** | transformers 4.3.2 + vite 7; `npm audit` 0 |
| SEC-002 | Skop OAuth Drive penuh | LOW | **RESOLVED** | `drive.file` lalai; skop penuh hanya `searchAll`; cache token sedar-skop |
| SEC-001 | Kredensial teks jelas localStorage | LOW | **ACCEPTED RISK** | Mematuhi peraturan projek (kunci dalam pelayar); CSP mengehadkan exfiltrasi; tiada perubahan kod |
| CSP-EVAL | `script-src 'unsafe-eval'` diperlukan ONNX Runtime | LOW | **ACCEPTED** | Diperlukan untuk WASM; `script-src` masih terhad kepada self/blob/jsdelivr; tiada inline script dibenarkan |
| DEF-A11Y-009 | Tablist tanpa anak tab | MEDIUM (a11y, bukan keselamatan) | RESOLVED | — |
| DEF-COMPAT-013 | WebKit simpan gagal (IDB Blob) | MEDIUM (ketersediaan) | RESOLVED | ArrayBuffer; ralat selamat-null |

## Kawalan disahkan

- **XSS**: tiada `dangerouslySetInnerHTML`/`innerHTML`; eksport HTML mengekod `& < >`; nota/transkrip dirender dalam `<textarea>`.
- **Input fail**: jenis `audio/*|video/*` disahkan; mesej ralat dipaparkan (TC-03).
- **Rangkaian**: CSP `connect-src https:` diperlukan kerana WebDAV pengguna; `script-src` terhad; GSI iframe dibenarkan secara spesifik.
- **OAuth**: token dalam memori, luput 60 s awal, skop minimum lalai.
- **Storan**: audio/nota kekal setempat (IndexedDB); padam membersihkan rekod + audio.
- **Ralat**: mesej pengguna tidak mendedahkan stack trace; `console.error` untuk pembangun sahaja.
- **Dependensi**: 0 kerentanan; lockfile dikomit.

## Ujian keselamatan dijalankan

1. Penolakan fail bukan audio (TC-03) — PASS.
2. Ralat 401 OpenCode dikendalikan tanpa kebocoran (INT-01) — PASS.
3. Ralat WebDAV tidak memaparkan kredensial (TC-17) — PASS.
4. Pengekodan HTML dalam eksport (unit test) — PASS.
5. Semakan CSP selepas naik taraf transformers (blob: diperlukan) — disahkan e2e.

## Risiko sisa

1. Kredensial localStorage boleh dicuri jika XSS berjaya; mitigasi CSP + tiada vektor XSS ditemui.
2. `connect-src https:` luas (perlu untuk WebDAV pengguna) — exfiltrasi melalui fetch ke host luar mungkin jika XSS berlaku; sama seperti #1.
3. Integrasi luar tidak diuji dengan kredensial sebenar.
4. Tiada CSP `frame-ancestors` (clickjacking) kerana meta CSP tidak menyokongnya — cadangan: header CSP di peringkat hosting.

## Cadangan

- Tambah header CSP penuh (termasuk `frame-ancestors 'none'`) pada pelayan hosting.
- Pertimbangkan `sessionStorage` untuk kata laluan WebDAV jika ancaman peranti dikongsi.
- Jalankan `npm audit` dalam CI setiap PR.
