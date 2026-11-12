import { KATEGORI, KATEGORI_BIBIT, KATEGORI_KTA, KATEGORI_REHAB, LABEL_PROGRAM_BARU, REGIONAL } from './config.js';

const jumlah = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);

export function median(arr) {
  const a = arr.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return 0;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

const kelompok = (arr, kunci) => arr.reduce((m, x) => {
  const k = kunci(x);
  (m.get(k) || m.set(k, []).get(k)).push(x);
  return m;
}, new Map());

// Volume hektar yang dipakai PB3.5 tidak memasukkan RO bervolume janggal.
const ha = (r) => (r.satuan === 'Hektar' && !r.volume_janggal ? r.volume : 0);
const unit = (r, kat) => (r.satuan === 'Unit' && r.kategori_output === kat ? r.volume : 0);

/** Mengolah baris Data_RO menjadi ringkasan untuk PB3.1 sampai PB3.6. */
export function hitung(ro) {
  const total = jumlah(ro, (r) => r.nilai_ro_rp);

  // ---- per satker (PB3.1, PB3.3, PB3.5, PB3.6)
  const satker = [...kelompok(ro, (r) => r.no_satker)].map(([no, rows]) => {
    const r0 = rows[0];
    const pagu = r0.pagu_satker_rp || jumlah(rows, (r) => r.nilai_ro_rp);
    const urut = [...rows].sort((a, b) => b.nilai_ro_rp - a.nilai_ro_rp);
    const top = rows.filter((r) => r.masuk_top_n);
    const prio = jumlah(rows.filter((r) => r.output_prioritas), (r) => r.nilai_ro_rp);
    const frag = rows.filter((r) => r.ro_bawah_ambang);
    return {
      no, nama: r0.nama_satker, jenis: r0.jenis_satker, provinsi: r0.provinsi, regional: r0.regional,
      pagu, nRO: rows.length,
      top5: jumlah(top, (r) => r.nilai_ro_rp),
      konsen: pagu ? jumlah(top, (r) => r.nilai_ro_rp) / pagu : 0,
      roTop: [...top].sort((a, b) => a.peringkat_ro_satker - b.peringkat_ro_satker),
      prio, porsiPrio: pagu ? prio / pagu : 0,
      roTerbesar: urut[0],
      frag: frag.length, vFrag: jumlah(frag, (r) => r.nilai_ro_rp),
      janggal: rows.filter((r) => r.volume_janggal).length,
      dobel: rows.filter((r) => /muncul >1 kali/i.test(r.catatan_data || '')).length,
      haRehab: jumlah(rows.filter((r) => r.kategori_output === KATEGORI_REHAB), ha),
      haKtr: jumlah(rows.filter((r) => r.kategori_output === KATEGORI_KTA), ha),
      haTotal: jumlah(rows, ha),
      bibit: jumlah(rows, (r) => unit(r, KATEGORI_BIBIT)),
      kta: jumlah(rows, (r) => unit(r, KATEGORI_KTA)),
    };
  }).sort((a, b) => a.no - b.no);
  satker.forEach((s) => { s.haLain = s.haTotal - s.haRehab - s.haKtr; });

  // ---- per RO dan per KRO (PB3.2, PB3.3)
  const keRingkas = (rows, kode, uraian) => ({
    kode, uraian, kategori: rows[0].kategori_output, prioritas: rows[0].output_prioritas,
    n: new Set(rows.map((r) => r.no_satker)).size, muncul: rows.length, v: jumlah(rows, (r) => r.nilai_ro_rp),
  });
  const roKode = [...kelompok(ro, (r) => r.kode_ro)].map(([k, rows]) => keRingkas(rows, k, rows[0].uraian_ro));
  const kro = [...kelompok(ro, (r) => r.kode_kro.slice(-3))].map(([k, rows]) => keRingkas(rows, k, rows[0].uraian_kro));

  // ---- kategori output (PB3.3)
  const kat = KATEGORI.map((k) => {
    const rows = ro.filter((r) => r.kategori_output === k);
    return { k, v: jumlah(rows, (r) => r.nilai_ro_rp), prioritas: rows.some((r) => r.output_prioritas) };
  }).filter((x) => x.v > 0);
  const prio = jumlah(ro.filter((r) => r.output_prioritas), (r) => r.nilai_ro_rp);

  // ---- penambahan anggaran (PB3.4): satu KRO = kombinasi satker + kode KRO
  const tambahRows = ro.filter((r) => r.program_baru_penambahan);
  const tambahKro = [...kelompok(tambahRows, (r) => `${r.no_satker}|${r.kode_kro}`)].map(([, rows]) => ({
    no: rows[0].no_satker, nama: rows[0].nama_satker, provinsi: rows[0].provinsi, regional: rows[0].regional,
    kode: rows[0].kode_kro, uraian: rows[0].uraian_kro, nRO: rows.length, v: jumlah(rows, (r) => r.nilai_ro_rp),
  })).sort((a, b) => b.v - a.v);
  const tambahSatker = [...kelompok(tambahKro, (k) => k.no)].map(([, ks]) => ({
    nama: ks[0].nama, provinsi: ks[0].provinsi, regional: ks[0].regional, nKro: ks.length, v: jumlah(ks, (k) => k.v),
  })).sort((a, b) => b.v - a.v);
  const labelLain = [...kelompok(ro.filter((r) => r.label_kro && r.label_kro !== 'Base Line'), (r) => r.label_kro)]
    .map(([label, rows]) => ({
      label, nKro: new Set(rows.map((r) => `${r.no_satker}|${r.kode_kro}`)).size,
      nSatker: new Set(rows.map((r) => r.no_satker)).size, v: jumlah(rows, (r) => r.nilai_ro_rp),
      dihitung: label === LABEL_PROGRAM_BARU,
    })).sort((a, b) => b.v - a.v);

  // ---- volume per regional (PB3.5)
  const regional = REGIONAL.map((reg) => {
    const ss = satker.filter((s) => s.regional === reg);
    const t = (k) => jumlah(ss, (s) => s[k]);
    return { reg, nSatker: ss.length, haRehab: t('haRehab'), haKtr: t('haKtr'), haLain: t('haLain'), haTotal: t('haTotal'), bibit: t('bibit'), kta: t('kta') };
  }).filter((x) => x.nSatker > 0);

  // ---- fragmentasi dan volume janggal (PB3.6)
  const fragRows = ro.filter((r) => r.ro_bawah_ambang).sort((a, b) => a.nilai_ro_rp - b.nilai_ro_rp);
  const janggalRows = ro.filter((r) => r.volume_janggal).sort((a, b) => b.nilai_ro_rp - a.nilai_ro_rp);

  return {
    total, nRO: ro.length, nSatker: satker.length, satker,
    medianKonsen: median(satker.map((s) => s.konsen)),
    ro: roKode, kro, kat, prio, medianPrio: median(satker.map((s) => s.porsiPrio)),
    tambahRows: [...tambahRows].sort((a, b) => b.nilai_ro_rp - a.nilai_ro_rp), tambahKro, tambahSatker,
    tambah: jumlah(tambahRows, (r) => r.nilai_ro_rp), labelLain,
    regional,
    fragRows, nFrag: fragRows.length, vFrag: jumlah(fragRows, (r) => r.nilai_ro_rp),
    janggalRows, vJanggal: jumlah(janggalRows, (r) => r.nilai_ro_rp),
    nDobel: jumlah(satker, (s) => s.dobel),
  };
}
