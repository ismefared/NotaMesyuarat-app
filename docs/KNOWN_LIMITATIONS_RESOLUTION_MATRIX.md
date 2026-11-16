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
| KL-006 | OpenCode e2e tidak diuji | Perlu API key sebenar | Laluan ralat 401, mock 200 dan gugur 500 diuji melalui intercept | **BLOCKED (external)** | INT-01/02/03 PASS; e2e sebenar perlukan kredensial |
| KL-007 | Google Drive tidak diuji | Perlu OAuth Client ID | Skop minimum + cache sedar-skop disemak statik; tiada e2e | **BLOCKED (external)** | Semakan kod; ujian e2e perlukan Client ID |
| KL-008 | Rakaman mikrofon tidak diuji automatik | Kebenaran mikrofon sandbox | Percubaan automasi fake-device; `getUserMedia` menggantung dalam persekitaran ini | **BLOCKED (environment)** | Percubaan direkodkan; laluan rakaman disemak statik |
| KL-009 | Lighthouse tidak dijalankan | Alat tidak dipasang | Diganti dengan navigation timing terukur (3 larian) + analisis saiz bundle | **MITIGATED** | Median: TTFB 3 ms, DCL 47 ms, Load 47 ms, FP 20 ms |
| KL-010 | (Ditemui semasa CAQA) Edit mesyuarat tersimpan mencipta pendua | `saveMeeting` sentiasa `randomUUID()`; tiada id semasa | `currentId` dijejaki; simpanan mengemas kini rekod sedia ada (`updatedAt`), senarai disusun ikut kemas kini | **RESOLVED** | KL-010 PASS — 1 rekod kekal, toast "Mesyuarat dikemas kini" |

## Cacat tambahan ditemui semasa pengesahan

| ID | Dapatan | Punca | Pembetulan | Status |
|---|---|---|---|---|
| DEF-COMPAT-013 | Simpan gagal dalam WebKit: IndexedDB menolak Blob (`blob-put-error: null`) | WebKit tidak menyokong penyimpanan Blob dalam IDB | Simpan sebagai ArrayBuffer; bina semula Blob semasa muat; ralat audio tidak menggagalkan simpanan nota; akses mesej ralat selamat-null | **RESOLVED & VERIFIED** (WebKit save=PASS) |

## Ringkasan

- 10 batasan didaftarkan: **5 diselesaikan** (KL-001, KL-002 mitigasi, KL-005, KL-009 mitigasi, KL-010), **2 diterima** (inherent/by design: KL-003, KL-004), **3 disekat** (KL-006, KL-007 external; KL-008 environment).
- 1 cacat tambahan ditemui dan diselesaikan dalam kitaran yang sama.
- Tiada batasan "resolved" ditanda tanpa bukti ujian.
