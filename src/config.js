// ==== Pengaturan Dashboard PB3 Output Prioritas ====
// Ambang analisis utama (Top-N, ambang fragmentasi, batas volume janggal, kategori prioritas) diatur di
// Google Sheet tab Parameter dan sudah tertulis di kolom Masuk_Top_N, RO_Bawah_Ambang, Volume_Janggal,
// Output_Prioritas. Pengaturan di bawah ini hanya untuk tampilan.

export const AMBANG = {
  konsentrasiTinggi: 0.9,   // rasio top-5 RO >= 90% pagu diberi warna merah (PB3.1)
  jumlahRoTeratas: 15,      // jumlah RO pada tabel frekuensi dan alokasi terbesar (PB3.2, PB3.3)
  satkerFragTeratas: 20,    // jumlah satker pada grafik fragmentasi (PB3.6)
  panjangUraian: 70,        // uraian dipotong agar tabel tetap ringkas
};

// Dashboard bertanya ke backend setiap N menit. Backend menyimpan hasil baca sheet selama CACHE_SECONDS (default 60 detik).
export const REFRESH_MENIT = 1;

export const WARNA = {
  hijau: '#1B5E43',
  merah: '#B4432F',
  amber: '#C98A1B',
  abu: '#C9D3CE',
};

// Urutan dan warna kategori output (nilai sama persis dengan kolom Kategori_Output di sheet).
export const KATEGORI = [
  'Rehabilitasi',
  'Perbenihan/Bibit',
  'Konservasi Tanah & Reklamasi',
  'Pembinaan & Kelembagaan RHL',
  'Perencanaan & Data DAS',
  'Dukungan Manajemen',
];
export const COL = {
  'Rehabilitasi': '#1B5E43',
  'Perbenihan/Bibit': '#5E9C76',
  'Konservasi Tanah & Reklamasi': '#C98A1B',
  'Pembinaan & Kelembagaan RHL': '#6E8B99',
  'Perencanaan & Data DAS': '#A7B4AD',
  'Dukungan Manajemen': '#C9D3CE',
};

// Volume dibaca per jenis output: Hektar per kategori, Unit bibit, dan Unit bangunan KTA.
export const KATEGORI_BIBIT = 'Perbenihan/Bibit';
export const KATEGORI_KTA = 'Konservasi Tanah & Reklamasi';
export const KATEGORI_REHAB = 'Rehabilitasi';

export const REGIONAL = ['Sumatera', 'Jawa', 'Bali dan Nusa Tenggara', 'Kalimantan', 'Sulawesi', 'Maluku dan Papua'];

export const LABEL_PROGRAM_BARU = 'Program Baru - Penambahan Anggaran';
