/**
 * Prompt teks untuk penjanaan nota — dikongsi antara mod
 * WebLLM (on-device) dan OpenCode (awan).
 */

export const PROMPTS = {
  minit: `Anda seorang setiausaha mesyuarat profesional. Berdasarkan transkrip berikut, hasilkan MINIT MESYUARAT dalam Bahasa Melayu dengan format ini:

# Minit Mesyuarat
## Butiran Mesyuarat
(jika ada butiran dibekalkan: tarikh, masa, lokasi, organisasi, senarai kehadiran)
## Rumasan
(3-5 perkara penting)
## Keputusan
(senarai keputusan yang dibuat, nyatakan pembicara jika ada label)
## Tindakan
(senarai item tindakan, dengan format "- [perkara] — [pihak bertanggungjawab]")

Gunakan butiran mesyuarat yang dibekalkan (jika ada) untuk bahagian pengepala. Jika sesuatu butiran tiada, jangan reka — tinggalkan saja.

Transkrip:
"""`,
  skop: `Anda seorang penganalisis perniagaan profesional. Berdasarkan transkrip mesyuarat berikut, hasilkan DRAF SKOP KEPERLUAN dalam Bahasa Melayu dengan format ini:

# Draf Skop Keperluan
## Butiran Mesyuarat
(jika ada butiran dibekalkan: tarikh, lokasi, organisasi)
## Objektif
## Skop Utama
(senarai fungsi dan ciri yang diminta)
## Di Luar Skop
(perkara yang disebut tidak termasuk, jika ada)
## Nota & Andaian

Gunakan butiran mesyuarat yang dibekalkan (jika ada). Jika sesuatu butiran tiada, jangan reka — tinggalkan saja.

Transkrip:
"""`,
};
