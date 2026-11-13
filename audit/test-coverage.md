# Liputan Ujian — Audit NotaMesyuarat

Jalankan sumber kebenaran: `test-cases/browser-test-results.json` (Playwright).

## Ringkasan pelaksanaan

| Status | Bilangan |
|---|---|
| PASS | 15 |
| PASS (dengan nota risiko) | 2 (TC-10, TC-14) |
| FAIL | 3 (TC-13, TC-18-768, TC-18-360) |
| BLOCKED | 0 (TC-06 disahkan PASS melalui ujian susulan) |
| Tidak diuji | OpenCode e2e, Google Drive e2e, rakaman mic, Firefox/WebKit |

## Kes ujian (hasil sebenar)

| ID | Senario | Status | Nota |
|---|---|---|---|
| TC-01 | App dimuat, pengepala | PASS | |
| TC-02 | Stepper terkunci awal | PASS | |
| TC-03 | Fail .txt ditolak | PASS | mesej status tidak muncul pada langkah 1 (lihat DEF-UX-007) |
| TC-04 | Muat naik WAV sah | PASS | auto-lompat ke langkah 2 berfungsi |
| TC-05 | OpenCode tanpa API key → ralat jelas | PASS | |
| TC-06 | Whisper on-device (tiny) e2e | PASS | disahkan melalui ujian susulan — app mara ke langkah Nota |
| TC-07 | Jana nota extractive | PASS | 946 aksara, seksyen lengkap |
| TC-08 | Eksport PDF/Word/Markdown | PASS | 3 fail dimuat turun |
| TC-09 | Simpan → toast + sidebar | PASS | |
| TC-10 | Simpan berulang | PASS* | pendua dibenarkan tanpa amaran (DEF-FUNC-005) |
| TC-11 | Kekal selepas muat semula | PASS | IndexedDB kekal |
| TC-12 | Buka mesyuarat tersimpan | PASS | |
| TC-13 | "Lihat semua" | FAIL | butang mati — tiada pandangan destinasi (DEF-UX-003) |
| TC-14 | Padam mesyuarat | PASS* | tanpa pengesahan (DEF-UX-004) |
| TC-15 | Tema gelap | PASS | |
| TC-16 | Modal awan + Escape | PASS | |
| TC-17 | Ralat WebDAV dikendalikan | PASS | disahkan semula melalui bukti skrin |
| TC-18 | Overflow @1920/1366/390 | PASS | |
| TC-18 | Overflow @768/360 | FAIL | DEF-UI-002 |
| TC-19 | Ralat konsol | WARN | `maybeAutoUpload is not defined` (DEF-FUNC-001) |

## Modul × liputan

| Modul | Statik | Pelayar | Catatan |
|---|---|---|---|
| App.jsx aliran | ✅ | ✅ | semua 3 langkah |
| whisper.js | ✅ | ✅ (tiny sahaja) | base/small tidak diuji e2e — model sama, risiko rendah |
| recorder.js | ✅ | ❌ | mic tidak diuji automatik |
| minutes.js | ✅ | ✅ | |
| exporters.js | ✅ | ✅ | fail dimuat turun disahkan wujud |
| opencode.js | ✅ | sebahagian | laluan ralat tanpa kunci sahaja |
| cloud.js / gdrive.js | ✅ | sebahagian | WebDAV ralat sahaja; Drive tidak diuji |
| sw.js / manifest | ✅ | ❌ | semakan statik |

## Kelemahan liputan

1. Rakaman mikrofon (laluan `Recorder`) — tidak diuji secara automatik.
2. Model base/small, audio panjang sebenar, fail video.
3. Ujian pelayar silang (WebKit/Firefox).
4. Auto-upload awan (kod rosak — lihat DEF-FUNC-001; tiada ujian mungkin).
