import { useMemo } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import Tabel from './Tabel.jsx';
import Kpi from './Kpi.jsx';
import { AMBANG, WARNA } from '../config.js';
import { num, potong, rp, singkatSatker } from '../format.js';

export default function Pb34Penambahan({ D }) {
  const grafik = useMemo(() => ({
    labels: D.tambahSatker.map((s) => `${singkatSatker(s.nama)} (${s.provinsi})`),
    datasets: [{ label: 'Nilai', data: D.tambahSatker.map((s) => s.v), backgroundColor: WARNA.hijau }],
    options: { indexAxis: 'y', scales: { x: { ticks: { maxRotation: 0, maxTicksLimit: 4, callback: (v) => rp(v) } } } },
  }), [D]);

  return (
    <>
      <Kpi isi={[
        { label: 'Nilai KRO Program Baru', nilai: rp(D.tambah), ket: `${(D.total ? (D.tambah / D.total) * 100 : 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}% dari pagu` },
        { label: 'Jumlah KRO', nilai: num(D.tambahKro.length), ket: `${num(D.tambahRows.length)} RO` },
        { label: 'Satker', nilai: num(D.tambahSatker.length), ket: [...new Set(D.tambahSatker.map((s) => s.regional))].join(', ') },
      ]} />
      <div className="grid g2">
        <div className="card">
          <h2>Nilai Program Baru per satker</h2>
          <ChartCanvas type="bar" tinggi={Math.max(220, D.tambahSatker.length * 48 + 60)} {...grafik} fmt={rp} />
        </div>
        <div className="card">
          <h2>Per satker dan wilayah</h2>
          <Tabel kunci={(s) => s.nama} baris={D.tambahSatker} kolom={[
            { h: 'Satker', f: (s) => s.nama },
            { h: 'Provinsi', f: (s) => s.provinsi },
            { h: 'Regional', f: (s) => s.regional },
            { h: 'KRO', n: 1, f: (s) => s.nKro },
            { h: 'Nilai', n: 1, f: (s) => rp(s.v) },
          ]} />
        </div>
      </div>
      <div className="card">
        <h2>{D.tambahRows.length} RO penambahan · {rp(D.tambah)}</h2>
        <Tabel kunci={(x) => x.id_baris} baris={D.tambahRows} kolom={[
          { h: 'Satker', f: (x) => x.nama_satker },
          { h: 'KRO', f: (x) => x.kode_kro },
          { h: 'Kode RO', f: (x) => x.kode_ro },
          { h: 'Uraian', f: (x) => potong(x.uraian_ro, AMBANG.panjangUraian) },
          { h: 'Nilai', n: 1, f: (x) => rp(x.nilai_ro_rp) },
          { h: 'Sel', f: (x) => x.sel_nilai },
        ]} />
      </div>
      <div className="card">
        <h2>Label KRO selain Base Line</h2>
        <p className="muted" style={{ marginBottom: 10 }}>Hanya label "Program Baru - Penambahan Anggaran" yang dihitung di atas. Label lain ditampilkan sebagai pembanding.</p>
        <Tabel kunci={(l) => l.label} baris={D.labelLain} kolom={[
          { h: 'Label', f: (l) => l.label },
          { h: 'Dihitung', f: (l) => (l.dihitung ? 'Ya' : 'Tidak') },
          { h: 'KRO', n: 1, f: (l) => l.nKro },
          { h: 'Satker', n: 1, f: (l) => l.nSatker },
          { h: 'Nilai', n: 1, f: (l) => rp(l.v) },
        ]} />
      </div>
    </>
  );
}
