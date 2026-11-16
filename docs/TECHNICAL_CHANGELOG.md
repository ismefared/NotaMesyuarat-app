# Changelog Teknikal — NotaMesyuarat v0.3.0

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
- Manual: NM-PG-001 v1.0 → v1.1 → **v1.2** (selaras v0.2.1).

## Tambahan 16 Nov 2026 — v0.2.1 (e2e kredensial sebenar)

| Fail | Perubahan | Sebab |
|---|---|---|
| `src/lib/cloud.js` | Tambah `scopeFor` pada import `uploadToCloud` dan `getCloudFolderWebUrl` | DEF-INT-014: ReferenceError menyebabkan auto-upload Drive gagal (ditemui e2e) |
| `package.json` | Versi 0.2.0 → 0.2.1 | Patch release |

Bukti: `audit/test-cases/e2e-credentials-results.json` — Drive 5/5 PASS;
OpenCode disekat 429/CORS (DEF-INT-015, tiada ubahan kod).

### Manual v1.2 (16 Nov 2026)
- Kulit/pengepala: versi manual 1.2, versi aplikasi 0.2.1.
- Sejarah semakan: baris v1.2 ditambah.
- Nota kuota OpenCode dan baris penyelesaian masalah "Failed to fetch".
- PDF dijana semula (19 halaman A4); v1.0/v1.1 dikekalkan sebagai sejarah.

## 16 Nov 2026 — v0.3.0: kualiti audio & audio panjang

| Fail | Perubahan | Sebab |
|---|---|---|
| `src/lib/audioTools.js` (baharu) | decodeMono, analyseSamples, enhanceSamples, splitSamples, encodeWav | Analisis kualiti, enhancement, pemecahan segmen |
| `src/lib/audioTools.test.js` (baharu) | 10 ujian unit | Analisis, enhancement, WAV, pepecahan |
| `src/lib/whisper.js` | `transcribeFlexible()` — decode sekali, segmen automatik >15 min, enhancement | KL-002/KL-003 |
| `src/App.jsx` | State kualiti/enhance; analisis selepas muat naik/rakaman; panel kualiti; notis audio panjang; laluan transkripsi pintar | UX |
| `src/styles.css` | Gaya panel kualiti (baik/sederhana/lemah) | UI |
| `package.json` | Versi 0.3.0 | Minor release |
| Manual NM-PG-001 | v1.3 (21 halaman) | Dokumentasi |

Pepijat ditemui oleh ujian unit: normalisasi enhancement menggunakan puncak
selepas tapisan → menguatkan dengung. Dibetulkan: keputusan gain berdasarkan
puncak input.

Bukti: `audit/test-cases/quality-results.json` (Q-01..05 PASS), Vitest 19/19.
