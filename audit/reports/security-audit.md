# Laporan Audit Keselamatan — NotaMesyuarat

Tarikh: 13 Nov 2026 · Kaedah: semakan statik defensif (OWASP Top 10 / ASVS ringkas) + pemerhatian rangkaian semasa ujian
Tiada pengujian eksploitasi aktif dilakukan.

## Taburan dapatan

| Keterukan | Disahkan | Berpotensi | Konfigurasi |
|---|---|---|---|
| CRITICAL | 0 | 0 | 0 |
| HIGH | 0 | 0 | 0 |
| MEDIUM | 0 | 1 (XSS menyebabkan kebocoran kredensial) | 1 (SEC-003 dependensi) |
| LOW | 0 | 1 | 2 |

## Dapatan

### SEC-001 — Kredensial dalam localStorage (teks jelas) — KONFIGURASI
- Kata laluan WebDAV (`notamesyuarat:cloud`) dan API key OpenCode
  (`notamesyuarat:opencode-key`) disimpan teks jelas. Apl berjalan dalam
  origin yang sama; sebarang kejayaan XSS bermakna kecurian kredensial.
- Mematuhi peraturan projek ("API key dalam pelayar sahaja") — direkodkan
  sebagai risiko diterima dengan cadangan mitigasi (lihat laporan remediasi).
- Tidak pernah dihantar ke mana-mana selain host sasaran yang dimaksudkan.

### SEC-002 — Skop OAuth Drive luas — KONFIGURASI
- `auth/drive` penuh diminta; `drive.file` mencukupi kecuali mod "cari
  keseluruhan Drive". Prinsip keistimewaan minimum tidak dipatuhi sepenuhnya.
- Token disimpan dalam memori sahaja dengan luput awal 60s — positif.

### SEC-003 — Dependensi berkerentanan — DISAHKAN (alat)
- `npm audit`: 4 kerentanan (1 moderate, 3 high): vite→esbuild (dev),
  @huggingface/transformers→sharp (CVE libvips/libheif/librsvg).
- Tiada laluan eksploitasi jarak-jauh terhadap app itu sendiri dikenal pasti
  untuk sharp (pemprosesan imej pelayan, bukan laluan pengguna akhir pelayar);
  risiko dikategorikan maintenance/rentan-kehadiran, bukan terbukti eksploitable.

### XSS / pengekilan output — BERPOTENSI (rendah)
- `exporters.js` mengekod HTML dengan betul (`escapeHTML`) sebelum pemprosesan
  markdown sendiri — amalan baik.
- Transkrip/nota dirender ke `<textarea>` (selamat). Dapatan: tiada
  `dangerouslySetInnerHTML`, tiada injeksi DOM dalaman.

### Input validation — LULUS
- Muat naik fail: disaring jenis `audio/*|video/*` (disahkan TC-03).
- URL WebDAV digabung dengan `encodeURIComponent` untuk segmen nama fail.
- XML WebDAV dihurai dengan DOMParser (bukan regex) — baik. `DOMParser`
  tidak menerima input tidak dipercayai melainkan pelayan WebDAV jahat;
  kesannya terhad.

### AuthN/AuthZ, CSRF, CORS — TIDAK BERKENAAN (tiada backend)
- Semua panggilan API memuat Authorization header ke host pihak ketiga yang
  dimaksudkan. CORS ditadbir oleh host luaran.

### Service worker — KONFIGURASI RENDAH
- Network-first untuk semua GET same-origin; cache fallback luar talian.
- Tiada cache data pengguna (IndexedDB tidak disentuh SW). Positif.
- `skipWaiting` + `clients.claim` tanpa kawalan versi kandungan — kemas kini
  selamat secara tingkah laku.

### Pendedahan ralat — LULUS
- Mesej ralat kepada pengguna tidak mendedahkan stack trace; `console.error`
  sahaja untuk diagnosis pembangun.

## Penilaian risiko keseluruhan keselamatan

**Sederhana-rendah.** Tiada kerentanan disahkan yang boleh dieksploitasi
terus. Isu paling ketara ialah gabungan (a) kredensial teks jelas + (b) tiada
CSP dinyatakan — satu kejayaan XSS (cth. melalui dependensi terjejas) akan
mendedahkan kredensial. Menambah Content-Security-Policy di `index.html` ialah
mitigasi murah dan berkesan.
