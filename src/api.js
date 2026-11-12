import { DEMO } from './demoData.js';

// VITE_API_URL:
//   "/"                       -> backend JavaScript di proyek Vercel yang sama (api/output.js)
//   "https://xxx.vercel.app"  -> backend terpisah
//   kosong                    -> data contoh
const API_RAW = (import.meta.env.VITE_API_URL || '').trim();
const API_URL = API_RAW.replace(/\/+$/, '');
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

export const PAKAI_API = Boolean(API_RAW);

const KOLOM_ANGKA = [
  'no_satker', 'volume', 'nilai_ro_rp', 'pagu_satker_rp', 'porsi_ro_thd_pagu',
  'peringkat_ro_satker', 'porsi_kumulatif_satker',
];
const KOLOM_YA = ['program_baru_penambahan', 'output_prioritas', 'masuk_top_n', 'ro_bawah_ambang', 'volume_janggal'];

/**
 * Mengambil baris RO dari backend yang membaca tab Data_RO di Google Sheet.
 * Tanpa VITE_API_URL -> data contoh. Bila backend gagal, error dilempar supaya App
 * tetap menampilkan data terakhir yang berhasil.
 */
export async function ambilData({ paksa = false } = {}) {
  if (!PAKAI_API) return { ...DEMO, sumber: 'demo' };

  const res = await fetch(`${API_URL}/api/output${paksa ? '?refresh=true' : ''}`, {
    headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
  });
  let json = {};
  try { json = await res.json(); } catch { /* bukan JSON */ }
  if (!res.ok) throw new Error(json.detail || `Backend menjawab ${res.status}`);
  if (!Array.isArray(json.ro)) throw new Error('Format respons tidak sesuai (field "ro" tidak ada).');
  return { ...json, ro: json.ro.map(normalisasi), sumber: 'api' };
}

function angka(v) {
  if (typeof v === 'number') return v;
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function normalisasi(r) {
  const out = { ...r };
  KOLOM_ANGKA.forEach((k) => { out[k] = angka(r[k]); });
  KOLOM_YA.forEach((k) => { out[k] = r[k] === true || /^ya$/i.test(String(r[k] ?? '')); });
  return out;
}
