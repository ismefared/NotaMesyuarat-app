# Audit UX — NotaMesyuarat-app

Dijalankan menggunakan skill `ui-ux-pro-max` (Mod Aplikasi + Mod Premium).
Tarikh: 1 Nov 2026 · Sasaran: UX app web + konsep landing page premium

> **STATUS PELAKSANAAN (semua selesai 1 Nov 2026):**
> ✅ #1 reduced-motion · ✅ #2 touch target · ✅ #3 skeleton loading ·
> ✅ #4 responsive diaudit (Lighthouse mobile: A11y 96, Best Practices 100) ·
> ✅ #5 aria-live · ✅ #6 spinner tertunda 300ms ·
> 🐑 **BONUS BUG DITEMUI & DIBAIKI**: butang tema "Gelap" tidak berfungsi langsung
> (tiada `[data-theme="dark"]` dalam CSS) — blok tema gelap lengkap ditambah & disahkan.
> ✅ Bonus: kontras `--muted` dinaikkan 4.39:1 → 5.3:1 (lulus WCAG AA).
>
> Sandaran asal: `.ux-backup/` (styles.css + App.jsx sebelum suntingan).

---

## Bahagian A — Audit UX Aplikasi (Mod Aplikasi)

### Pengisytiharan Mod
> Mod dipilih: **🅰️ App Mode** — app fungsional (rakaman, transkrip, minit mesyuarat).
> Kuasa tertinggi: database `ui-ux-pro-max` + garis panduan UX. Reka bentuk boleh jangka = ciri.

### Design System cadangan (daripada enjin carian)
- **Corak**: Product Demo + Features (untuk halaman promosi — lihat Bahagian B)
- **Gaya**: Minimalism & Swiss Style — sesuai untuk tool produktiviti
- **Palet DB**: primary `#DC2626`, accent `#2563EB` → **cadangan saya: KEKALKAN palet sedia ada**
  (teal `#0f766e` + merah `#dc2626` khusus status rakam). Ini "color with intention" —
  merah untuk rakam ialah konvensyen industri yang betul, dan teal bukan klise AI.
  Keputusan DB adalah advisory; kod sedia ada lebih berprinsip.

### Kekuatan sedia ada (kekal — jangan ubah)
| Yang baik | Bukti dalam kod |
|---|---|
| Label aria kritikal | `aria-label="Henti rakaman"` pada butang mic (26 rujukan aria/role) |
| Fokus papan kekunci | `:focus-visible` pada 10 pemilih |
| Sistem token CSS | `--bg`, `--accent`, `--radius-*` — konsisten |
| Warna dengan niat | Merah *hanya* untuk status rakam; teal sebagai satu aksen |

### Cari & Cadangan (susunan keutamaan skill 1→10)

| # | Keutamaan | Dapatan | Cadangan konkrit |
|---|---|---|---|
| 1 | 🔴 CRITICAL | **Tiada `prefers-reduced-motion`** (0 padanan dalam styles.css) — animasi gelombang/pulse berjaya tanpa henti | Tambah blok `@media (prefers-reduced-motion: reduce)` — hentikan animasi mic-pulse & waveform, ganti dengan status statik + teks "Sedang merakam" |
| 2 | 🔴 CRITICAL | **Paparan sesi sentuh (touch target)** — `.btn` padding 10px + font 0.9rem ≈ 38–40px tinggi, bawah piawai 44×44px | Tambah `min-height: 44px` pada `.btn` dan butang ikon; pastikan jarak antara butang ≥8px |
| 3 | 🟠 HIGH | **Tiada skeleton loading** — transkripsi Whisper on-device menunggu lama (minit), senarai mesyuarat dari IndexedDB juga tak segerak | Skeleton shimmer untuk senarai mesyuarat; untuk transkripsi, ProcessTracker sedia ada bagus — tambahkan `aria-busy="true"` pada bekas yang sedang diproses + anggaran masa berbaki |
| 4 | 🟠 HIGH | **Responsive nipis** — hanya 3 `@media` untuk 1,423 baris CSS | Uji pada 375px / 768px / 1024px; risiko utama: grid butang & panel meta mesyuarat; pastikan tiada skrol mengufuk |
| 5 | �middle MEDIUM | **`aria-live` untuk keadaan rakam** — perubahan "Sedia untuk merakam?" → "Sedang merakam..." perlu diumumkan kepada pembaca skrin | Bungkus teks status dengan `aria-live="polite"` |
| 6 | 🟡 MEDIUM | **Padanan feedback dengan tempoh tunggu** — jangan guna spinner sama untuk operasi pantas vs pantas | <300ms: tiada indikator; 300ms–3s: spinner; >3s (transkripsi): progress berfasa ("Memuat model… / Menyalin… / Menjana minit…") |
| 7 | 🟢 OPTIONAL | Identiti font — system stack berfungsi, tapi generik | Jika mahu identiti: **IBM Plex Sans** (muat dengan aksen mono sedia ada di baris 805). Bukan keutamaan — kefungsalan dulu |

### Senarai semak pra-penghantaran (status semasa)
- [x] Label borang & aria kritikal
- [x] Fokus papan kekunci kelihatan
- [ ] `prefers-reduced-motion` disokong
- [x] Warna bukan penunjuk tunggal (merah + teks status)
- [ ] Sasaran sentuh ≥44px
- [ ] Responsif disemak pada 375px

---

## Bahagian B — Landing Page Premium (Mod Premium)

### Pengisytiharan Mod
> Mod dipilih: **🅱️ Premium Mode** — halaman pemasaran untuk produk.
> Kuasa tertinggi: `references/premium-mode.md`. Keputusan database: advisory sahaja.

### Ringkasan Reka Bentuk (pull rujukan)
1. **Konsep DNA Struktur**: **Conversation Timeline (#15)** — halaman memainkan semula
   simulasi transkrip mesyuarat semasa skrol; panggilan ciri terpaut pada momen spesifik.
   Sebab: produk itu SENDIRI ialah transkrip — halaman terasa seperti produk, bukan
   menerangkannya. (Sesuai untuk voice-AI, ikut katalog.)
2. **Mood**: kertas hampir-hitam `#111210` + teks hangat `#F5F2EA` — transkrip malam,
   suasana bilik persidangan; aksen tunggal teal `#14B8A6` untuk garis masa aktif.
   (Menurut peraturan tech/AI: BUKAN default krim-editorial dengan aksen loh.)
3. **Tipografi**: IBM Plex Sans (paparan neo-grotesque) + JetBrains Mono untuk cap masa,
   label mikro dan metadata — mono sebagai paparan, bukan sekadar meta.
4. **Anti-corak dielakkan**: tiada gradien ungu, tiada grid 3-lajur, tiada hero-
   subheadline-dua butang, tiada fade-in dari bawah semua-sama.
5. **Struktur**: skrol mendedahkan transkrip baris-demi-baris dengan cap masa yang
   berdetik; setiap baris penting terpaut kepada panggilan ciri (rakam → transkripsi
   on-device → minit automatik → eksport). Navigasi: bar status nipis dengan
   penunjuk "REC" langsung.

Fail: `landing-premium.html` (satu fail, tiada build step — buka terus dalam pelayar).
