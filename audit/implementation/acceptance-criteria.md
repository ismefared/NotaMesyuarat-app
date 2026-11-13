# Kriteria Penerimaan — Pelaksanaan AAERA 14 Nov 2026

## TASK-001 (SEC-002) — Skop OAuth minimum
1. `gdrive.js` mengeksport `scopeFor(searchAll)` — `drive.file` bila false, `auth/drive` bila true.
2. `getAccessToken` menghormati skop dalam cache token (token dengan skop berbeza tidak diguna semula).
3. Semua panggilan di `cloud.js` menghantar skop yang betul.
4. Binaan lulus; tiada regresi pada ujian awan sedia ada (TC-16/TC-17).
5. E2E Drive tidak boleh diuji (tiada Client ID) — direkodkan sebagai NOT TESTED.

## TASK-002 (DEF-A11Y-009) — Tab segmented
1. Kedua-dua butang segmented mempunyai `role="tab"` dan `aria-selected`.
2. Imbasan axe-core pada modal awan: 0 pelanggaran critical/serious.
3. Navigasi anak panah (tablistKeyDown sedia ada) berfungsi pada butang ini.

## TASK-003 (DEF-FUNC-005) — Elak pendua Simpan
1. Klik Simpan pertama mencipta rekod; klik kedua berturut-turut (kandungan tidak berubah) terlumpah.
2. Butang aktif semula selepas nota/transkrip/butiran berubah.
3. Buka mesyuarat lain (openMeeting) menetapkan semula keadaan butang.
4. TC-10 (dikemas kini) lulus; TC-09/TC-11/TC-12 kekal lulus.

## TASK-004 (SEC-003) — Transformers v4
1. Binaan lulus dengan v4.
2. Transkripsi e2e (tiny) menghasilkan transkrip tanpa ralat (TC-06 terarah).
3. Tiada ralat konsol baharu (TC-19 bersih selain ralat dijangka).
4. Jika mana-mana gagal → revert penuh package.json + npm install, status DEFERRED dengan alasan bertulis.

## TASK-005 — Regresi & laporan
1. Suite penuh: 0 FAIL fungsional.
2. Semua task status VERIFIED atau DEFERRED dengan bukti.
3. Dashboard + laporan dikemas kini tanpa memusnahkan sejarah.
