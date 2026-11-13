# Pelan Pelaksanaan — AAERA v1.0.0 (14 Nov 2026)

Input: laporan audit AIAAA kitaran v3 (audit penuh 10 fasa). Semua dapatan
terbuka disahkan semula terhadap kod semasa sebelum pelaksanaan.

## Tak backport / sudah selesai (tidak dilaksanakan lagi)

DEF-FUNC-001, DEF-UI-002, DEF-UX-003/004/008, DEF-PWA-006, DEF-PERF-007 —
dilaksanakan dalam Fasa 0–2 (13 Nov) dan disahkan VERIFIED pada kitaran v2/v3.

## Batch pelaksanaan

| Batch | Task ID | Dapatan | Cadangan | Keutamaan |
|---|---|---|---|---|
| 1 | TASK-001 | SEC-002 | Skop OAuth minimum: `drive.file` lalai; skop penuh hanya bila `searchAll` | P3 (keselamatan) |
| 2 | TASK-002 | DEF-A11Y-009 | `role="tab"` + `aria-selected` pada butang segmented modal | P2 |
| 2 | TASK-003 | DEF-FUNC-005 | Elak pendua Simpan — lumpuhkan butang selepas simpan sehingga kandungan berubah | P3 |
| 3 | TASK-004 | SEC-003 | Cuba naik taraf @huggingface/transformers v3→v4 (breaking) — kekalkan jika ujian e2e lulus, jika gagal batalkan & tangguhkan | P2 |
| 4 | TASK-005 | — | Regresi penuh + kemas kini laporan/dashboard | — |

SEC-001 (teks jelas localStorage): mitigasi CSP sudah aktif; perubahan ke
sessionStorage menjejaskan UX tanpa faedah keselamatan besar untuk app
klien-penuh — **diterima risiko, dilindokumen** (tiada ubahan kod).

## Syarat penerimaan (ringkas; penuh dalam acceptance-criteria.md)

- TASK-001: axe lulus; token dipinta dengan `drive.file` (disemak kod);
  download/searchAll dengan skop penuh; tiada regresi aliran awan.
- TASK-002: imbasan axe modal = 0 pelanggaran critical.
- TASK-003: simpan kedua berturut tidak mencipta rekod pendua.
- TASK-004: binaan lulus + transkripsi e2e (tiny) lulus; jika gagal → revert bersih.

## Pemilikan fail (elak konflik)

| Fail | Task |
|---|---|
| src/lib/gdrive.js, src/lib/cloud.js | TASK-001 |
| src/App.jsx (modal segmented) | TASK-002 |
| src/App.jsx (saveMeeting) | TASK-003 |
| index.html | tiada (CSP sudah ada) |
| package.json | TASK-004 |

TASK-002 & TASK-003 berkongsi App.jsx tapi lokasi berbeza — dilaksanakan
berurutan oleh agent yang sama.
