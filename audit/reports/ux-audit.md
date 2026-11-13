# Laporan Audit UX — NotaMesyuarat

Tarikh: 13 Nov 2026 · Kaedah: ujian pelayar sebenar + tangkapan skrin 5 viewport + semakan kod
Rujukan silang: `UX-AUDIT.md` (audit dalaman 1 Nov 2026) — semua pembetulan yang
dakwa di sana (reduced-motion, touch target, skeleton, aria-live, spinner
tertunda, tema gelap) disemak dan **disahkan wujud dalam kod semasa**.

## Kekuatan (disahkan semasa ujian)

1. **Aliran 3 langkah jelas** — stepper berstatus (kunci/aktif/✓) memberikan
   orientasi yang baik; tangkapan skrin TC-01/TC-04 menunjukkan hierarki bersih.
2. **Keadaan kosong & loading lengkap** — skeleton sidebar (aria-busy),
   keadaan kosong bermakna, ProcessTracker berfasa untuk transkripsi.
3. **Maklum balas konsisten** — toast (role=status), status aria-live,
   BusyButton dengan spinner tertunda 300ms.
4. **Tema cerah/gelap/sistem berfungsi** (disahkan TC-15).
5. **Butiran mesyuarat boleh lipat** dengan label htmlFor lengkap.

## Isu UX ditemui

### 1. "Lihat semua" mati (DEF-UX-003, MEDIUM)
Butang selalu dipapar (bila ada mesyuarat) tetapi tidak melakukan apa-apa.
Ekspektasi pengguna: panduan senarai penuh. Sama ada buang atau laksanakan.
*Usaha: S.*

### 2. Padam tanpa pengesahan (DEF-UX-004, MEDIUM)
Satu klik salah pada 'Padam' memadam rekod kekal. Toast selepas pemadaman
tidak menawarkan batal. *Usaha: S.*

### 3. Overflow mengufuk pada tablet/kecil (DEF-UI-002, MEDIUM)
768px dan 360px mengalami skrol mengufuk dan terpotongan tepi kanan. Latar
belakang: audit 1 Nov mendakwa responsif disemak, tetapi pengukuran semasa
menunjukkan regresi atau liputan tidak lengkap. *Usaha: S–M.*

### 4. Status gagal muat naik tak nampak (DEF-UX-008, LOW)
Pengguna yang memilih fail salah pada langkah 1 mendapat tiada tindak balas
visual. *Usaha: S.*

## Penilaian halaman demi halaman (dengan bukti skrin)

| Paparan | Tangkapan | Penilaian |
|---|---|---|
| Langkah 1 (rakam/upload/awan) | TC-01, TC-03, TC-04 | Kemas; tab tiga mod jelas; pengecualian kecil = #4 |
| Langkah 2 (transkrip) | TC-05, TC-06 | Engin & model jelas; hint privasi baik |
| Langkah 3 (nota) | TC-07 | Baris butang eksport menjadi panjang pada skrin kecil (lihat TC-18-360) |
| Modal awan | TC-16, TC-17 | Field berlabel baik; mesej ralat jelas |
| Tema gelap | TC-15 | Konsisten, kontras baik |

## Aksesibiliti

Laporan penuh: `accessibility-audit.md`. Ringkas: asas semantik dan ARIA
kuat; isu baki ialah overflow responsif dan beberapa kontras perlu disemak
dalam tema gelap (tidak diukur secara instrument — direkodkan sebagai
pemerhatian, bukan dapatan terukur).
