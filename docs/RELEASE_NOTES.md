# Nota Keluaran — NotaMesyuarat v0.2.0

Tarikh: 16 November 2026 · Sebelum ini: v0.1.0

## Ciri baharu

- **Audio disimpan bersama mesyuarat** — rakaman/fail kekal dalam storan
  pelayar dan boleh dimainkan semula melalui langkah Transkrip.
- **Edit-in-place** — menyunting dan menyimpan mesyuarat yang dibuka
  mengemas kini rekod sedia ada (tiada pendua).
- **Tempoh audio** dipaparkan dalam senarai mesyuarat.

## Penambahbaikan

- Simpanan mesyuarat kini mengendalikan ralat storan dengan mesej jelas;
  kegagalan audio tidak menggagalkan simpanan nota.
- Keserasian WebKit diperbaiki (IndexedDB ArrayBuffer).
- Ujian silang pelayar Chromium/WebKit/Firefox (12/12 smoke lulus).
- Manual pengguna v1.1 (MD + PDF) sepadan dengan tingkah laku baharu.

## Pembetulan

- DEF-DATA-012: pendua apabila menyunting mesyuarat tersimpan.
- DEF-COMPAT-013: simpan gagal dalam WebKit; ralat `null` tidak dikendalikan.
- KL-002: `durationSec` sentiasa 0 untuk fail muat naik.

## Keselamatan

- Tiada kerentanan dependensi (`npm audit` 0).
- Tiada perubahan pada CSP/OAuth selain dokumentasi.

## Prestasi

- Bundle utama 755.97 kB (228 kB gzip) — kekal ~49% lebih kecil daripada
  baseline awal.
- Median Load 47 ms setempat; First Paint 20 ms.

## Batasan yang tinggal

- Integrasi OpenCode/Google Drive e2e memerlukan kredensial pengguna.
- Rakaman mikrofon tidak diuji automatik dalam sandbox.
- Lighthouse/Core Web Vitals medan belum diukur.
- Audio besar menggunakan kuota IndexedDB; padam rekod lama jika perlu.
- WebKit/Firefox disahkan melalui smoke, bukan suite penuh.

## Naik taraf

Tiada langkah migrasi diperlukan. Rekod lama tanpa audio dipaparkan seperti
biasa; audio hanya tersedia untuk mesyuarat yang disimpan mulai v0.2.0.
