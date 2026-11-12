# Dashboard PB3 Output Prioritas PDASRH (Frontend React + Vite)

Dashboard Kelompok 3 (Prioritas dan Konsentrasi Output) untuk menjawab PB3.1 sampai PB3.6 dari RKA satker
Ditjen PDASRH T.A. 2026. Data berasal dari tab **Data_RO** di Google Sheet `K3_Data_RO_Bersih_PDASRH_2026`.

```
Google Sheet (tab Data_RO)  --CSV-->  api/output.js (JavaScript, Vercel)  -->  /api/output  -->  dashboard React (Vercel)
```
Frontend dan backend berada di SATU proyek Vercel. Folder `api/` otomatis menjadi Vercel Function.

## Menjalankan di laptop
```bash
npm install
npm run dev          # buka http://localhost:5173
```
Tanpa `VITE_API_URL`, dashboard memakai **data contoh** (fiktif) dan memberi label "DATA CONTOH".
Untuk mencoba backend secara lokal, jalankan `vercel dev` (Vercel CLI) dengan `.env.local` berisi
`SHEET_CSV_URL=...` dan `VITE_API_URL=/`.

Dashboard mengecek backend setiap 1 menit (`REFRESH_MENIT` di `src/config.js`). Bila backend gagal, data terakhir tetap tampil dengan pesan galat.

## Tampilan
Tata letak mengikuti `layout-2.html`: header di atas, navigasi PB di kiri (`#nav`), panel jawaban di kanan (`#pn`).
Gaya ada di `public/shared.css`. **File `shared.css` asli tidak ikut diterima**, jadi file di repo ini disusun ulang dari
kelas dan warna yang dipakai `layout-2.html`. Timpa `public/shared.css` dengan file asli agar tampilan identik;
nama kelas yang dipakai komponen sama dengan `layout-2.html`.

| Fungsi di layout-2.html | Komponen React |
|---|---|
| `head(1)` | `src/components/Header.jsx` |
| `#nav` dan `show(i)` | `src/components/NavPB.jsx` dan `App.jsx` (hash `#PB3.1` dst. tetap dipakai) |
| `mk(id, type, labels, datasets, opts, fmt)` | `src/components/ChartCanvas.jsx` (Chart.js 4.4.1) |
| `tbl(kolom, baris)` | `src/components/Tabel.jsx` |
| kartu `.kpis` / `.kpi.w` | `src/components/Kpi.jsx` |

## Isi tiap PB
| PB | Panel | Visual |
|---|---|---|
| PB3.1 | `Pb31Konsentrasi.jsx` | KPI median rasio; bar rasio top-5 RO per satker (merah bila > 90%); tabel 5 RO terbesar beserta sel nilai |
| PB3.2 | `Pb32Frekuensi.jsx` | Tabel 15 RO paling sering muncul; tabel KRO menurut jumlah satker |
| PB3.3 | `Pb33Prioritas.jsx` | Donat prioritas vs lainnya; bar pagu per kategori; tabel porsi prioritas dan RO terbesar per satker; tabel 15 RO dengan alokasi terbesar |
| PB3.4 | `Pb34Penambahan.jsx` | Bar nilai Program Baru per satker; tabel per satker/wilayah; tabel RO dengan sel nilai; tabel pembanding label lain |
| PB3.5 | `Pb35Volume.jsx` | Bar bertumpuk luas (Ha) per regional; bar bibit dan bangunan KTA per regional; tabel per regional dan per satker |
| PB3.6 | `Pb36Fragmentasi.jsx` | KPI fragmentasi dan volume janggal; bar 20 satker; tabel RO bervolume janggal dengan pertanyaan klarifikasi; tabel RO di bawah ambang |

Logika ringkasan ada di `src/analisis.js`. Pengaturan tampilan (warna, jumlah baris tabel) ada di `src/config.js`.
Ambang analisis (Top-N, fragmentasi, volume janggal, kategori prioritas) **tidak** dihitung ulang di dashboard:
nilainya dibaca dari kolom `Masuk_Top_N`, `RO_Bawah_Ambang`, `Volume_Janggal`, `Output_Prioritas` yang diatur lewat tab Parameter di Sheet.

