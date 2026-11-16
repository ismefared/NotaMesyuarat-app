# Matriks Penyelesaian Batasan Diketahui — NotaMesyuarat

Tarikh: 16 November 2026 · Baseline input: commit `ff2bd3c` (manual v1.0)
Sumber batasan: `PANDUAN-PENGGUNA.md` §12, `README.md`, `audit/audit-config.json`

| ID | Batasan asal | Punca akar | Penyelesaian dilaksanakan | Status | Bukti pengesahan |
|---|---|---|---|---|---|
| KL-001 | Rakaman audio tidak disimpan dalam rekod mesyuarat | `saveMeeting()` tidak menulis audio ke storan; tidak ada kunci audio | Audio disimpan dalam IndexedDB (`notamesyuarat:audio:<id>`) sebagai **ArrayBuffer** + jenis/ nama; dipulihkan semasa buka; dipadam bersama rekod | **RESOLVED** | KL-001 PASS — audio `blob:` dipulihkan selepas reload; KL-001b padam membersihkan rekod |
| KL-002 | Audio panjang memerlukan masa/memori; tempoh tidak dipaparkan | `durationSec` menggunakan pemasa rakaman sahaja (fail muat naik = 0) | Helper `getAudioDuration()` membaca metadata; tempoh disimpan & dipaparkan (saat/minit); nasihat pecah audio kekal | **RESOLVED (mitigasi)** | KL-002 PASS — sidebar memaparkan "3 s" untuk WAV ujian; teks panduan dikemas kini |
| KL-003 | Kualiti transkripsi bergantung kualiti audio | Ciri model ASR | Tiada ubahan kod; tip audio & model kekal dalam panduan | **ACCEPTED (inherent)** | Dokumentasi |
| KL-004 | Nota automatik ialah draf | Pilihan reka bentuk keselamatan | Amaran kekal dalam UI dan panduan | **ACCEPTED (by design)** | Semakan UI |
| KL-005 | WebKit/Firefox belum diuji | Enjin tidak dipasang | Playwright WebKit & Firefox dipasang; ujian asas 4 kriteria dijalankan | **RESOLVED** | 3 enjin × (load/upload/notes/save) = 12/12 PASS (`cross-browser-results.json`) |
| KL-006 | OpenCode e2e tidak diuji | Perlu API key sebenar | Diuji dengan kunci sebenar: endpoint pulangkan **429 FreeUsageLimitError** dan respons tanpa header CORS → pelayar "Failed to fetch". Bukan ralat kod aplikasi | **BLOCKED (external)** | E2E-OC-01 gagal (kuota/CORS); ralat 401/mock 200/gugur 500 PASS |
| KL-007 | Google Drive tidak diuji | Perlu OAuth Client ID | Diuji dengan token Drive sebenar: sambung, auto-upload, senarai, muat turun, bersih — **5/5 PASS**. Menemui & membetulkan DEF-INT-014 (`scopeFor` import) | **RESOLVED** | E2E-GD-01..05 PASS; fail ujian dipadam |
| KL-008 | Rakaman mikrofon tidak diuji automatik | Kebenaran mikrofon sandbox | Percubaan automasi fake-device; `getUserMedia` menggantung dalam persekitaran ini | **BLOCKED (environment)** | Percubaan direkodkan; laluan rakaman disemak statik |
| KL-009 | Lighthouse tidak dijalankan | Alat tidak dipasang | Diganti dengan navigation timing terukur (3 larian) + analisis saiz bundle | **MITIGATED** | Median: TTFB 3 ms, DCL 47 ms, Load 47 ms, FP 20 ms |
| KL-010 | (Ditemui semasa CAQA) Edit mesyuarat tersimpan mencipta pendua | `saveMeeting` sentiasa `randomUUID()`; tiada id semasa | `currentId` dijejaki; simpanan mengemas kini rekod sedia ada (`updatedAt`), senarai disusun ikut kemas kini | **RESOLVED** | KL-010 PASS — 1 rekod kekal, toast "Mesyuarat dikemas kini" |

## Cacat tambahan ditemui semasa pengesahan

| ID | Dapatan | Punca | Pembetulan | Status |
|---|---|---|---|---|
| DEF-COMPAT-013 | Simpan gagal dalam WebKit: IndexedDB menolak Blob (`blob-put-error: null`) | WebKit tidak menyokong penyimpanan Blob dalam IDB | Simpan sebagai ArrayBuffer; bina semula Blob semasa muat; ralat audio tidak menggagalkan simpanan nota; akses mesej ralat selamat-null | **RESOLVED & VERIFIED** (WebKit save=PASS) |
| DEF-INT-014 | Auto-upload Drive gagal: `scopeFor is not defined` | Dua import tertinggal semasa TASK-001 | Tambah `scopeFor` pada import `uploadToCloud` dan `getCloudFolderWebUrl` | **RESOLVED & VERIFIED** | E2E Drive 5/5 PASS |
| DEF-INT-015 | OpenCode tidak boleh dicapai dari pelayar | Kuota percuma 429 + respons tanpa CORS (OPTIONS 404) | Tiada ubahan kod — had perkhidmatan luar; disyorkan proksi/kunci berbayar | **BLOCKED (external)** | E2E-OC-01; curl 429; header disemak |

## Ringkasan

- 10 batasan didaftarkan: **6 diselesaikan** (KL-001, KL-002 mitigasi, KL-005, KL-007, KL-009 mitigasi, KL-010), **2 diterima** (inherent/by design: KL-003, KL-004), **2 disekat** (KL-006 kuota/CORS perkhidmatan luar; KL-008 persekitaran sandbox).
- 3 cacat tambahan ditemui dan diselesaikan dalam kitaran yang sama (DEF-COMPAT-013, DEF-INT-014) + 1 disekat luaran (DEF-INT-015).
- Tiada batasan "resolved" ditanda tanpa bukti ujian; KL-007 disahkan dengan token Drive sebenar.
