# 📘 Panduan Pengguna — NotaMesyuarat

Panduan lengkap untuk merakam mesyuarat, menjana transkrip dan menghasilkan
minit mesyuarat atau draf skop keperluan — semuanya dalam pelayar anda.

> **Privasi dahulu:** secara lalai, audio anda **tidak dihantar ke mana-mana
> pelayan**. Transkripsi berjalan terus dalam pelayar (on-device). Audio hanya
> dihantar keluar jika anda memilih mod OpenCode atau memuat naik ke awan
> secara eksplisit.

---

## 1. Keperluan sistem

| Item | Keperluan |
|---|---|
| Pelayar | Chrome, Edge, atau Chromium terkini (disyorkan). Firefox dan Safari moden sepatutnya berfungsi tetapi belum diuji sepenuhnya |
| Internet | Diperlukan sekali sahaja untuk muat turun model Whisper (~50–250 MB) dan untuk mod OpenCode |
| Peranti | Komputer riba/desktop disyorkan untuk mesyuarat panjang; telefon/tablet disokong |
| Mikrofon | Untuk rakaman langsung (kebenaran mikrofon diperlukan) |
| Storan | IndexedDB pelayar untuk mesyuarat tersimpan; ruang cakera untuk cache model |

### Memasang sebagai aplikasi (PWA)

1. Buka aplikasi dalam Chrome/Edge.
2. Klik ikon **Pasang** (install) di bar alamat, atau menu ⋮ → **Install NotaMesyuarat**.
3. Aplikasi akan muncul seperti app biasa — boleh dibuka tanpa bar pelayar.

> Nota: kemas kini aplikasi berlaku automatik apabila anda membuka semula app
> dengan sambungan internet.

---

## 2. Gambaran antara muka

Aplikasi berfungsi dalam **tiga langkah** yang dipaparkan di bahagian atas:

| Langkah | Nama | Fungsi |
|---|---|---|
| 1 | **Audio** | Rakam, muat naik fail, atau import dari awan |
| 2 | **Transkrip** | Tukar audio kepada teks |
| 3 | **Nota** | Jana minit mesyuarat atau draf skop keperluan |

Di sebelah kanan (atau bawah pada telefon):

- **Mesyuarat terkini** — senarai mesyuarat yang disimpan
- **Inspirasi Rohani** — satu zikir dipaparkan setiap sesi

Di bar atas:

- ⚙️ **Tetapan awan** — konfigurasi Google Drive / WebDAV
- **Tema** — Sistem / Cerah / Gelap

Langkah 2 dan 3 akan **terkunci** sehingga anda menyediakan audio dan transkrip.

---

## 3. Langkah 1 — Sediakan audio

Terdapat tiga kaedah input.

### 3.1 Rakam terus

1. Pilih tab **Rakam**.
2. Pilih mikrofon daripada senarai jika ada lebih daripada satu.
3. Tekan butang mikrofon besar untuk mula merakam.
4. Tekan sekali lagi untuk berhenti — rakaman akan sedia untuk transkripsi.

**Tip:**
- Pastikan mikrofon aktif dan kebenaran pelayar telah dibenarkan.
- Anda boleh memilih peranti mikrofon sebelum merakam (contoh: mikrofon mesyuarat).
- Jika rakaman panjang, pastikan peranti tidak tidur.

### 3.2 Muat naik fail

1. Pilih tab **Muat naik fail**.
2. Klik **Pilih fail** atau **seret & lepas** fail ke kawasan muat naik.

Format yang disokong: **mp3, m4a, wav, webm, ogg, mp4, mov, aac, flac** —
termasuk rakaman Zoom, Google Meet, atau video iPhone.

Selepas fail dimuatkan, aplikasi akan terus melompat ke langkah 2.

### 3.3 Import dari awan

1. Pilih tab **Import awan**.
2. Jika belum dikonfigurasi, klik **Buka Tetapan Awan** (lihat Bahagian 7).
3. Pilih fail audio daripada senarai, kemudian klik **Pilih**.

