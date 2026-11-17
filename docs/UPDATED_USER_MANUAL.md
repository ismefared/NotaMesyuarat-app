# Manual Pengguna Dikemas Kini — Penunjuk

**Manual rasmi terkini:** [`PANDUAN-PENGGUNA.md`](../PANDUAN-PENGGUNA.md) (v1.4)
**PDF serahan:** [`PANDUAN-PENGGUNA-NotaMesyuarat-v1.4.pdf`](PANDUAN-PENGGUNA-NotaMesyuarat-v1.4.pdf)
**Versi terdahulu:** [v1.3](PANDUAN-PENGGUNA-NotaMesyuarat-v1.3.pdf) · [v1.2](PANDUAN-PENGGUNA-NotaMesyuarat-v1.2.pdf) · [v1.1](PANDUAN-PENGGUNA-NotaMesyuarat-v1.1.pdf) · [v1.0](PANDUAN-PENGGUNA-NotaMesyuarat-v1.0.pdf)

## Perubahan dalam v1.4 (17 Nov 2026)

1. **Senarai Rajah** baharu dengan nombor halaman sebenar.
2. **Rajah aliran kerja** dan **rajah seni bina privasi** (SVG).
3. **Enam tangkapan skrin UI sebenar**: Langkah 1, Langkah 2 (kualiti audio),
   kualiti lemah, notis audio panjang, Langkah 3, dan dialog Tetapan Awan.
4. PDF dijana semula: **27 halaman**, 2.5 MB.
5. Sumber Markdown turut memautkan gambar dalam `docs/figures/`.

## Perubahan dalam v1.3 (16 Nov 2026)

1. **Panel Kualiti Audio** — penilaian Baik/Sederhana/Lemah dengan SNR,
   aras dBFS, peratus senyap dan tip pembetulan.
2. **Pilihan "Tingkatkan audio"** — tapisan high-pass 100 Hz + normalisasi
   aras, diproses dalam pelayar sebelum transkripsi.
3. **Pemecahan automatik audio panjang** — audio >15 minit diproses dalam
   segmen ~10 minit dengan status "bahagian X/Y".
4. Versi aplikasi pada kulit: **0.3.0**. PDF dijana semula (21 halaman).

## Perubahan dalam v1.2 (16 Nov 2026)

1. **Auto-upload Google Drive disahkan berfungsi** selaras dengan v0.2.1
   (pembetulan DEF-INT-014).
2. **Nota kuota OpenCode** — kunci percuma mempunyai had penggunaan; jika
   habis, mod OpenCode gagal walaupun kunci sah.
3. **Penyelesaian masalah baharu** untuk "Transkripsi OpenCode gagal:
   Failed to fetch" — sebab kuota/CORS, cadangan guna mod On-device.
4. Versi aplikasi pada kulit dokumen dikemas kini kepada **0.2.1**.
5. Sejarah semakan dokumen mencatat v1.0 → v1.1 → v1.2; PDF dijana semula.

## Perubahan dalam v1.1 (16 Nov 2026)

1. **Audio kini disimpan bersama rekod mesyuarat** (bahagian 5.3 dan 6).
   - Boleh dimainkan semula melalui langkah Transkrip selepas membuka mesyuarat.
   - Dipadam secara automatik apabila mesyuarat dipadam.
   - Tertakluk pada kuota storan pelayar.
2. **Menyunting mesyuarat tersimpan mengemas kini rekod sedia ada** — tiada
   lagi pendua apabila menekan Simpan selepas edit.
3. **Tempoh audio dipaparkan** dalam senarai mesyuarat (saat/minit).
4. **Jadual privasi dikemas kini** — baris baharu "Audio mesyuarat (disimpan
   bersama rekod)".
5. **Batasan "audio tidak disimpan" dibuang** daripada senarai batasan aktif;
   diganti dengan nota kuota storan.
6. Sejarah semakan dokumen mencatat v1.0 → v1.1; PDF dijana semula
   (19 halaman, A4).

## Ketepatan dokumentasi

Semua kenyataan di atas disahkan melalui ujian automatik (KL-001, KL-002,
KL-010) terhadap binaan produksi. Tiada fungsi didakwa tanpa bukti.
