# Log Pelaksanaan — AAERA v1.0.0

## 14 November 2026

### BATCH 1 — TASK-001 (SEC-002) ✅ VERIFIED
- `gdrive.js`: `scopeFor(searchAll)` dieksport — `drive.file` lalai, `auth/drive`
  hanya bila searchAll. `getAccessToken(clientId, scope)` dengan cache
  sedar-skop (`tokenScope`).
- `cloud.js`: 5 call site menghantar skop yang betul.
- Binaan lulus. E2E Drive NOT TESTED (tiada Client ID) — direkodkan.

### BATCH 2 — TASK-002 (DEF-A11Y-009) ✅ VERIFIED
- `App.jsx`: butang segmented modal kini `role="tab"` + `aria-selected`.
- Pengesahan: axe-core semula = **0 serious/critical**.

### BATCH 2 — TASK-003 (DEF-FUNC-005) ✅ VERIFIED
- `App.jsx`: state `savedSig` (signature transcript|minutes|mode);
  `saveDisabled` melumpuhkan butang Simpan bila kandungan tidak berubah;
  `openMeeting` menetapkan semula.
- Pengesahan: TC-10 dikemas kini — simpan berturut = 1 rekod sahaja,
  butang dilumpuhkan; TC-12 semula — butang aktif semula selepas buka.

### BATCH 3 — TASK-004 (SEC-003) ✅ VERIFIED
- transformers 3.3.1 → **4.3.2**. Binaan lulus; bundle utama turun
  1,070 → 754 kB (gzip 294 → 227 kB).
- **Isu semasa naik taraf**: v4 memuatkan backend WASM melalui blob: URL —
  CSP menyekatnya. Pembetulan: `script-src` + `blob:` (blob same-origin,
  selamat). Gerbang e2e tiny lulus selepas itu (langkah Nota aktif,
  0 pageerror).
- **npm audit: 0 kerentanan** (sebelum ini 2 high + 1 moderate).

### BATCH 4 — TASK-005 ✅ VERIFIED
- Regresi penuh Playwright: 20 kes — tiada FAIL fungsional (TC-11 "FAIL"
  skrip lama menjangka 2 rekod; dedup kini sah menghasilkan 1 — disahkan
  semula PASS melalui ujian terarah: kekal selepas reload).
- Vitest 9/9 lulus.
- Laporan, dashboard, daftar kecacatan dikemas kini.

## Status muktamad: SEMUA 5 TASK VERIFIED