Fail akan dimuat turun dan terus sedia untuk transkripsi.

### 3.4 Butiran mesyuarat (pilihan)

Klik **Butiran mesyuarat** untuk mengisi:

| Medan | Keterangan |
|---|---|
| Tajuk mesyuarat | Digunakan sebagai tajuk nota dan nama dalam senarai |
| Tarikh | Tarikh mesyuarat (lalai: tarikh hari ini) |
| Bahasa | Bahasa pertuturan — membantu ketepatan transkripsi |
| Lokasi | Contoh: "Bilik Mesyuarat A / Zoom" |
| Organisasi | Contoh: "Jabatan IT" |
| Ahli mesyuarat | Satu nama setiap baris, atau pisahkan dengan koma |

Butiran ini akan diserap ke dalam pengepala minit yang dijana. Kosongkan
medan yang tidak berkaitan — aplikasi tidak akan mereka-reka maklumat.

---

## 4. Langkah 2 — Transkripsi

Pilih enjin transkripsi:

### 4.1 On-device (percuma, peribadi)

1. Pilih tab **On-device**.
2. Pilih model:

| Model | Saiz muat turun | Kelajuan | Ketepatan |
|---|---|---|---|
| Tiny | ~50 MB | Paling pantas | Asas |
| Base (disyorkan) | ~80 MB | Seimbang | Baik |
| Small | ~250 MB | Paling lambat | Paling tepat |

3. Klik **Jana transkrip**.

**Kali pertama** menggunakan model, ia akan dimuat turun sekali sahaja dan
disimpan dalam cache pelayar. Seterusnya, transkripsi boleh berjalan tanpa
internet.

**Tip ketepatan:**
- Pilih **Bahasa Melayu** dalam Butiran mesyuarat jika peserta bertutur BM.
- Audio yang jelas (tanpa gema/bising kuat) menghasilkan transkrip lebih baik.
- Untuk mesyuarat sangat panjang (>1 jam), pertimbangkan memotong audio
  kepada beberapa bahagian.

### 4.2 OpenCode (ketepatan tinggi, berawan)

1. Pilih tab **OpenCode**.
2. Tampal **API key OpenCode** anda. Kunci disimpan dalam pelayar sahaja.
3. (Pilihan) Tandakan **Kenal pasti pembicara** untuk label "Pembicara 1,
   Pembicara 2, ..." pada setiap pertukaran penutur.
4. Klik **Jana transkrip**.

> ⚠️ **Privasi:** dalam mod ini, audio anda dihantar ke perkhidmatan OpenCode
> (Gemini Flash Lite) untuk ditranskripsi. Jangan gunakan mod ini untuk audio
> sulit jika anda tidak dibenarkan menghantarnya ke perkhidmatan luar.

> ℹ️ **Kuota:** kunci percuma OpenCode mempunyai had penggunaan. Jika kuota
> habis, transkripsi OpenCode akan gagal walaupun kunci sah — gunakan mod
> **On-device** atau tunggu kuota dipulihkan.

### 4.3 Kualiti audio

Selepas audio dimuatkan, aplikasi menganalisis kualiti secara automatik dan
memaparkan panel **Kualiti audio**:

| Penunjuk | Maksud |
|---|---|
| **Baik / Sederhana / Lemah** | Penilaian keseluruhan untuk transkripsi |
| **SNR** | Nisbah suara berbanding bunyi latar (lebih tinggi lebih baik) |
| **Aras** | Kekuatan audio dalam dBFS (terlalu rendah = sukar ditranskripsi) |
| **Senyap** | Peratus bahagian audio yang senyap |

Aplikasi turut memberikan tip khusus (contoh: dekatkan mikrofon, kurangkan
gain, guna model Small).

**Tingkatkan audio** — tandakan pilihan ini untuk:
- menapis dengung/rumble frekuensi rendah (high-pass 100 Hz), dan
- menormalkan aras audio yang terlalu perlahan atau hampir terpotong.

