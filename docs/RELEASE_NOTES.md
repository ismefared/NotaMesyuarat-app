# Nota Keluaran — NotaMesyuarat v0.3.1

Tarikh: 18 November 2026 · Sebelum ini: v0.3.0

## Pembetulan

- **DEF-REL-016 — halaman kosong selepas Jana transkrip.** Apabila Chrome
  menterjemah halaman secara automatik, nod teks React ditulis semula dan
  butang sibuk gagal memasukkan spinner (`NotFoundError: insertBefore`).
  React kemudian menyahlekat seluruh app tanpa sebarang mesej.
  - Terjemahan DOM dihalang: `translate="no"` pada `<html>` dan `#root`,
    serta `<meta name="google" content="notranslate">`.
  - `ErrorBoundary` baharu memaparkan dialog **Aplikasi terhenti** dengan
    butiran ralat, butang **Salin butiran ralat** dan **Muat semula halaman**.
  - Pendengar ralat global memaparkan dialog **Ralat tidak dijangka** untuk
    promise yang gagal tanpa `catch`, dengan pilihan Tutup atau muat semula.
- Ujian pembiakan Playwright: mutasi DOM gaya Google Translate mencetuskan
  ralat yang sama; selepas pembetulan dialog dipaparkan dan halaman tidak
  kosong (`audit/test-cases/error-boundary-results.json`).

---

# Nota Keluaran — NotaMesyuarat v0.3.0

Tarikh: 16 November 2026 · Sebelum ini: v0.2.1

## Ciri baharu

- **Analisis kualiti audio** — penilaian Baik/Sederhana/Lemah dengan SNR,
  aras dBFS, peratus senyap dan tip pembetulan sebelum transkripsi.
- **Tingkatkan audio** — tapisan high-pass 100 Hz + normalisasi aras,
  diproses on-device sebelum ASR.
- **Pemecahan automatik audio panjang** — audio >15 minit dipecah kepada
  segmen ~10 minit dan ditranskripsi berurutan dengan status kemajuan.

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

- Audio panjang (>15 min) diproses dalam segmen; masa masih bergantung pada
  peranti dan model. Kualiti audio sangat bising masih menjejaskan ketepatan
  walaupun selepas enhancement.
- Integrasi OpenCode: kunci sebenar diuji tetapi disekat kuota percuma (429)
  dan CORS yang tidak disahkan (DEF-INT-015). Google Drive e2e **lulus 5/5**.
- Rakaman mikrofon tidak diuji automatik dalam sandbox.
- Lighthouse/Core Web Vitals medan belum diukur.
- Audio besar menggunakan kuota IndexedDB; padam rekod lama jika perlu.
- WebKit/Firefox disahkan melalui smoke, bukan suite penuh.

## Naik taraf

Tiada langkah migrasi diperlukan. Rekod lama tanpa audio dipaparkan seperti
biasa; audio hanya tersedia untuk mesyuarat yang disimpan mulai v0.2.0.
