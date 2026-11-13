# Cadangan UX — NotaMesyuarat

| Keutamaan | Cadangan | Isu | Usaha | Kebergantungan |
|---|---|---|---|---|
| P2 | Buang butang "Lihat semua" ATAU laksanakan paparan senarai penuh | DEF-UX-003 | S (buang) / M (laksana) | Tiada |
| P2 | Dialog pengesahan sebelum padam mesyuarat (atau butang "Batal" dalam toast 5s) | DEF-UX-004 | S | Tiada |
| P2 | Baiki overflow mengufuk @768/360 — kenal pasti elemen min-width/padding penyebab | DEF-UI-002 | S–M | Uji 5 viewport selepas |
| P3 | Papar mesej ralat fail tidak disokong pada langkah 1 (toast atau hint dalam upload-area) | DEF-UX-008 | S | Tiada |
| P3 | Boleh pertimbangkan: elak pendua Simpan (kunci id sementara atau lumpuhkan butang selepas simpan) | DEF-FUNC-005 | S | Tiada |
| P3 | Paparkan tempoh fail upload/awan (meta audio) instead of 0 min | Pemerhatian integrasi | S | Tiada |

Urutan disyorkan: overflow → pengesahan padam → butang "Lihat semua" → selebihnya.
Ketiga-tiga P2 pertama adalah tampalan kecil dalam App.jsx/styles.css tanpa
perubahan seni bina.
