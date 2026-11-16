# NotaMesyuarat 🎤

App web untuk merakam mesyuarat, menjana transkrip, dan menghasilkan
minit mesyuarat atau draf skop keperluan — **semuanya on-device** dalam
pelayar, tanpa hantar audio ke pelayan.

📘 **Panduan Pengguna:**
- [Versi PDF rasmi (NM-PG-001 v1.1)](docs/PANDUAN-PENGGUNA-NotaMesyuarat-v1.1.pdf) — dokumen serahan projek
  - [Versi 1.0 (sejarah)](docs/PANDUAN-PENGGUNA-NotaMesyuarat-v1.0.pdf)
- [Versi Markdown](PANDUAN-PENGGUNA.md) — sumber kandungan

Panduan merangkumi cara rakam, transkripsi, jana nota, tetapan awan dan
penyelesaian masalah.

## Ciri

- 🎙️ Rakaman suara dengan visualisasi gelombang, atau muat naik fail audio (mp3, m4a, wav, webm, ogg — termasuk rakaman Zoom/Meet)
- �️ Butiran mesyuarat (pilihan): tarikh, masa, lokasi, organisasi, ahli mesyuarat — diserap ke dalam nota yang dijana
- 📜 Transkripsi automatik (Whisper on-device, Bahasa Melayu) atau transkripsi ketepatan tinggi melalui OpenCode
- 🗣️ Sokongan label pembicara (Pembicara 1, Pembicara 2, ...) melalui mod OpenCode
- 📝 Jana **Minit Mesyuarat** (butiran, rumasan, keputusan, tindakan)
- 🎯 Jana **Draf Skop Keperluan** daripada transkrip
- �️ Tema cerah / gelap / sistem, dengan ikon SVG konsisten
- �/ � Himself �💾 Simpan mesyuarat dalam pelayar (IndexedDB)
- 📤 Eksport PDF, Word, Markdown / salin ke papan keratan
- 🔒 Privasi: mod on-device tidak menghantar audio ke mana-mana

## Cara jalankan

```bash
npm install
npm run dev        # buka http://localhost:5173
```

## Bina untuk produksi

```bash
npm run build      # output di dist/
npm run preview    # cuba binaan produksi
```

## Teknologi

| Komponen | Teknologi |
|---|---|
| UI | React 18 + Vite (PWA) |
| Rakaman | MediaRecorder API |
| Transkripsi (percuma) | Whisper on-device (transformers.js) — Tiny / Base / Small |
| Transkripsi (ketepatan tinggi) | Gemini Flash Lite melalui gateway OpenCode |
| Nota (pantas) | Extractive summarizer berasaskan kata kunci — offline |
| Nota (AI, pilihan) | OpenCode Console — GLM 5.3 Flash Free / DeepSeek / Gemini / GPT Nano |

## Nota penting

- Pertama kali menjana transkrip on-device, model Whisper akan dimuat
  turun sekali dan disimpan dalam cache pelayar.
- **Mod hibrid dengan OpenCode**: pilih "⭐ Ketepatan Tinggi (OpenCode)"
  dan masukkan API key OpenCode Console anda (disimpan dalam pelayar
  sahaja). Transkripsi melalui Gemini Flash Lite (multimodal audio);
  penjanaan nota AI boleh guna model percuma seperti GLM 5.3 Flash Free.
- Transkripsi Whisper on-device mengambil masa mengikut panjang audio.
  Untuk rekaman panjang, bersabar atau potong rekaman kepada bahagian.
