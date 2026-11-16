# Changelog Teknikal — NotaMesyuarat v0.2.0

Tarikh: 16 November 2026 · Baseline: v0.1.0 (commit `ff2bd3c`)

## Perubahan kod

| Fail | Perubahan | Sebab | Kesan |
|---|---|---|---|
| `src/App.jsx` | Kunci `AUDIO_KEY`; simpan audio sebagai ArrayBuffer dalam `saveMeeting` | KL-001 | Audio kekal bersama rekod; serasi WebKit |
| `src/App.jsx` | `openMeeting` memulihkan audio (buffer→Blob), nama & tempoh; revoke URL lama | KL-001 | Main semula tanpa fail asal |
| `src/App.jsx` | `removeMeeting` memadam `AUDIO_KEY:<id>` | KL-001 | Tiada audio yatim |
| `src/App.jsx` | `currentId` + kemas kini in-place + `updatedAt`; susunan senarai ikut kemas kini | KL-010 | Tiada pendua semasa edit |
| `src/App.jsx` | `audioDuration` state; `getAudioDuration(file)` selepas muat naik; `durationSec: audioDuration \|\| elapsed` | KL-002 | Tempoh betul; sidebar "3 s"/"N min" |
| `src/App.jsx` | `try/catch` pada `saveMeeting`; ralat audio tidak menggagalkan nota; mesej ralat `err?.message` | DEF-COMPAT-013 | WebKit selamat; kegagalan storan dilaporkan |
| `src/App.jsx` | Petunjuk "Audio disimpan bersama mesyuarat ini" | UX | Maklum balas jelas |
| `src/lib/recorder.js` | `getAudioDuration(blob)` baharu | KL-002 | Baca metadata audio dengan pembersihan URL |
| `PANDUAN-PENGGUNA.md` | Audio disimpan; edit mengemas kini; tempoh; jadual privasi | Dokumentasi | Manual sepadan |
| `docs/panduan-pengguna.print.html` | Versi 1.1; sejarah semakan; kandungan dikemas kini | Dokumentasi | PDF v1.1 |
| `docs/*` | 10 dokumen serahan + matriks batasan | Serahan | Jejak lengkap |

## Perubahan konfigurasi / kebergantungan

- Tiada kebergantungan baharu untuk aplikasi.
- Kebergantungan ujian: Playwright WebKit & Firefox dipasang (cache mesin, bukan repo).
- `npm audit`: 0 kerentanan.

## Keputusan teknikal

1. **ArrayBuffer, bukan Blob, untuk audio dalam IndexedDB.** Ujian menemui WebKit menolak Blob (`blob-put-error: null`). ArrayBuffer ialah structured-clone yang disokong semua enjin. Saiz storan sama; penukaran Blob hanya semasa muat semula.
2. **Kegagalan audio tidak menghalang simpanan nota.** Nota ialah output utama; audio ialah lampiran. Ralat audio dilaporkan melalui toast tanpa menggagalkan transaksi utama.
3. **Update-in-place berdasarkan `currentId`.** Rekod yang dibuka dikenal pasti; simpanan mengekalkan `createdAt` asal dan menetapkan `updatedAt`, mengelakkan pendua.
4. **Tiada perubahan seni bina.** Kekal satu-fail `App.jsx` dan modul `lib/` sedia ada, mengikut peraturan projek.

## Kesan serasi

- Rekod lama (tanpa audio/`updatedAt`) kekal boleh dibuka; senarai menyusun fallback ke `createdAt`.
- Rekod audio format lama (`{blob}`) masih dipulihkan (fallback) selain format baharu `{buffer}`.
- Tiada perubahan kontrak API luar.

## Versi

- Aplikasi: 0.1.0 → **0.2.0** (ciri baharu + pembetulan).
- Manual: NM-PG-001 v1.0 → **v1.1**.