Pemprosesan ini berlaku **dalam pelayar** (on-device) sebelum transkripsi.
Ia membantu audio perlahan/dengung, tetapi tidak boleh menghilangkan bunyi
bising bercampur suara sepenuhnya.

> Tip: untuk audio bising, pilih model **Small** dan aktifkan
> **Tingkatkan audio** untuk hasil terbaik.

### 4.4 Audio panjang

Audio melebihi **15 minit** dipecahkan secara automatik kepada bahagian
~10 minit dan ditranskripsi satu demi satu. Ini mengurangkan penggunaan
memori dan membolehkan mesyuarat panjang diproses pada peranti biasa.

- Status akan memaparkan "Mentranskripsi bahagian X/Y...".
- Transkrip setiap bahagian digabungkan mengikut urutan.
- Masa pemprosesan bergantung pada panjang audio, model dan peranti.
- Jika peranti kehabisan memori, pecahkan fail audio secara manual kepada
  beberapa fail yang lebih kecil.

### 4.5 Edit & eksport transkrip

- Transkrip muncul dalam kotak teks dan **boleh diedit terus** — betulkan
  nama, istilah, atau ayat yang tersilap.
- Klik **Eksport transkrip** untuk memuat turun fail Markdown.
- Klik **Teruskan ke nota** apabila selesai.

---

## 5. Langkah 3 — Jana nota

### 5.1 Pilih jenis nota

| Jenis | Sesuai untuk |
|---|---|
| **Minit mesyuarat** | Rumasan, keputusan, item tindakan |
| **Skop keperluan** | Draf keperluan projek, fungsi, di luar skop |

### 5.2 Jana

Klik **Jana nota**.

- **Kaedah pantas (lalai):** dijana terus dalam pelayar, tanpa internet.
- **Jana dengan AI OpenCode (pilihan):** tandakan kotak dan pilih model AI.
  Jika AI gagal atau tiada API key, aplikasi akan **gugur secara automatik**
  ke kaedah pantas supaya anda tetap mendapat nota.

Hasil nota muncul dalam kotak teks dan boleh diedit.

> **Nota:** Nota dijana secara automatik. Sila semak dan edit sebelum
> diedarkan, terutamanya nama, tarikh dan keputusan penting.

### 5.3 Simpan

Klik **Simpan**. Mesyuarat akan muncul dalam senarai **Mesyuarat terkini**.

- **Audio disimpan bersama rekod** dalam storan pelayar, jadi anda boleh
  memainkan semula rakaman kemudian melalui langkah Transkrip.
- Menyunting mesyuarat yang dibuka dan menekan Simpan akan
  **mengemas kini rekod sedia ada** — bukan mencipta pendua.
- Butang Simpan akan **dilumpuhkan** selepas disimpan. Ia aktif semula
  apabila anda mengubah transkrip atau nota.

### 5.4 Eksport

| Butang | Hasil |
|---|---|
| **PDF** | Fail `.pdf` sedia untuk dicetak/dihantar |
| **Word** | Fail `.doc` yang dibuka dalam Microsoft Word / Google Docs |
| **Markdown** | Fail `.md` teks biasa |
| **Salin** | Salin nota ke papan keratan |

---

## 6. Mengurus mesyuarat tersimpan

Dalam panel **Mesyuarat terkini**:

- **Buka** — klik ikon ⋮ → **Buka** untuk memuatkan semula transkrip dan nota.
- **Padam** — klik ikon ⋮ → **Padam**. Dialog pengesahan akan muncul; pilih
  **Batal** jika tersilap.

> ℹ️ **Storan:** audio disimpan bersama rekod dalam IndexedDB pelayar pada
> peranti ini. Saiz storan pelayar adalah terhad — padam mesyuarat lama jika
> ruang penuh. Fail audio tidak disegerakkan antara peranti; gunakan eksport
> atau awan untuk salinan tambahan.

Data mesyuarat disimpan dalam **IndexedDB pelayar** pada peranti ini sahaja.
Ia tidak disegerakkan antara peranti.

