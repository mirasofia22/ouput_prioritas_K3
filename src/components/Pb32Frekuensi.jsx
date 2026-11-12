import { useMemo } from 'react';
import Tabel from './Tabel.jsx';
import Kpi from './Kpi.jsx';
import { AMBANG } from '../config.js';
import { pct, potong, rp } from '../format.js';

const urutFrekuensi = (a, b) => b.n - a.n || b.v - a.v;

export default function Pb32Frekuensi({ D }) {
  const ro = useMemo(() => [...D.ro].sort(urutFrekuensi).slice(0, AMBANG.jumlahRoTeratas), [D]);
  const kro = useMemo(() => [...D.kro].sort(urutFrekuensi), [D]);
  const umum = ro[0];

  return (
    <>
      <Kpi isi={[
        { label: 'RO paling sering muncul', nilai: umum?.kode, ket: `${umum?.n} satker · ${rp(umum?.v)}` },
        { label: 'Porsi RO tersebut', nilai: pct(umum ? umum.v / D.total : 0), ket: 'dari total pagu' },
        { label: 'Kode RO berbeda', nilai: D.ro.length, ket: `${D.kro.length} jenis KRO` },
      ]} />
      <div className="card">
        <h2>{AMBANG.jumlahRoTeratas} RO paling sering muncul</h2>
        <Tabel kunci={(r) => r.kode} baris={ro} kolom={[
          { h: 'Kode RO', f: (r) => r.kode },
          { h: 'Uraian', f: (r) => potong(r.uraian, AMBANG.panjangUraian) },
          { h: 'Kategori', f: (r) => r.kategori },
          { h: 'Satker', n: 1, f: (r) => r.n },
          { h: 'Total nilai', n: 1, f: (r) => rp(r.v) },
          { h: 'Porsi pagu', n: 1, f: (r) => pct(r.v / D.total) },
        ]} />
      </div>
      <div className="card">
        <h2>KRO menurut jumlah satker</h2>
        <Tabel kunci={(r) => r.kode} baris={kro} kolom={[
          { h: 'KRO', f: (r) => r.kode },
          { h: 'Uraian', f: (r) => potong(r.uraian, AMBANG.panjangUraian) },
          { h: 'Satker', n: 1, f: (r) => r.n },
          { h: 'Jumlah RO', n: 1, f: (r) => r.muncul },
          { h: 'Total nilai', n: 1, f: (r) => rp(r.v) },
        ]} />
      </div>
    </>
  );
}
