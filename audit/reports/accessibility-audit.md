# Laporan Audit Aksesibiliti — NotaMesyuarat

Tarikh: 13 Nov 2026 · Kaedah: semakan kod + pemerhatian DOM semasa ujian Playwright
Batasan: tiada pembaca skrin dijalankan; tiada pengukuran kontras berinstrument.

## Yang disahkan baik

| Aspek | Bukti |
|---|---|
| Label aria kritikal pada butang ikon (mic, tetapan, tutup, kebab) | App.jsx: ~26 rujukan aria/role |
| `aria-expanded` pada toggle butiran, `aria-haspopup="dialog"` | App.jsx |
| `aria-current="step"` pada stepper | App.jsx |
| `role="radiogroup"` tema, `role="tablist"` tab, `role="dialog"` modal | App.jsx |
| `aria-live="polite"` untuk status rakaman, `role="status"` toast & ProcessTracker | App.jsx, feedback.jsx |
| `aria-busy` pada bekas skeleton, skeleton `aria-hidden` | feedback.jsx |
| Fokus papan ketak: `:focus-visible` pada 10 pemilih CSS | styles.css |
| `prefers-reduced-motion` disokong (pembetulan audit 1 Nov) | styles.css |
| Tutup modal dengan Escape | disahkan TC-16 |

## Isu

1. **Tab tanpa pengendalian papan kekunci penuh** — `role="tab"` digunakan
   tetapi tiada navigasi anak panah antara tab dan tiada `tabindex` dinamik
   yang diperlukan oleh corak ARIA tab penuh. Pengguna papan kekunci masih
   boleh Tab ke setiap tab (fallthrough), jadi bukan penyekat —
   **berpotensi, rendah**.
2. **Modal tidak memerangkap fokus** — bila modal awan terbuka, Tab boleh
   bergerak ke elemen di belakang overlay. `aria-modal="true"` diisytiharkan
   yang membantu pembaca skrin, tetapi pengguna papan kekunci berbeza.
   **berpotensi, sederhana-rendah**.
3. **Overflow mengufuk** (DEF-UI-002) menjejaskan penggunaan pada skrin kecil,
   termasuk pengguna zum tinggi.
4. **Sasaran sentuh** — pembetulan `min-height: 44px` dari audit 1 Nov
   disahkan dalam kod; bukti pengukuran langsung tidak diambil semasa audit ini.

## Kesimpulan

Asas aksesibiliti **di atas purata** untuk app sekelas ini. Dua penambahbaikan
berstruktur disyorkan: perangkap fokus modal dan corak tab ARIA penuh.
Tiada halangan aksesibiliti yang menyekat penggunaan utama.
