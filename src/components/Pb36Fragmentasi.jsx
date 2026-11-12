import { useMemo } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import Tabel from './Tabel.jsx';
import Kpi from './Kpi.jsx';
import { AMBANG, WARNA } from '../config.js';
import { num, pct, potong, rp, singkatSatker } from '../format.js';

export default function Pb36Fragmentasi({ D }) {
  const s = useMemo(() => [...D.satker].sort((a, b) => b.frag - a.frag).slice(0, AMBANG.satkerFragTeratas), [D]);
  const grafik = useMemo(() => ({
    labels: s.map((x) => singkatSatker(x.nama)),
    datasets: [{ label: 'Jumlah RO', data: s.map((x) => x.frag), backgroundColor: WARNA.amber }],
    options: { indexAxis: 'y' },
  }), [s]);

  return (
    <>
      <Kpi isi={[
        { label: 'RO terfragmentasi', nilai: num(D.nFrag), ket: `${pct(D.nFrag / D.nRO, 0)} dari seluruh RO`, w: true },
        { label: 'Nilai total', nilai: rp(D.vFrag), ket: `${pct(D.vFrag / D.total, 2)} dari pagu` },
        { label: 'RO volume janggal', nilai: num(D.janggalRows.length), ket: rp(D.vJanggal), w: true },
        { label: 'Baris kode RO ganda', nilai: num(D.nDobel), ket: 'perlu konfirmasi satker' },
      ]} />
      <div className="card">
        <h2>{AMBANG.satkerFragTeratas} satker dengan RO terfragmentasi terbanyak</h2>
        <ChartCanvas type="bar" tinggi={520} {...grafik} fmt={num} />
      </div>
      <div className="card">
        <h2>{D.janggalRows.length} RO bervolume janggal · {rp(D.vJanggal)}</h2>
        <Tabel kunci={(x) => x.id_baris} baris={D.janggalRows} kolom={[
          { h: 'Satker', f: (x) => x.nama_satker },
          { h: 'Kode RO', f: (x) => x.kode_ro },
          { h: 'Volume', n: 1, f: (x) => (x.volume_kosong ? '(kosong)' : `${x.volume} ${x.satuan}`) },
          { h: 'Sel volume', f: (x) => x.sel_volume },
          { h: 'Nilai', n: 1, f: (x) => rp(x.nilai_ro_rp) },
          { h: 'Pertanyaan klarifikasi', f: (x) => `Berapa target ${x.satuan.toLowerCase()} sebenarnya untuk ${x.kode_ro}?` },
        ]} />
      </div>
      <div className="card">
        <h2>RO di bawah ambang, nilai terkecil lebih dulu</h2>
        <Tabel kunci={(x) => x.id_baris} baris={D.fragRows} kolom={[
          { h: 'Satker', f: (x) => x.nama_satker },
          { h: 'Kode RO', f: (x) => x.kode_ro },
          { h: 'Uraian', f: (x) => potong(x.uraian_ro, AMBANG.panjangUraian) },
          { h: 'Nilai', n: 1, f: (x) => rp(x.nilai_ro_rp) },
          { h: 'Sel', f: (x) => x.sel_nilai },
        ]} />
      </div>
    </>
  );
}
