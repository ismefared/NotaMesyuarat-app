# Strategi Ujian — Audit NotaMesyuarat

## Prinsip

Audit bermula read-only. Tiada kod sumber diubah. Semua ujian dijalankan
terhadap **binaan produksi** (`npm run build` → `npm run preview`, port 4173)
dengan data sintetik. Bukti disimpan dalam `evidence/`.

## Persekitaran ujian

- Chromium (Playwright 1.59.1), headless, viewport boleh tukar
- Data ujian: `evidence/uji-audio.wav` (WAV PCM 16-bit, 3s, 16kHz, dijana
  secara sintetik — bukan data sebenar), `evidence/bukan-audio.txt`
- Transkrip ujian sintetik (ayat BM mengandungi kata kunci keputusan/tindakan)

## Pelan ujian fungsional

| Kumpulan | Senario | Kaedah |
|---|---|---|
| Pemuatan | App dimuat, pengepala, stepper terkunci | Playwright |
| Input | Muat naik fail sah/tidak sah, drag-drop (kod), semakan jenis | Playwright + fail ujian |
| Transkripsi | OpenCode tanpa kunci (ralat), Whisper on-device e2e | Playwright |
| Nota | Jana extractive, eksport PDF/Word/MD, salin | Playwright + pemeriksaan muat turun |
| Kecekalan | Simpan, kekal selepas muat semula, buka, padam, duplikasi | Playwright + IndexedDB |
| UI | Tema gelap, modal awan (Escape), ralat WebDAV | Playwright |
| Responsif | 5 viewport, overflow mengufuk | Playwright + tangkapan skrin |
| Konsol | Ralat JS semasa sesi | Playwright listener |

## Pelan ujian keselamatan

Semakan statik: pengendalian kredensial, semakan input, kod HTML, token OAuth,
kandungan service worker, konfigurasi CORS/headers. **Tiada pengujian
eksploitasi aktif** (tiada sistem pihak ketiga disasarkan tanpa kebenaran).

## Pelan UX / aksesibiliti

Tangkapan skrin penuh bagi setiap langkah dan viewport; semakan kontras dan
struktur semantik melalui bacaan kod + hasil audit UX terdahulu
(`UX-AUDIT.md`, 1 Nov 2026) disemak silang.

## Prestasi

Saiz binaan + komposisi chunk daripada output `vite build`. Lighthouse tidak
dijalankan — direkodkan sebagai batasan.

## Data dan keselamatan ujian

Data sintetik sahaja. Tiada rekod sebenar. Tiada operasi musnah ke atas sistem
pihak ketiga; ujian WebDAV menyasarkan domain `.invalid` yang tidak wujud.
