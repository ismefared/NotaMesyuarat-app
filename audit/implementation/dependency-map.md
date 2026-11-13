# Peta Kebergantungan Pelaksanaan

```
TASK-001 (gdrive.js, cloud.js)  ─┐
TASK-002 (App.jsx: modal)        ├─ tidak bergantung antara satu sama lain
TASK-003 (App.jsx: saveMeeting) ┘
TASK-004 (package.json)  ── perlu selesai sebelum TASK-005 (regresi akhir
                            mesti dijalankan ke atas keadaan dependensi muktamad)
TASK-005 (regresi + laporan) ── selepas SEMUA batch
```

Ketamadunan: tiada antara TASK-001/002/003. TASK-004 berisiko revert —
dilaksanakan selepas 001–003 disahkan supaya revert v4 tidak membatalkan
pembetulan lain.

# Fail Terjejas

| Fail | Task | Jenis ubahan |
|---|---|---|
| src/lib/gdrive.js | TASK-001 | scopeFor + cache sedar-skop |
| src/lib/cloud.js | TASK-001 | hantar skop ikut operasi |
| src/App.jsx | TASK-002, TASK-003 | role tab; dedup Simpan |
| package.json / package-lock.json | TASK-004 | transformers v4 (bersyarat) |

# Penilaian Risiko

| Risiko | Kebutuhan | Mitigasi |
|---|---|---|
| Token drive.file menafikan akses fail lama | Sederhana | Fail lama dicipta oleh client ID yang sama → kekal diakses; searchAll guna skop penuh |
| Transformers v4 memecahkan laluan transkripsi | Tinggi | Gerbang e2e tiny + revert bersih (package.json dikawal versi) |
| Dedup Simpan menyekat simpan sah | Rendah | Signature termasuk transcript+minutes+mode+details — sebarang ubahan mengaktifkan semula |
| Regresi UI | Rendah | Suite Playwright penuh selepas setiap batch |
