# Cadangan Teknikal — NotaMesyuarat

| Keutamaan | Cadangan | Isu | Usaha |
|---|---|---|---|
| P1 | Pulihkan `maybeAutoUpload` — implement (semak `cloudCfg.autoUpload` → `uploadToCloud(blob, name, cloudCfg)`) atau buang panggilan + checkbox jika ciri tidak dikehendaki | DEF-FUNC-001 | S |
| P2 | Kemas kini manifest.webmanifest: name/short_name/description/theme_color NotaMesyuarat | DEF-PWA-006 | S |
| P2 | Dynamic import `exporters.js` dalam pengendali klik eksport | DEF-PERF-007 | S |
| P2 | Naik taraf dependensi: vite terkini (esbuild), uji @huggingface/transformers v4 dalam cabang | SEC-003 | M |
| P3 | Tambah Content-Security-Policy meta di index.html (default-src self + HF CDN + host API yang dimaksudkan) | Mitigasi SEC-001 | S |
| P3 | Pertimbangkan `drive.file` skop lalai; skop luas hanya bila searchAll | SEC-002 | M |
| P3 | Tambah ujian minimum (Vitest) untuk minutes.js & exporters.js — modul tulen, mudah diuji | Garis dasar regresi | M |
| P3 | Modal: perangkap fokus (focus trap) + pulihkan fokus semula selepas tutup | Aksesibiliti | S |

Nota: kekal dengan struktur satu-fail App.jsx mengikut peraturan projek —
pembetulan di atas tidak memerlukan penstrukturan.
