# Peta Jalan Pelaksanaan — Cadangan Audit

## Fasa 0 — Segera (sebelum sebar luas) · ~½ hari

| Giliran | Kerja | Isu |
|---|---|---|
| 1 | Pulihkan/buang `maybeAutoUpload` | DEF-FUNC-001 (P1) |
| 2 | Kemas kini manifest PWA | DEF-PWA-006 |
| 3 | Sahkan `npm run build` + smoke ujian selepas 1–2 | TC-19 dll. |

## Fasa 1 — Kitaran penambahbaikan terdekat · ~1–1.5 hari

| Kerja | Isu |
|---|---|
| Baiki overflow responsif @768/360 + uji 5 viewport | DEF-UI-002 |
| Pengesahan padam + buang/laksana "Lihat semua" | DEF-UX-004, DEF-UX-003 |
| Dynamic import eksport | DEF-PERF-007 |
| Mesej ralat muat naik pada langkah 1 | DEF-UX-008 |
| Tambah CSP | Mitigasi SEC-001 |

## Fasa 2 — Kitaran berikut · ~2–3 hari

| Kerja | Isu |
|---|---|
| Naik taraf transformers v4 (uji transkripsi penuh) | SEC-003 |
| Skop OAuth minimum | SEC-002 |
| Ujian unit Vitest untuk minutes.js/exporters.js | Garis dasar regresi |
| Fokus modal + corak tab ARIA | Aksesibiliti |

## Definisi selesai setiap kerja

- `npm run build` lulus
- Kes smoke regresi lulus (lihat reports/regression-audit.md)
- Bukti sebelum/selepas disimpan dalam audit/evidence/
- Status kecacatan dikemas kini dalam defects/defect-register.json
