// Navigasi kiri: satu tombol per pertanyaan bisnis, sama dengan #nav di layout-2.html.
export default function NavPB({ daftar, aktif, onPilih }) {
  return (
    <nav id="nav">
      {daftar.map((p, i) => (
        <button key={p.kode} className={i === aktif ? 'on' : undefined} onClick={() => onPilih(i)}>
          <b>{p.kode}</b> {p.judul}<small>{p.ket}</small>
        </button>
      ))}
    </nav>
  );
}