---

## 7. Tetapan awan

Klik ikon ⚙️ di bar atas.

### 7.1 WebDAV (Nextcloud, ownCloud, dll.)

1. Pilih **WebDAV**.
2. Masukkan **URL pelayan WebDAV** anda, contoh:
   `https://awan.contoh.com/remote.php/dav/files/nama-pengguna`
3. Tetapkan **Folder** (lalai: `notamesyuarat`).
4. Masukkan **Nama pengguna** dan **Kata laluan**.
5. Klik **Uji sambungan & simpan**.

> Folder mesti wujud terlebih dahulu di pelayan anda. Kredensial disimpan
> dalam pelayar anda sahaja.

### 7.2 Google Drive

1. Pilih **Google Drive**.
2. Tampal **Google OAuth Client ID** anda.
3. Klik **Uji sambungan & simpan** dan benarkan akses dalam tetingkap Google.

**Cara mencipta OAuth Client ID (sekali sahaja):**
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Cipta projek (percuma).
3. Aktifkan **Google Drive API**.
4. Cipta **OAuth Client ID** jenis *Web application*.
5. Tambah origin aplikasi anda (contoh `http://localhost:5173` atau URL
   produksi) pada *Authorized JavaScript origins*.
6. Salin Client ID ke tetapan aplikasi.

Fail disimpan dalam folder **"notamesyuarat"** di Drive anda.

### 7.3 Pilihan tambahan

| Pilihan | Kesan |
|---|---|
| **Auto-upload audio ke awan** | Selepas rakam/muat naik, audio dimuat naik secara automatik ke awan yang dikonfigurasi |
| **Cari keseluruhan Drive** | Senaraikan semua fail audio/video dalam Drive, bukan hanya folder app. Memerlukan kebenaran akses Drive yang lebih luas |

---

## 8. Tema & paparan

Klik pilihan tema di bar atas:

- **Sistem** — ikut tetapan cerah/gelap peranti anda
- **Cerah** — tema terang
- **Gelap** — tema gelap

Pilihan tema disimpan untuk sesi seterusnya. Aplikasi juga menyokong
**prefers-reduced-motion** (kurangkan animasi) mengikut tetapan sistem anda.

---

## 9. Privasi & keselamatan data

| Data | Di mana disimpan | Dihantar keluar? |
|---|---|---|
| Audio (mod on-device) | Memori pelayar sahaja | ❌ Tidak |
| Transkrip & nota | IndexedDB pelayar | ❌ Tidak |
| Audio mesyuarat (disimpan bersama rekod) | IndexedDB pelayar | ❌ Tidak |
| API key OpenCode | localStorage pelayar | Hanya kepada OpenCode apabila digunakan |
| Kredensial WebDAV | localStorage pelayar | Hanya kepada pelayan WebDAV anda |
| OAuth token Drive | Memori pelayar (luput ~1 jam) | Hanya kepada Google API |
| Tetapan tema/zikir | localStorage pelayar | ❌ Tidak |

**Amalan disyorkan:**
- Gunakan mod on-device untuk mesyuarat sulit.
- Jangan kongsikan peranti dengan akaun pelayar yang sama jika data sensitif.
- Padam mesyuarat lama yang tidak diperlukan.
- Untuk pematuhan organisasi, sahkan dasar penggunaan API pihak ketiga.

---

## 10. Penyelesaian masalah

