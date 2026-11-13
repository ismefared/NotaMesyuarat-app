# Pelan Remediasi Keselamatan — NotaMesyuarat

## Konteks

Aplikasi tanpa backend; sempadan keselamatan utama ialah pelayar pengguna.
Mematuhi peraturan projek (kunci dalam pelayar, on-device lalai). Tiada
kerentanan disahkan yang boleh dieksploitasi jarak jauh ditemui.

## Langkah disyorkan (urutan)

1. **CSP (murah, kesan besar)** — tambah `Content-Security-Policy` pada
   `index.html`: hadkan `default-src 'self'`, benarkan HF CDN, opencode.ai,
   googleapis.com, accounts.google.com. Mengurangkan kesan sebarang kejayaan
   XSS kepada sifar atau hampir sifar (melindungi kredensial SEC-001).
2. **Kemas kini dependensi** — `npm audit` 3 high (sharp/libvips melalui
   transformers). Naik taraf memerlukan transformers v4 (breaking) — uji
   laluan transkripsi selepas itu (TC-06 jadi ujian penerimaan).
3. **Skop OAuth minimum** — `drive.file` lalai; skop luas hanya bila mod
   "cari keseluruhan Drive" diaktifkan (SEC-002).
4. **Dokumen risiko localStorage** — satu ayat dalam UI tetapan: kata laluan
   WebDAV disimpan teks jelas dalam pelayar (SEC-001). Alternatif: sessionStorage.

## Yang tidak disyorkan diubah

- Penyimpanan kunci dalam pelayan/penggerongan — bercanggah dengan peraturan
  projek privasi-projek dan menambah permukaan serangan baru.
- Pengerasan service worker — tingkah laku network-first semasa selamat.
