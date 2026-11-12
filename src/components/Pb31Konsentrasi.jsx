import { useMemo } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import Tabel from './Tabel.jsx';
import Kpi from './Kpi.jsx';
import { AMBANG, WARNA } from '../config.js';
import { pct, rp, singkatSatker } from '../format.js';

export default function Pb31Konsentrasi({ D }) {
  const s = useMemo(() => [...D.satker].sort((a, b) => b.konsen - a.konsen), [D]);
  const bpdas = s.find((x) => x.jenis === 'BPDAS');
  const terendah = s[s.length - 1];
  const grafik = useMemo(() => ({
    labels: s.map((x) => singkatSatker(x.nama)),
    datasets: [{ label: 'Rasio top-5', data: s.map((x) => x.konsen), backgroundColor: s.map((x) => (x.konsen > AMBANG.konsentrasiTinggi ? WARNA.merah : WARNA.hijau)) }],
    options: { indexAxis: 'y', scales: { x: { max: 1, ticks: { callback: (v) => pct(v, 0) } } } },
  }), [s]);

  return (
    <>
      <Kpi isi={[
        { label: 'Median rasio top-5', nilai: pct(D.medianKonsen), ket: `${D.nSatker} satker` },
        { label: 'Paling terkonsentrasi', nilai: pct(s[0]?.konsen), ket: s[0]?.nama, w: true },
        { label: 'BPDAS paling terkonsentrasi', nilai: pct(bpdas?.konsen), ket: bpdas?.nama },
        { label: 'Paling tersebar', nilai: pct(terendah?.konsen), ket: terendah?.nama },
      ]} />
      <div className="card">
        <h2>Rasio konsentrasi top-5 RO terhadap pagu satker</h2>
        <ChartCanvas type="bar" tall tinggi={Math.max(320, s.length * 22 + 60)} {...grafik} fmt={(v) => pct(v)} />
      </div>
      <div className="card">
        <h2>Lima RO terbesar per satker</h2>
        <Tabel kunci={(x) => x.no} baris={s} kolom={[
          { h: 'Satker', f: (x) => x.nama },
          { h: 'Jumlah RO', n: 1, f: (x) => x.nRO },
          { h: 'Pagu', n: 1, f: (x) => rp(x.pagu) },
          { h: 'Nilai 5 RO', n: 1, f: (x) => rp(x.top5) },
          { h: 'Rasio', n: 1, f: (x) => pct(x.konsen) },
          { h: '5 RO terbesar (sel nilai)', f: (x) => x.roTop.map((r) => `${r.kode_ro} (${r.sel_nilai})`).join(', ') },
        ]} />
      </div>
    </>
  );
}
