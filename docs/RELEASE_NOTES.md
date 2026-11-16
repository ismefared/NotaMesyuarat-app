# Nota Keluaran — NotaMesyuarat v0.2.1

Tarikh: 16 November 2026 · Sebelum ini: v0.2.0

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

- **DEF-INT-014** (v0.2.1): `scopeFor is not defined` dalam `uploadToCloud`
  dan `getCloudFolderWebUrl` — auto-upload Google Drive gagal. Ditemui melalui
  ujian e2e dengan token Drive sebenar; kini dibaiki dan disahkan (5/5 PASS).
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

- Integrasi OpenCode: kunci sebenar diuji tetapi disekat kuota percuma (429)
  dan CORS yang tidak disahkan (DEF-INT-015). Google Drive e2e **lulus 5/5**.
- Rakaman mikrofon tidak diuji automatik dalam sandbox.
- Lighthouse/Core Web Vitals medan belum diukur.
- Audio besar menggunakan kuota IndexedDB; padam rekod lama jika perlu.
- WebKit/Firefox disahkan melalui smoke, bukan suite penuh.

## Naik taraf

Tiada langkah migrasi diperlukan. Rekod lama tanpa audio dipaparkan seperti
biasa; audio hanya tersedia untuk mesyuarat yang disimpan mulai v0.2.0.
