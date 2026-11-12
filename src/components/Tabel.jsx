// Padanan fungsi tbl(kolom, baris) di layout-2.html.
// kolom: [{ h: 'Judul', f: (baris) => isi, n: true bila angka (rata kanan) }]
export default function Tabel({ kolom, baris, kunci = (_, i) => i }) {
  if (!baris.length) return <p className="muted">Tidak ada data.</p>;
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>{kolom.map((k) => <th key={k.h} className={k.n ? 'num' : undefined}>{k.h}</th>)}</tr>
        </thead>
        <tbody>
          {baris.map((b, i) => (
            <tr key={kunci(b, i)}>
              {kolom.map((k) => <td key={k.h} className={k.n ? 'num' : undefined}>{k.f(b, i)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
