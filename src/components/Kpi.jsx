// Deret kartu KPI: [{ label, nilai, ket, w: true untuk kartu peringatan }]
export default function Kpi({ isi }) {
  return (
    <div className="kpis">
      {isi.map((k) => (
        <div key={k.label} className={k.w ? 'kpi w' : 'kpi'}>
          <span>{k.label}</span>
          <b>{k.nilai}</b>
          {k.ket && <span>{k.ket}</span>}
        </div>
      ))}
    </div>
  );
}
