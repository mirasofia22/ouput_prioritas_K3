import { useMemo } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import Tabel from './Tabel.jsx';
import Kpi from './Kpi.jsx';
import { COL, KATEGORI_BIBIT, KATEGORI_KTA, KATEGORI_REHAB, WARNA } from '../config.js';
import { num } from '../format.js';

const jumlah = (arr, k) => arr.reduce((a, x) => a + x[k], 0);
const ha = (v) => `${num(v, 2)} Ha`;

export default function Pb35Volume({ D }) {
  const R = D.regional;
  const luas = useMemo(() => ({
    labels: R.map((r) => r.reg),
    datasets: [
      { label: 'Rehabilitasi', data: R.map((r) => r.haRehab), backgroundColor: COL[KATEGORI_REHAB] },
      { label: 'Konservasi tanah & reklamasi', data: R.map((r) => r.haKtr), backgroundColor: COL[KATEGORI_KTA] },
      { label: 'Lainnya (pemantauan, fasilitasi)', data: R.map((r) => r.haLain), backgroundColor: WARNA.abu },
    ],
    options: { scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (v) => num(v) } } } },
  }), [R]);
  const unit = useMemo(() => ({
    labels: R.map((r) => r.reg),
    datasets: [
      { label: 'Bibit (Unit)', data: R.map((r) => r.bibit), backgroundColor: COL[KATEGORI_BIBIT], yAxisID: 'y' },
      { label: 'Bangunan KTA (Unit)', data: R.map((r) => r.kta), backgroundColor: COL[KATEGORI_KTA], yAxisID: 'y1' },
    ],
    options: { scales: { y: { ticks: { callback: (v) => num(v) } }, y1: { position: 'right', grid: { display: false }, ticks: { callback: (v) => num(v) } } } },
  }), [R]);
  const satker = useMemo(() => [...D.satker].sort((a, b) => b.haTotal - a.haTotal), [D]);

  return (
    <>
      <Kpi isi={[
        { label: 'Luas target total', nilai: ha(jumlah(R, 'haTotal')), ket: 'tanpa RO bervolume janggal' },
        { label: 'Rehabilitasi langsung', nilai: ha(jumlah(R, 'haRehab')) },
        { label: 'Bibit', nilai: `${num(jumlah(R, 'bibit'))} Unit` },
        { label: 'Bangunan KTA', nilai: `${num(jumlah(R, 'kta'))} Unit` },
      ]} />
      <div className="grid g2">
        <div className="card"><h2>Luas target per regional (Hektar)</h2><ChartCanvas type="bar" {...luas} fmt={ha} /></div>
        <div className="card"><h2>Bibit dan bangunan KTA per regional</h2><ChartCanvas type="bar" {...unit} fmt={(v) => `${num(v)} Unit`} /></div>
      </div>
      <div className="card">
        <h2>Sebaran antarwilayah</h2>
        <Tabel kunci={(r) => r.reg} baris={R} kolom={[
          { h: 'Regional', f: (r) => r.reg },
          { h: 'Satker', n: 1, f: (r) => r.nSatker },
          { h: 'Ha rehabilitasi', n: 1, f: (r) => num(r.haRehab, 2) },
          { h: 'Ha KTA & reklamasi', n: 1, f: (r) => num(r.haKtr, 2) },
          { h: 'Ha lainnya', n: 1, f: (r) => num(r.haLain, 2) },
          { h: 'Bibit (Unit)', n: 1, f: (r) => num(r.bibit) },
          { h: 'KTA (Unit)', n: 1, f: (r) => num(r.kta) },
        ]} />
      </div>
      <div className="card">
        <h2>Volume target per satker</h2>
        <Tabel kunci={(s) => s.no} baris={satker} kolom={[
          { h: 'Satker', f: (s) => s.nama },
          { h: 'Regional', f: (s) => s.regional },
          { h: 'Ha rehabilitasi', n: 1, f: (s) => num(s.haRehab, 2) },
          { h: 'Ha KTA & reklamasi', n: 1, f: (s) => num(s.haKtr, 2) },
          { h: 'Ha lainnya', n: 1, f: (s) => num(s.haLain, 2) },
          { h: 'Bibit (Unit)', n: 1, f: (s) => num(s.bibit) },
          { h: 'KTA (Unit)', n: 1, f: (s) => num(s.kta) },
        ]} />
      </div>
    </>
  );
}
