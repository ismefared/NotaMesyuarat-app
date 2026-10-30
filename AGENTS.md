# AGENTS.md — NotaMesyuarat

App web untuk rakaman mesyuarat → transkrip → minit mesyuarat / draf skop
keperluan. Semuanya on-device dalam pelayar; audio tidak dihantar ke pelayan.

## Teknologi

- React 18 + Vite (ESM, `type: module`), PWA
- Whisper on-device melalui @huggingface/transformers (Tiny/Base/Small)
- Mod ketepatan tinggi: Gemini Flash Lite melalui gateway OpenCode (API key pengguna dalam pelayar sahaja)
- MediaRecorder API, IndexedDB (idb-keyval), jsPDF
- Tiada test suite dan tiada linter — sahkan perubahan dengan `npm run build`

## Arahan penting

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sahkan binaan lulus sebelum selesai kerja
npm run preview  # cuba binaan produksi
```

## Struktur

- `src/App.jsx` — komponen utama aplikasi
- `src/lib/` — modul: `whisper.js`, `ai.js`, `opencode.js`, `recorder.js`, `minutes.js`, `exporters.js`, `gdrive.js`, `cloud.js`

## Peraturan projek

1. **Bahasa**: UI dan dokumentasi dalam Bahasa Melayu. Kekalkan ejaan Malaysia (cth. "kerana", "fail", "mesyuarat").
2. **Privasi**: mod on-device tidak boleh menghantar audio keluar. Sebarang panggilan AI hanya berlaku dalam mod OpenCode yang dipilih pengguna secara eksplisit.
3. **API key**: sentiasa disimpan dalam pelayar (IndexedDB/localStorage), jangan hardcode kunci dalam kod.
4. **Eksport**: kekal sokongan PDF, Word, Markdown dan salin ke papan keratan bila mengubah penjanaan nota.
5. Kekalkan gaya kod sedia ada dan struktur satu-fail `App.jsx`; jangan refactor besar untuk perubahan kecil.
