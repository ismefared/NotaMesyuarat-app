# Daftar Kecacatan — NotaMesyuarat (Audit 13 Nov 2026)

Ringkasan: **1 HIGH · 4 MEDIUM · 3 LOW · 2 TRIAGED (keselamatan konfigurasi)**

| ID | Tajuk | Keterukan | Keutamaan | Status |
|---|---|---|---|---|
| DEF-FUNC-001 | `maybeAutoUpload` tidak ditakrifkan — auto-upload rosak + ReferenceError setiap rakaman/muat naik | HIGH | P1 | CONFIRMED |
| DEF-UI-002 | Overflow mengufuk @768px & @360px — kandungan terpotong | MEDIUM | P2 | CONFIRMED |
| DEF-UX-003 | Butang "Lihat semua" mati | MEDIUM | P2 | CONFIRMED |
| DEF-UX-004 | Padam mesyuarat tanpa pengesahan | MEDIUM | P2 | CONFIRMED |
| DEF-PWA-006 | Manifest PWA bernama "Isyarat" (app lain) | MEDIUM | P2 | CONFIRMED |
| DEF-PERF-007 | Bundle awal 1,471 kB — jsPDF tidak di-muat-lengai | MEDIUM | P2 | CONFIRMED |
| SEC-003 | 4 kerentanan dependensi (3 high) | MEDIUM | P2 | TRIAGED |
| DEF-FUNC-005 | Simpan berulang → pendua tanpa amaran | LOW | P3 | CONFIRMED |
| DEF-UX-008 | Mesej gagal muat naik tidak dilihat pada langkah 1 | LOW | P3 | CONFIRMED |
| SEC-001 | Kata laluan WebDAV/API key teks jelas dalam localStorage | LOW | P3 | TRIAGED |
| SEC-002 | Skop OAuth Drive penuh (bukan minimum) | LOW | P3 | TRIAGED |

Butiran penuh (pembiakan, bukti, punca, pembetulan): `defect-register.json`.

## Nota pengesahan bebas

- DEF-FUNC-001 disahkan melalui listener `pageerror` Playwright (bukan hanya
  bacaan kod): `ReferenceError: maybeAutoUpload is not defined` terlempar pada
  setiap muat naik. Aliran pendaratan berterusan kerana ralat berlaku pada
  penyata terakhir `acceptFile()` selepas keadaan UI ditetapkan.
- DEF-UI-002 disahkan melalui ukuran DOM (`scrollWidth > clientWidth`) DAN
  pemeriksaan visual tangkapan skrin.
- Tiada dapatan palsu dikenal pasti semasa pengesahan; dua keputusan ujian
  awal (TC-06, TC-17) yang kelihatan gagal adalah ralat skrip ujian dan
  disahkan semula sebagai PASS melalui ujian terarah kedua.

## Kemas kini Kitaran v3 (14 Nov 2026 — audit penuh)

| ID | Tajuk | Keterukan | Keutamaan | Status |
|---|---|---|---|---|
| DEF-A11Y-009 | Modal awan: role="tablist" tanpa anak role="tab" (axe critical) | MEDIUM | P2 | CONFIRMED (baharu) |

Status pembetulan Fasa 0–2 disahkan semula dan dikekalkan: DEF-FUNC-001,
DEF-UI-002, DEF-UX-003, DEF-UX-004, DEF-PWA-006, DEF-PERF-007, DEF-UX-008
(semua VERIFIED/FIXED — tiada kemerosotan). SEC-003 kini 2 high (esbuild
selesai selepas naik taraf vite 7). Jumlah kecacatan terbuka: **5**
(1 MEDIUM baharu + 4 sedia ada tertangguh/tertunda).
