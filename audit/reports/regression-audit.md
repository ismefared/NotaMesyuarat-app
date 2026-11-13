# Laporan Audit Regresi — NotaMesyuarat

Tarikh: 13 Nov 2026

## Garis dasar

Ini audit pertama dengan garis dasar pelaksanaan sebenar. Garis dasar:
`history/audit-baseline.json` (hasil Playwright 13 Nov 2026, 20 kes).

## Perubahan tidak dikomit dalam repositori

Kod semasa mempunyai 6 fail diubah (+1,430/−841) berbanding commit `f1e6d32`,
berkaitan pelaksanaan pembetulan audit UX 1 Nov 2026. Kes ujian 13 Nov dijalankan
**terhadap keadaan ini** — jadi garis dasar mencerminkan kod kerja semasa.

## Konteks regresi bagi pembetulan UX 1 Nov

| Dakwaan pembetulan | Status semasa audit ini |
|---|---|
| Tema gelap berfungsi | SAH — TC-15 PASS |
| Skeleton loading sidebar | SAH — dilihat semasa muat (TC-01) |
| Spinner tertunda 300ms | SAH — dalam kod (feedback.jsx) |
| prefers-reduced-motion | SAH — dalam kod (styles.css) |
| Touch target ≥44px | Dalam kod; pengukuran semula tidak diambil |
| aria-live | SAH — dalam kod |

## Risiko regresi utama untuk pembetulan akan datang

1. **App.jsx monolitik** — pembetulan DEF-FUNC-001 menyentuh laluan
   stopRecording/acceptFile yang juga laluan utama pengguna; uji rakaman +
   upload selepas pembetulan.
2. **styles.css** — pembetulan overflow (DEF-UI-002) mudah memecahkan
   viewport lain; uji kesemua 5 viewport selepas ubah.
3. **Dynamic import eksport** (DEF-PERF-007) — boleh memecahkan eksport jika
   salah; TC-08 mesti lulus semula.

## Kes regresi minimum yang disyorkan (smoke)

1. App dimuat; stepper terkunci (TC-01/02)
2. Upload WAV → langkah 2 (TC-04)
3. Transkripsi e2e atau sekurang-kurangnya laluan model dimuat (TC-06)
4. Jana nota + 3 eksport (TC-07/08)
5. Simpan → muat semula → kekal (TC-09/11)
6. Tiada ralat konsol (TC-19) — **penunjuk awal paling sensitif**; ia yang
   menemukan DEF-FUNC-001.
