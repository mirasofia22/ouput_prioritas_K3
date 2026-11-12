import { useCallback, useEffect, useMemo, useState } from 'react';
import { ambilData, PAKAI_API } from './api.js';
import { hitung } from './analisis.js';
import { REFRESH_MENIT } from './config.js';
import Header from './components/Header.jsx';
import NavPB from './components/NavPB.jsx';
import Pb31Konsentrasi from './components/Pb31Konsentrasi.jsx';
import Pb32Frekuensi from './components/Pb32Frekuensi.jsx';
import Pb33Prioritas from './components/Pb33Prioritas.jsx';
import Pb34Penambahan from './components/Pb34Penambahan.jsx';
import Pb35Volume from './components/Pb35Volume.jsx';
import Pb36Fragmentasi from './components/Pb36Fragmentasi.jsx';

const PB = [
  { kode: 'PB3.1', judul: 'Konsentrasi anggaran', ket: 'Seberapa besar pagu satker terpusat di 5 RO terbesar', Panel: Pb31Konsentrasi },
  { kode: 'PB3.2', judul: 'Frekuensi RO', ket: 'KRO dan RO yang muncul di banyak satker serta total nilainya', Panel: Pb32Frekuensi },
  { kode: 'PB3.3', judul: 'Output prioritas', ket: 'Porsi pagu pada kategori prioritas (rehabilitasi, perbenihan, KTA) dan RO dengan alokasi terbesar', Panel: Pb33Prioritas },
  { kode: 'PB3.4', judul: 'Penambahan anggaran', ket: 'KRO berlabel Program Baru – Penambahan Anggaran per satker dan wilayah', Panel: Pb34Penambahan },
  { kode: 'PB3.5', judul: 'Volume target', ket: 'Volume output (Ha, unit bibit, unit KTA) per satker dan sebarannya antarwilayah', Panel: Pb35Volume },
  { kode: 'PB3.6', judul: 'Fragmentasi', ket: 'RO bernilai di bawah ambang dan RO dengan volume kosong atau janggal', Panel: Pb36Fragmentasi },
];

const dariHash = () => Math.max(0, PB.findIndex((p) => `#${p.kode}` === window.location.hash));

export default function App() {
  const [raw, setRaw] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [dicek, setDicek] = useState(null);
  const [aktif, setAktif] = useState(dariHash);

  const muat = useCallback(async (paksa = false) => {
    setMemuat(true);
    try {
      setRaw(await ambilData({ paksa }));
      setGalat('');
    } catch (e) {
      setGalat(e.message); // data terakhir tetap tampil
    }
    setDicek(new Date());
    setMemuat(false);
  }, []);

  useEffect(() => {
    muat();
    const t = setInterval(() => muat(), REFRESH_MENIT * 60 * 1000);
    return () => clearInterval(t);
  }, [muat]);

  useEffect(() => {
    const ubah = () => setAktif(dariHash());
    window.addEventListener('hashchange', ubah);
    return () => window.removeEventListener('hashchange', ubah);
  }, []);

  const pilih = (i) => {
    setAktif(i);
    window.location.hash = PB[i].kode;
  };

  const D = useMemo(() => (raw?.ro?.length ? hitung(raw.ro) : null), [raw]);
  const { kode, judul, ket, Panel } = PB[aktif];

  return (
    <>
      <Header raw={raw} dicek={dicek} memuat={memuat} onMuat={() => muat(true)} />
      <main className="wrap side">
        <NavPB daftar={PB} aktif={aktif} onPilih={pilih} />
        <section id="pn">
          {!PAKAI_API && <div className="notice">VITE_API_URL belum diisi, menampilkan data contoh (fiktif).</div>}
          {galat && (
            <div className="notice error">
              Gagal mengambil data terbaru: {galat}. {raw ? 'Menampilkan data terakhir yang berhasil dimuat.' : ''}
            </div>
          )}
          {raw?.catatan?.length > 0 && <div className="notice">Catatan dari sheet: {raw.catatan.join('; ')}</div>}

          <h2 style={{ fontSize: 22, marginBottom: 4 }}>{kode} {judul}</h2>
          <p className="muted" style={{ marginBottom: 14 }}>{ket}</p>
          {D ? <Panel D={D} /> : <div className="loading">{galat ? 'Data belum bisa dimuat.' : 'Memuat data…'}</div>}

          <footer className="foot muted">
            Sumber: tab Data_RO, K3_Data_RO_Bersih_PDASRH_2026 ({raw?.jumlah_baris ?? 0} RO, {raw?.jumlah_satker ?? 0} satker).
            Ambang Top-N, fragmentasi, volume janggal, dan kategori prioritas diatur di tab Parameter Google Sheet.
          </footer>
        </section>
      </main>
    </>
  );
}
