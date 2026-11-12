// Semua nilai uang ditampilkan dalam Rupiah penuh.
export const rp = (n) => `Rp ${Math.round(n || 0).toLocaleString('id-ID')}`;
export const num = (n, d = 0) => (n || 0).toLocaleString('id-ID', { maximumFractionDigits: d });
// pct menerima pecahan (0,892 -> "89,2%").
export const pct = (n, d = 1) =>
  `${((n || 0) * 100).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d })}%`;
export const pp = (n, d = 1) => `${n > 0 ? '+' : ''}${((n || 0) * 100).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d })} pp`;
export const potong = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || '');
export const singkatSatker = (s) => (s || '').replace(/^BPDAS\s+/i, '');