| Masalah | Punca biasa | Penyelesaian |
|---|---|---|
| "Tidak dapat mengakses mikrofon" | Kebenaran mic ditolak | Klik ikon kunci di bar alamat → benarkan Mikrofon → muat semula |
| Transkripsi mengambil masa lama | Model sedang dimuat turun kali pertama | Tunggu muat turun selesai (lihat peratus); larian seterusnya lebih pantas |
| "Tiada suara dikesan" | Audio senyap/terlalu rendah | Semak audio, naikkan volume rakaman, cuba model Small |
| Transkrip mengulang ayat | Halusinasi model kecil | Guna model Base/Small, tetapkan bahasa dengan betul |
| "Sila masukkan OpenCode API key" | Kunci belum diisi | Tampal API key dalam tab OpenCode |
| "OpenCode API: HTTP 401" | Kunci tidak sah/luput | Jana kunci baharu di OpenCode Console |
| "Transkripsi OpenCode gagal: Failed to fetch" | Kuota percuma habis, atau perkhidmatan OpenCode tidak membenarkan permintaan terus dari pelayar | Gunakan mod **On-device**; jika berterusan, semak kuota/kunci OpenCode |
| "Sambungan gagal: Failed to fetch" (WebDAV) | URL salah, pelayan tiada CORS, tiada internet | Semak URL, pastikan pelayan membenarkan CORS, uji dalam pelayar |
| Butang Simpan tidak boleh ditekan | Kandungan tidak berubah sejak simpanan terakhir | Ini dijangkakan — edit nota/transkrip untuk aktifkan semula |
| Export PDF/Word tidak berlaku | Pop-up/download disekat | Benarkan muat turun automatik untuk laman ini |
| App tidak berfungsi luar talian | Cache service worker belum lengkap | Buka app sekali dengan internet, kemudian cuba semula |

---

## 11. Soalan lazim

**Adakah audio saya dihantar ke pelayan?**
Tidak, melainkan anda memilih mod OpenCode atau mengaktifkan auto-upload awan.
Mod on-device kekal dalam pelayar.

**Bolehkah saya menggunakan app tanpa internet?**
Ya, selepas model Whisper dimuat turun sekali. Mod OpenCode dan import awan
memerlukan internet.

**Berapa lama transkripsi mengambil masa?**
Bergantung pada panjang audio, model dan peranti. Model Tiny paling pantas;
Small paling tepat tetapi lebih lambat.

**Bolehkah saya edit nota yang dijana?**
Ya — kotak nota boleh diedit sepenuhnya sebelum disimpan/eksport.

**Di mana fail saya disimpan selepas eksport?**
Dalam folder Muat Turun (Downloads) pelayar anda.

**Bolehkah saya guna app ini pada telefon?**
Ya. Antara muka responsif untuk skrin kecil, dan rakaman mikrofon berfungsi
pada pelayar mudah alih yang menyokong MediaRecorder.

**Adakah data disegerakkan antara peranti?**
Tidak. Data tersimpan pada pelayar/peranti yang digunakan. Gunakan eksport
atau awan untuk memindahkan hasil.

**Bahasa apa yang disokong?**
Melayu, English, Indonesia, Mandarin, Tamil, dan mod auto-kenal.

---

## 12. Batasan yang diketahui

- Audio melebihi 15 minit diproses dalam segmen automatik; masa pemprosesan
  tetap bergantung pada panjang audio, model dan peranti.
- Kualiti transkripsi bergantung pada kualiti audio. Panel kualiti dan
  pilihan **Tingkatkan audio** membantu, tetapi bunyi latar yang kuat masih
  boleh menjejaskan ketepatan.
- Storan audio tertakluk pada kuota IndexedDB pelayar; padam rekod lama jika
  ruang tidak mencukupi.
- Kualiti transkripsi bergantung pada kualiti audio; bising latar belakang
  menjejaskan ketepatan.
- Nota auto ialah draf — sentiasa semak sebelum diedarkan.
- WebKit (Safari) dan Firefox belum diuji sepenuhnya dalam audit terkini;
  Chrome/Edge/Chromium disyorkan.

---

## 13. Untuk pembangun

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # binaan produksi ke dist/
npm run preview  # cuba binaan produksi
npx vitest run   # ujian unit
```

Dokumentasi audit dan keputusan kejuruteraan: folder [`audit/`](audit/).

---

*Panduan ini dikemas kini pada 16 November 2026 (v1.3). Jika antara muka berubah,
sila kemas kini panduan ini bersama perubahan tersebut.*
