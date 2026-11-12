import { useMemo } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import Tabel from './Tabel.jsx';
import Kpi from './Kpi.jsx';
import { AMBANG, COL, WARNA } from '../config.js';
import { pct, potong, pp, rp } from '../format.js';

export default function Pb33Prioritas({ D }) {
  const donat = useMemo(() => ({
    labels: ['Prioritas', 'Non-prioritas'],
    datasets: [{ data: [D.prio, D.total - D.prio], backgroundColor: [WARNA.hijau, WARNA.abu] }],
  }), [D]);
  const batang = useMemo(() => ({
    labels: D.kat.map((k) => k.k),
    datasets: [{ label: 'Pagu', data: D.kat.map((k) => k.v), backgroundColor: D.kat.map((k) => COL[k.k]) }],
    options: { indexAxis: 'y', scales: { x: { ticks: { maxRotation: 0, maxTicksLimit: 4, callback: (v) => rp(v) } } } },
  }), [D]);
  const satker = useMemo(() => [...D.satker].sort((a, b) => b.porsiPrio - a.porsiPrio), [D]);
  const roBesar = useMemo(() => [...D.ro].sort((a, b) => b.v - a.v).slice(0, AMBANG.jumlahRoTeratas), [D]);

  return (
    <>
      <Kpi isi={[
        { label: 'Pagu output prioritas', nilai: rp(D.prio), ket: `${pct(D.prio / D.total)} dari pagu` },
        { label: 'Median porsi per satker', nilai: pct(D.medianPrio), ket: `${D.nSatker} satker` },
        { label: 'Porsi terendah', nilai: pct(satker.at(-1)?.porsiPrio), ket: satker.at(-1)?.nama, w: true },
      ]} />
      <div className="grid g2">
        <div className="card"><h2>Prioritas vs lainnya</h2><ChartCanvas type="doughnut" {...donat} fmt={rp} /></div>
        <div className="card"><h2>Pagu per kategori output</h2><ChartCanvas type="bar" {...batang} fmt={rp} /></div>
      </div>
      <div className="card">
        <h2>Porsi output prioritas dan RO terbesar per satker</h2>
        <Tabel kunci={(x) => x.no} baris={satker} kolom={[
          { h: 'Satker', f: (x) => x.nama },
          { h: 'Regional', f: (x) => x.regional },
          { h: 'Pagu', n: 1, f: (x) => rp(x.pagu) },
          { h: 'Prioritas', n: 1, f: (x) => rp(x.prio) },
          { h: 'Porsi', n: 1, f: (x) => pct(x.porsiPrio) },
          { h: 'vs median', n: 1, f: (x) => pp(x.porsiPrio - D.medianPrio) },
          { h: 'RO terbesar', f: (x) => `${x.roTerbesar.kode_ro} · ${x.roTerbesar.kategori_output}` },
          { h: 'Nilai RO terbesar', n: 1, f: (x) => `${rp(x.roTerbesar.nilai_ro_rp)} (${x.roTerbesar.sel_nilai})` },
        ]} />
      </div>
      <div className="card">
        <h2>{AMBANG.jumlahRoTeratas} RO dengan alokasi terbesar</h2>
        <Tabel kunci={(r) => r.kode} baris={roBesar} kolom={[
          { h: 'Kode RO', f: (r) => r.kode },
          { h: 'Uraian', f: (r) => potong(r.uraian, AMBANG.panjangUraian) },
          { h: 'Kategori', f: (r) => r.kategori },
          { h: 'Prioritas', f: (r) => (r.prioritas ? 'Ya' : 'Tidak') },
          { h: 'Satker', n: 1, f: (r) => r.n },
          { h: 'Total nilai', n: 1, f: (r) => rp(r.v) },
          { h: 'Porsi pagu', n: 1, f: (r) => pct(r.v / D.total) },
        ]} />
      </div>
    </>
  );
}