## Kolom yang dibaca dari tab Data_RO
`ID_Baris, No_Satker, Nama_Satker, Jenis_Satker, Provinsi, Regional, Kode_Kegiatan, Uraian_Kegiatan, Kode_KRO, Uraian_KRO,
Label_KRO, Program_Baru_Penambahan, Lokasi_KRO, Kode_RO, Uraian_RO, Volume, Satuan, Nilai_RO_Rp, Pagu_Satker_Rp,
Porsi_RO_thd_Pagu, Sel_Nilai, Sel_Volume, Catatan_Data, Kategori_Output, Output_Prioritas, Peringkat_RO_Satker,
Porsi_Kumulatif_Satker, Masuk_Top_N, RO_Bawah_Ambang, Volume_Janggal`

Kolom wajib: `ID_Baris, No_Satker, Nama_Satker, Kode_RO, Nilai_RO_Rp`. Angka boleh berformat `2,419,222,000`,
`2.419.222.000`, atau `Rp 2.419.222.000`; persen boleh `5.3%`; kolom Ya/Tidak dibaca sebagai benar/salah.

## Kontrak API yang dikirim backend
`GET {VITE_API_URL}/api/output`  (header opsional `Authorization: Bearer <token>`)
```json
{
  "diperbarui": "2026-11-12",
  "jumlah_baris": 615,
  "jumlah_satker": 37,
  "catatan": [],
  "ro": [
    { "id_baris": "S01-R5", "no_satker": 1, "nama_satker": "BPDAS KRUENG ACEH", "jenis_satker": "BPDAS",
      "provinsi": "Aceh", "regional": "Sumatera", "kode_kegiatan": "7274", "kode_kro": "7274.RAG",
      "label_kro": "Base Line", "program_baru_penambahan": false, "kode_ro": "7274.RAG.001",
      "volume": 110, "satuan": "Unit", "nilai_ro_rp": 2419222000, "pagu_satker_rp": 45320796000,
      "porsi_ro_thd_pagu": 0.0534, "sel_nilai": "J5", "sel_volume": "G5", "kategori_output": "Konservasi Tanah & Reklamasi",
      "output_prioritas": true, "peringkat_ro_satker": 5, "porsi_kumulatif_satker": 0.8625, "masuk_top_n": true,
      "ro_bawah_ambang": false, "volume_janggal": false, "volume_kosong": false }
  ]
}
```

## Deploy ke Vercel (frontend + backend sekaligus)
1. Upload ISI folder ini ke repo GitHub (tanpa `node_modules`, `dist`, `.env.local`). `package.json`, `vercel.json`,
   `index.html`, `vite.config.js`, folder `src/`, `public/`, dan `api/` harus ada di halaman utama repo.
2. Vercel → Add New → Project → Import repo. Framework: **Vite** (otomatis).
3. Environment Variables:
   | Nama | Isi |
   |---|---|
   | `SHEET_CSV_URL` | link tab Data_RO, misalnya `https://docs.google.com/spreadsheets/d/<ID>/edit#gid=<gid tab Data_RO>` (Share: "Anyone with the link: Viewer") |
   | `VITE_API_URL` | `/` |
   | `API_TOKEN` + `VITE_API_TOKEN` | opsional, isi keduanya dengan nilai yang sama |
4. Deploy. Cek `https://<proyek>.vercel.app/api/output` → harus keluar JSON.
5. Dashboard menampilkan label hijau **Google Sheet**. Edit Sheet → dashboard berubah dalam ±1–2 menit.
   Mengubah Environment Variables → Deployments → Redeploy.

Pastikan `#gid=` pada link menunjuk tab **Data_RO**, bukan tab pertama (Ringkasan_KPI). Tanpa gid, Google mengirim tab pertama
dan backend menjawab "Kolom wajib tidak ada di sheet".

## Catatan keamanan
Situs Vercel bersifat publik dan isi `VITE_*` terlihat di browser. Untuk data anggaran asli:
- aktifkan Vercel Password/Deployment Protection, atau
- isi `API_TOKEN`/`VITE_API_TOKEN` untuk mencegah pemakaian iseng (token tetap terlihat di browser);
- untuk demo publik, gunakan data yang sudah dimasking.
