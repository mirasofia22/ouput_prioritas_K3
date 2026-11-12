// Backend Dashboard PB3 Output Prioritas PDASRH (Vercel Function, JavaScript).
// URL: https://<proyek>.vercel.app/api/output   (tambahkan ?refresh=true untuk abaikan cache)
// Membaca tab Data_RO di Google Sheet sebagai CSV. Pengaturan di Vercel -> Settings -> Environment Variables:
//   SHEET_CSV_URL  (wajib)    link tab Data_RO di Google Sheet ("Anyone with the link: Viewer"), sertakan #gid=...
//   API_TOKEN      (opsional) bila diisi, request harus membawa header Authorization: Bearer <token>
//   CACHE_SECONDS  (opsional, default 60)

const KOLOM_WAJIB = ['id_baris', 'no_satker', 'nama_satker', 'kode_ro', 'nilai_ro_rp'];
const KOLOM_ANGKA = [
  'no_satker', 'volume', 'nilai_ro_rp', 'pagu_satker_rp', 'porsi_ro_thd_pagu',
  'peringkat_ro_satker', 'porsi_kumulatif_satker',
];
const KOLOM_YA = ['program_baru_penambahan', 'output_prioritas', 'masuk_top_n', 'ro_bawah_ambang', 'volume_janggal'];
const KOLOM_TEKS = [
  'id_baris', 'nama_satker', 'jenis_satker', 'provinsi', 'regional', 'kode_kegiatan', 'uraian_kegiatan',
  'kode_kro', 'uraian_kro', 'label_kro', 'lokasi_kro', 'kode_ro', 'uraian_ro', 'satuan',
  'sel_nilai', 'sel_volume', 'catatan_data', 'kategori_output',
];
const KOLOM_PERSEN = ['porsi_ro_thd_pagu', 'porsi_kumulatif_satker'];

const cache = { waktu: 0, data: null };

class GalatData extends Error {
  constructor(status, pesan) { super(pesan); this.status = status; }
}

// Ubah link Google Sheet biasa (/edit#gid=..) atau "Publish to web" menjadi link CSV.
export function keUrlCsv(url) {
  if (/output=csv|format=csv/.test(url)) return url;
  const gid = url.match(/[#&?]gid=(\d+)/);
  if (url.includes('/spreadsheets/d/e/')) {
    const dasar = url.split('#')[0].replace(/\/pub(html)?(\?.*)?$/, '/pub');
    return `${dasar}?output=csv${gid ? `&gid=${gid[1]}&single=true` : ''}`;
  }
  const id = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return id ? `https://docs.google.com/spreadsheets/d/${id[1]}/export?format=csv&gid=${gid ? gid[1] : 0}` : url;
}

// Terima 2419222000 / "2,419,222,000" / "2.419.222.000" / "Rp 2.419.222.000" / "5.3%" / "0,0001" / kosong.
// Persen dikembalikan sebagai pecahan (5.3% -> 0.053).
export function keAngka(v) {
  if (v === null || v === undefined) return 0;
  const teks = String(v).trim();
  const persen = teks.endsWith('%');
  const negatif = /^\(.*\)$/.test(teks);
  let s = teks.replace(/[^\d.,eE-]/g, '');
  if (!s || s === '-') return 0;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  else if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
  else if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
  let n = Number(s);
  if (!Number.isFinite(n)) return 0;
  if (persen) n /= 100;
  return negatif ? -n : n;
}

const keYa = (v) => /^(ya|y|true|1)$/i.test(String(v ?? '').trim());

// Parser CSV sederhana yang mendukung tanda kutip ("a, b") dan baris baru di dalam kutip.
export function parseCsv(teks) {
  const baris = []; let kolom = []; let sel = ''; let kutip = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (kutip) {
      if (c === '"' && teks[i + 1] === '"') { sel += '"'; i++; }
      else if (c === '"') kutip = false;
      else sel += c;
    } else if (c === '"') kutip = true;
    else if (c === ',') { kolom.push(sel); sel = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && teks[i + 1] === '\n') i++;
      kolom.push(sel); baris.push(kolom); kolom = []; sel = '';
    } else sel += c;
  }
  if (sel !== '' || kolom.length) { kolom.push(sel); baris.push(kolom); }
  return baris.filter((b) => b.some((x) => x.trim() !== ''));
}

async function ambilCsv(url) {
  if (!/^https?:\/\//.test(url)) {               // untuk uji lokal: path file
    const fs = await import('node:fs/promises');
    return fs.readFile(url, 'utf8');
  }
  const res = await fetch(keUrlCsv(url), { redirect: 'follow' });
  const teks = await res.text();
  if (!res.ok || /^\s*<!DOCTYPE html/i.test(teks)) {
    throw new GalatData(502, 'Gagal membaca Google Sheet. Pastikan Share = "Anyone with the link: Viewer".');
  }
  return teks;
}

export async function bacaSheet(url) {
  if (!url) throw new GalatData(500, 'SHEET_CSV_URL belum diisi di Environment Variables Vercel.');
  const [header, ...isi] = parseCsv((await ambilCsv(url)).replace(/^\uFEFF/, ''));
  if (!header) throw new GalatData(422, 'Sheet kosong.');
  const kol = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const hilang = KOLOM_WAJIB.filter((k) => !kol.includes(k));
  if (hilang.length) throw new GalatData(422, `Kolom wajib tidak ada di sheet: ${hilang.join(', ')}. Pastikan link mengarah ke tab Data_RO.`);

  const catatan = [];
  const ro = isi
    .map((b) => Object.fromEntries(kol.map((k, i) => [k, (b[i] ?? '').trim()])))
    .filter((r) => r.id_baris && r.kode_ro)
    .map((r) => {
      const item = {};
      KOLOM_TEKS.forEach((k) => { item[k] = r[k] ?? ''; });
      KOLOM_ANGKA.forEach((k) => { item[k] = keAngka(r[k]); });
      KOLOM_YA.forEach((k) => { item[k] = keYa(r[k]); });
      // Porsi yang tertulis tanpa tanda % tetapi > 1 dianggap persen penuh (mis. 5,3 -> 0,053).
      KOLOM_PERSEN.forEach((k) => { if (item[k] > 1) item[k] /= 100; });
      item.volume_kosong = (r.volume ?? '') === '';
      if (item.nilai_ro_rp <= 0) catatan.push(`${item.id_baris}: nilai RO kosong/nol`);
      return item;
    });

  const satker = new Set(ro.map((r) => r.no_satker));
  return {
    diperbarui: new Date().toISOString().slice(0, 10),
    dibaca_pada: new Date().toISOString(),
    jumlah_baris: ro.length,
    jumlah_satker: satker.size,
    catatan,
    ro,
  };
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const token = process.env.API_TOKEN || '';
  if (token && req.headers.authorization !== `Bearer ${token}`) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ detail: 'Token tidak valid.' }));
  }

  const refresh = new URL(req.url, 'http://x').searchParams.get('refresh') === 'true';
  const umurCache = Number(process.env.CACHE_SECONDS || 60) * 1000;
  try {
    if (refresh || !cache.data || Date.now() - cache.waktu > umurCache) {
      cache.data = await bacaSheet(process.env.SHEET_CSV_URL || '');
      cache.waktu = Date.now();
    }
    res.statusCode = 200;
    res.end(JSON.stringify(cache.data));
  } catch (e) {
    res.statusCode = e.status || 500;
    res.end(JSON.stringify({ detail: e.message }));
  }
}
