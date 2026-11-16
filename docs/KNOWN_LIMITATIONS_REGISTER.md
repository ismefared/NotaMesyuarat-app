# Daftar Batasan Diketahui — NotaMesyuarat

Sumber: `PANDUAN-PENGGUNA.md` §12 (baris 340–346), `README.md`, `audit/audit-config.json`
Tarikh pendaftaran: 16 Nov 2026 · Baseline: commit `ff2bd3c`

| ID | Batasan (sumber) | Status dalam kod | Punca akar | Kesan | Klasifikasi | Keutamaan | Tindakan |
|---|---|---|---|---|---|---|---|
| KL-001 | Rakaman audio tidak disimpan dalam rekod mesyuarat (§12) | Disahkan — `saveMeeting()` tidak menyimpan blob | Blob audio tidak pernah ditulis ke IndexedDB | Pengguna kehilangan audio asal; tidak boleh semak/transkripsi semula | Functional Gap | **P1** | **AKAN DIBANGUNKAN**: simpan audio dalam IndexedDB bersama rekod; main semula; padam bersama rekod |
| KL-002 | Audio panjang memerlukan masa/memori (§12) | Sebahagian — Whisper chunk 30s/stride 5s | Had pengiraan model/peranti | Pemprosesan lama; risiko memori | Inherent Constraint | P3 | Mitigasi UX: papar tempoh audio & anggaran; nasihat pecah bahagian |
| KL-003 | Kualiti transkripsi bergantung kualiti audio (§12) | Inherent | Ciri model ASR | Ketepatan berubah | Inherent Constraint | P3 | Dokumentasi + tip (sedia ada) |
| KL-004 | Nota automatik ialah draf (§12) | By design | Pilihan reka bentuk keselamatan | Pengguna mesti semak | Inherent Constraint | P3 | Kekalkan amaran (sedia ada) |
| KL-005 | WebKit/Firefox belum diuji (§12) | Tidak diuji | Enjin pelayar tidak dipasang | Risiko keserasian tidak diketahui | Test Gap | **P2** | **AKAN DIUJI**: pasang Playwright WebKit/Firefox, jalankan suite asas |
| KL-006 | OpenCode e2e tidak diuji (audit-config) | Diuji separa (401, mock 200/500) | Perlu API key sebenar | Sempadan integrasi tidak disahkan hujung-ke-hujung | External Dependency | P3 | Kekal BLOCKED — perlukan kredensial pengguna |
| KL-007 | Google Drive tidak diuji (audit-config) | Diuji statik sahaja | Perlu OAuth Client ID | Integrasi Drive tidak disahkan | External Dependency | P3 | Kekal BLOCKED — perlukan kredensial pengguna |
| KL-008 | Rakaman mikrofon tidak diuji automatik (audit-config) | Tidak diuji | getUserMedia dalam headless | Laluan rakaman tidak disahkan | Test Gap | **P2** | **AKAN DIUJI**: Chromium fake media device |
| KL-009 | Lighthouse tidak dijalankan (audit-config) | Tidak dijalankan | Alat tidak dipasang | Tiada skor CWV | Tooling Gap | P3 | Ganti dengan navigation-timing (sedia ada) + catat batasan |
| KL-010 | Edit mesyuarat tersimpan mencipta rekod baharu (ditemui semasa CAQA) | Disahkan — `saveMeeting` sentiasa `randomUUID()` | Tiada penjejakan id semasa | Pendua/kekeliruan data apabila menyunting | Confirmed Defect | **P1** | **AKAN DIBANGUNKAN**: kemas kini rekod sedia ada (update-in-place) |

## Kriteria penerimaan

- **KL-001**: Simpan mesyuarat → muat semula → buka → audio boleh dimainkan semula; padam mesyuarat memadam audio.
- **KL-005**: Suite asas lulus pada WebKit dan/atau Firefox, atau kegagalan didokumenkan dengan punca.
- **KL-008**: Rakaman maya 3 saat menghasilkan blob audio dan beralih ke langkah 2.
- **KL-010**: Buka mesyuarat, edit nota, simpan → bilangan rekod kekal 1 dan kandungan dikemas kini.

## Resolved (selepas pelaksanaan)

Lihat `docs/KNOWN_LIMITATIONS_RESOLUTION_MATRIX.md`.
