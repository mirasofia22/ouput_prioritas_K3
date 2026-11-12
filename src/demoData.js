// Data CONTOH (fiktif) dipakai saat VITE_API_URL belum diisi.
// Formatnya sama dengan tab Data_RO di Google Sheet dan respons backend /api/output.
const M = 1_000_000;
const AMBANG_FRAG = 100 * M;

// [nama, jenis, provinsi, regional]
const SATKER = [
  ['BPDAS Contoh 01', 'BPDAS', 'Aceh', 'Sumatera'],
  ['BPDAS Contoh 02', 'BPDAS', 'Jawa Barat', 'Jawa'],
  ['BPDAS Contoh 03', 'BPDAS', 'Nusa Tenggara Timur', 'Bali dan Nusa Tenggara'],
  ['BPDAS Contoh 04', 'BPDAS', 'Kalimantan Timur', 'Kalimantan'],
  ['BPDAS Contoh 05', 'BPDAS', 'Sulawesi Selatan', 'Sulawesi'],
  ['BPDAS Contoh 06', 'BPDAS', 'Papua', 'Maluku dan Papua'],
  ['BPTH Contoh 01', 'BPTH', 'DI Yogyakarta', 'Jawa'],
];

// [kode_ro, uraian, kategori, prioritas, satuan, volume dasar, nilai dasar (juta)]
const RO = [
  ['7274.RAG.001', 'Rehabilitasi hutan dan lahan secara sipil teknis di DAS yang dipulihkan', 'Konservasi Tanah & Reklamasi', true, 'Unit', 60, 2100],
  ['7274.REA.001', 'Fasilitasi pembinaan reklamasi hutan dan rehabilitasi DAS', 'Konservasi Tanah & Reklamasi', true, 'Hektar', 150, 60],
  ['7275.RBK.001', 'Penyediaan benih dan bibit berkualitas', 'Perbenihan/Bibit', true, 'Unit', 500000, 5200],
  ['7275.REA.002', 'Pemantauan RHL secara vegetatif', 'Pembinaan & Kelembagaan RHL', false, 'Hektar', 2000, 320],
  ['7275.REA.003', 'Rehabilitasi daerah imbuhan mata air secara vegetatif', 'Rehabilitasi', true, 'Hektar', 30, 45],
  ['7276.QDB.001', 'Peningkatan kapasitas stakeholder dalam pengelolaan DAS', 'Perencanaan & Data DAS', false, 'Lembaga', 1, 70],
  ['7276.UAB.001', 'Penyediaan data dan informasi kinerja DAS', 'Perencanaan & Data DAS', false, 'Sistem Informasi', 1, 700],
  ['7277.BDB.002', 'Fasilitasi pembinaan kelembagaan rehabilitasi hutan', 'Pembinaan & Kelembagaan RHL', false, 'Lembaga', 1, 300],
  ['7277.REA.001', 'Rehabilitasi hutan secara vegetatif berbasis masyarakat', 'Rehabilitasi', true, 'Hektar', 300, 4800],
  ['7278.REA.001', 'Rehabilitasi hutan mangrove', 'Rehabilitasi', true, 'Hektar', 40, 420],
  ['7316.EBA.956', 'Layanan BMN', 'Dukungan Manajemen', false, 'Layanan', 1, 8],
  ['7316.EBA.962', 'Layanan Umum', 'Dukungan Manajemen', false, 'Layanan', 1, 520],
  ['7316.EBA.994', 'Layanan Perkantoran', 'Dukungan Manajemen', false, 'Layanan', 1, 11000],
];

// Pengacak tetap (hasil selalu sama) supaya angka contoh tidak berubah tiap dimuat.
let benih = 7;
const acak = () => { benih = (benih * 16807) % 2147483647; return benih / 2147483647; };

const ro = [];
SATKER.forEach(([nama, jenis, provinsi, regional], i) => {
  const no = i + 1;
  const daftar = jenis === 'BPTH' ? RO.filter((r) => /7275|7316/.test(r[0])) : RO;
  const baris = daftar.map(([kode, uraian, kategori, prioritas, satuan, vol, nilai], j) => {
    const f = 0.6 + acak() * 0.9;
    const janggal = satuan === 'Hektar' && kode === '7278.REA.001' && no % 2 === 0;
    return {
      id_baris: `S${String(no).padStart(2, '0')}-R${(j + 1) * 7}`, no_satker: no, nama_satker: nama, jenis_satker: jenis,
      provinsi, regional, kode_kegiatan: kode.slice(0, 4), uraian_kegiatan: '', kode_kro: kode.slice(0, 8),
      uraian_kro: '', label_kro: no === 6 && kode.startsWith('7275') ? 'Program Baru - Penambahan Anggaran' : 'Base Line',
      lokasi_kro: '', kode_ro: kode, uraian_ro: uraian,
      volume: janggal ? 0.0001 : Math.round(vol * f), satuan, nilai_ro_rp: Math.round(nilai * f) * M,
      sel_nilai: `J${(j + 1) * 7}`, sel_volume: `G${(j + 1) * 7}`, catatan_data: janggal ? 'Volume sangat kecil, kemungkinan placeholder' : '',
      kategori_output: kategori, output_prioritas: prioritas,
    };
  });
  const pagu = baris.reduce((a, r) => a + r.nilai_ro_rp, 0);
  [...baris].sort((a, b) => b.nilai_ro_rp - a.nilai_ro_rp).forEach((r, k, urut) => {
    r.pagu_satker_rp = pagu;
    r.porsi_ro_thd_pagu = r.nilai_ro_rp / pagu;
    r.peringkat_ro_satker = k + 1;
    r.porsi_kumulatif_satker = urut.slice(0, k + 1).reduce((a, x) => a + x.nilai_ro_rp, 0) / pagu;
    r.masuk_top_n = k < 5;
    r.ro_bawah_ambang = r.nilai_ro_rp < AMBANG_FRAG;
    r.volume_janggal = r.satuan === 'Hektar' && r.volume < 0.01;
    r.program_baru_penambahan = r.label_kro === 'Program Baru - Penambahan Anggaran';
  });
  ro.push(...baris);
});

export const DEMO = {
  diperbarui: '2026-11-12',
  jumlah_baris: ro.length,
  jumlah_satker: SATKER.length,
  catatan: [],
  ro,
};
