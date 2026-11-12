// Padanan head(1) di layout-2.html: judul dashboard, keterangan sumber data, dan tombol muat ulang.
export default function Header({ raw, dicek, memuat, onMuat }) {
  return (
    <header id="top">
      <div className="wrap hd">
        <div>
          <h1>Analisis PB3 · Anggaran PDASRH 2026</h1>
          <p className="muted">
            Kelompok 3 · Prioritas dan Konsentrasi Output · Data per {raw?.diperbarui || '-'}
            {dicek && <> · Dicek {dicek.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</>}
            {raw?.sumber === 'demo' && <span className="tag demo">DATA CONTOH</span>}
            {raw?.sumber === 'api' && <span className="tag live">Google Sheet</span>}
          </p>
        </div>
        <button className="btn" onClick={onMuat} disabled={memuat}>{memuat ? 'Memuat…' : 'Muat ulang'}</button>
      </div>
    </header>
  );
}
