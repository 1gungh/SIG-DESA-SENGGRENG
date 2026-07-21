import { supabase } from "../lib/supabaseClient";

// =====================================================================
// LOKASI — CREATE
// =====================================================================
export const createLokasi = async (data) => {
  // 1. Cari UUID Kategori berdasarkan String nama
  const { data: catData, error: catError } = await supabase
    .from('kategori_potensi')
    .select('id')
    .eq('nama', data.kategori_id) // data.kategori_id dari form berisi string seperti "UMKM"
    .maybeSingle();

  if (catError) throw catError;
  if (!catData) throw new Error(`Kategori "${data.kategori_id}" tidak ditemukan di database.`);

  // 2. Cari UUID Dusun (Opsional)
  let dusunId = null;
  if (data.dusun_id) {
    const { data: dusData } = await supabase
      .from('dusun')
      .select('id')
      .eq('nama', data.dusun_id)
      .maybeSingle();
    if (dusData) dusunId = dusData.id;
  }

  // 3. Insert ke tabel lokasi utama
  const { data: newLokasi, error } = await supabase
    .from('lokasi')
    .insert({
      nama: data.nama,
      kategori_id: catData.id,
      deskripsi: data.deskripsi,
      whatsapp: data.whatsapp,
      nama_pemilik: data.nama_pemilik,
      dusun_id: dusunId,
      alamat_lengkap: data.alamat_lengkap,
      latitude: data.latitude,
      longitude: data.longitude,
      tampil_di_peta: data.tampil_di_peta,
      status: data.status
    })
    .select('id')
    .single();

  if (error) throw error;
  return newLokasi; // Mengembalikan data berisi 'id'
};

// =====================================================================
// LOKASI — READ (list & detail by id) — dipakai ADMIN
// =====================================================================
export const getAllLokasi = async () => {
  const { data, error } = await supabase
    .from('v_lokasi_dengan_foto_utama')
    .select('*, dusun_nama')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getLokasiById = async (id) => {
  const { data: lokasi, error } = await supabase
    .from('lokasi')
    .select(`
      *,
      kategori_potensi ( id, nama ),
      dusun ( id, nama ),
      lokasi_foto ( id, url, is_utama, urutan ),
      lokasi_produk ( id, nama_produk, harga, urutan ),
      lokasi_jam_operasional ( id, hari_mulai, hari_selesai, jam_buka, jam_tutup, urutan )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return lokasi;
};

// =====================================================================
// LOKASI — UPDATE
// =====================================================================
export const updateLokasi = async (id, data) => {
  const { data: catData, error: catError } = await supabase
    .from('kategori_potensi')
    .select('id')
    .eq('nama', data.kategori_id)
    .maybeSingle();

  if (catError) throw catError;
  if (!catData) throw new Error(`Kategori "${data.kategori_id}" tidak ditemukan di database.`);

  let dusunId = null;
  if (data.dusun_id) {
    const { data: dusData } = await supabase
      .from('dusun')
      .select('id')
      .eq('nama', data.dusun_id)
      .maybeSingle();
    if (dusData) dusunId = dusData.id;
  }

  const { error } = await supabase
    .from('lokasi')
    .update({
      nama: data.nama,
      kategori_id: catData.id,
      deskripsi: data.deskripsi,
      whatsapp: data.whatsapp,
      nama_pemilik: data.nama_pemilik,
      dusun_id: dusunId,
      alamat_lengkap: data.alamat_lengkap,
      latitude: data.latitude,
      longitude: data.longitude,
      tampil_di_peta: data.tampil_di_peta,
      status: data.status,
    })
    .eq('id', id);

  if (error) throw error;
};

// =====================================================================
// LOKASI — DELETE
// =====================================================================
export const deleteLokasi = async (id) => {
  const { error } = await supabase.from('lokasi').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================================
// FOTO LOKASI
// =====================================================================
export const uploadFotoLokasi = async (lokasiId, file, isUtama, urutan) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${lokasiId}-${Date.now()}-${urutan}.${fileExt}`;
  const filePath = `lokasi/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('galeri_desa')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('galeri_desa')
    .getPublicUrl(filePath);

  const { error: dbError } = await supabase
    .from('lokasi_foto')
    .insert({
      lokasi_id: lokasiId,
      url: publicUrlData.publicUrl,
      is_utama: isUtama,
      urutan: urutan
    });

  if (dbError) throw dbError;
};

export const deleteFotoLokasi = async (fotoId, url) => {
  try {
    const marker = '/galeri_desa/';
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const filePath = url.substring(idx + marker.length);
      await supabase.storage.from('galeri_desa').remove([filePath]);
    }
  } catch {
    // kalau gagal hapus file fisik, tetap lanjut hapus record DB
  }

  const { error } = await supabase.from('lokasi_foto').delete().eq('id', fotoId);
  if (error) throw error;
};

export const setFotoUtamaLokasi = async (lokasiId, fotoId) => {
  const { error: err1 } = await supabase
    .from('lokasi_foto')
    .update({ is_utama: false })
    .eq('lokasi_id', lokasiId);
  if (err1) throw err1;

  const { error: err2 } = await supabase
    .from('lokasi_foto')
    .update({ is_utama: true })
    .eq('id', fotoId);
  if (err2) throw err2;
};

// =====================================================================
// PRODUK & MENU
// =====================================================================
export const createProdukLokasi = async (lokasiId, produkValid) => {
  const dataProduk = produkValid.map((p, i) => ({
    lokasi_id: lokasiId,
    nama_produk: p.nama,
    harga: p.harga ? parseFloat(p.harga) : null,
    urutan: i + 1
  }));

  const { error } = await supabase.from('lokasi_produk').insert(dataProduk);
  if (error) throw error;
};

export const replaceProdukLokasi = async (lokasiId, produkValid) => {
  const { error: delErr } = await supabase
    .from('lokasi_produk')
    .delete()
    .eq('lokasi_id', lokasiId);
  if (delErr) throw delErr;

  if (produkValid.length > 0) {
    await createProdukLokasi(lokasiId, produkValid);
  }
};

// =====================================================================
// JAM OPERASIONAL
// =====================================================================
export const createJamOperasionalLokasi = async (lokasiId, jamOperasional) => {
  const dataJam = jamOperasional.map((jo, i) => ({
    lokasi_id: lokasiId,
    hari_mulai: jo.hari.mulai,
    hari_selesai: jo.hari.selesai,
    jam_buka: `${String(jo.jam.buka.h).padStart(2, '0')}:${String(jo.jam.buka.m).padStart(2, '0')}:00`,
    jam_tutup: `${String(jo.jam.tutup.h).padStart(2, '0')}:${String(jo.jam.tutup.m).padStart(2, '0')}:00`,
    urutan: i + 1
  }));

  const { error } = await supabase.from('lokasi_jam_operasional').insert(dataJam);
  if (error) throw error;
};

export const replaceJamOperasionalLokasi = async (lokasiId, jamOperasional) => {
  const { error: delErr } = await supabase
    .from('lokasi_jam_operasional')
    .delete()
    .eq('lokasi_id', lokasiId);
  if (delErr) throw delErr;

  if (jamOperasional.length > 0) {
    await createJamOperasionalLokasi(lokasiId, jamOperasional);
  }
};

// =====================================================================
// HALAMAN PETA PUBLIK
// =====================================================================
function formatJam(hhmmss) {
  if (!hhmmss) return '';
  return hhmmss.slice(0, 5);
}

function formatJamOperasionalList(jamList) {
  if (!jamList || jamList.length === 0) return null;
  return jamList
    .map((jo) => {
      const rangeHari =
        jo.hari_mulai === jo.hari_selesai
          ? jo.hari_mulai
          : `${jo.hari_mulai}-${jo.hari_selesai}`;
      return `${rangeHari}: ${formatJam(jo.jam_buka)}-${formatJam(jo.jam_tutup)}`;
    })
    .join(', ');
}

export const getLokasiPeta = async () => {
  const { data, error } = await supabase
    .from('lokasi')
    .select(`
      id,
      nama,
      deskripsi,
      whatsapp,
      nama_pemilik,
      latitude,
      longitude,
      kategori_potensi ( nama, slug ),
      lokasi_foto ( url, is_utama ),
      lokasi_produk ( harga ),
      lokasi_jam_operasional ( hari_mulai, hari_selesai, jam_buka, jam_tutup, urutan )
    `)
    .eq('status', 'aktif')
    .eq('tampil_di_peta', true);

  if (error) throw error;

  return (data || [])
    .filter((row) => row.latitude != null && row.longitude != null)
    .map((row) => {
      // Ambil slug langsung dari tabel kategori_potensi (sudah kebab-case,
      // contoh: "tempat-ibadah", "sarana-pendidikan"). Ini menggantikan
      // mapping manual lama (KATEGORI_DB_TO_KEY) yang sudah tidak sesuai
      // dengan daftar kategori terbaru dan menyebabkan marker kategori
      // selain UMKM tidak muncul di peta.
      const kategoriSlug = row.kategori_potensi?.slug || '';
      const fotoUtama = row.lokasi_foto?.find((f) => f.is_utama) || row.lokasi_foto?.[0];
      const hargaValid = (row.lokasi_produk || [])
        .map((p) => p.harga)
        .filter((h) => h != null);
      const jamSorted = (row.lokasi_jam_operasional || []).slice().sort((a, b) => a.urutan - b.urutan);

      return {
        id: row.id,
        nama: row.nama,
        kategori: kategoriSlug,
        lat: row.latitude,
        lng: row.longitude,
        jam: formatJamOperasionalList(jamSorted),
        gambar: fotoUtama?.url || null,
        deskripsi: row.deskripsi,
        hargaMin: hargaValid.length > 0 ? Math.min(...hargaValid) : null,
        hargaMax: hargaValid.length > 0 ? Math.max(...hargaValid) : null,
        pemilik: row.nama_pemilik,
        whatsapp: row.whatsapp ? `62${row.whatsapp.replace(/^0/, '')}` : null,
      };
    });
};

// =====================================================================
// HALAMAN DETAIL POTENSI PUBLIK (/potensi/:id)
// =====================================================================
export const getLokasiDetailPublik = async (id) => {
  const { data: row, error } = await supabase
    .from('lokasi')
    .select(`
      id,
      nama,
      deskripsi,
      whatsapp,
      nama_pemilik,
      alamat_lengkap,
      latitude,
      longitude,
      kategori_potensi ( nama ),
      lokasi_foto ( url, is_utama, urutan ),
      lokasi_produk ( nama_produk, harga, urutan ),
      lokasi_jam_operasional ( hari_mulai, hari_selesai, jam_buka, jam_tutup, urutan )
    `)
    .eq('id', id)
    .eq('status', 'aktif')
    .eq('tampil_di_peta', true)
    .single();

  if (error) throw error;
  if (!row) return null;

  const fotoSorted = (row.lokasi_foto || [])
    .slice()
    .sort((a, b) => (b.is_utama ? 1 : 0) - (a.is_utama ? 1 : 0) || a.urutan - b.urutan)
    .map((f) => f.url);

  const jamSorted = (row.lokasi_jam_operasional || []).slice().sort((a, b) => a.urutan - b.urutan);
  const jamPertama = jamSorted[0];

  return {
    id: row.id,
    nama: row.nama,
    kategori: row.kategori_potensi?.nama || '',
    deskripsi: row.deskripsi,
    whatsapp: row.whatsapp,
    pemilik: row.nama_pemilik,
    lokasi: row.alamat_lengkap,
    jam_buka: jamPertama ? jamPertama.jam_buka.slice(0, 5) : null,
    jam_tutup: jamPertama ? jamPertama.jam_tutup.slice(0, 5) : null,
    jam_teks:
      jamSorted.length > 0
        ? jamSorted
            .map((jo) => {
              const rangeHari =
                jo.hari_mulai === jo.hari_selesai ? jo.hari_mulai : `${jo.hari_mulai}-${jo.hari_selesai}`;
              return `${rangeHari}: ${jo.jam_buka.slice(0, 5)}-${jo.jam_tutup.slice(0, 5)}`;
            })
            .join(', ')
        : null,
    foto: fotoSorted,
    produk: (row.lokasi_produk || [])
      .slice()
      .sort((a, b) => a.urutan - b.urutan)
      .map((p) => ({ nama: p.nama_produk, harga: p.harga })),
    lat: row.latitude,
    lng: row.longitude,
  };
};

export const getLokasiTerdekat = async (excludeId) => {
  const { data, error } = await supabase
    .from('lokasi')
    .select(`
      id,
      nama,
      alamat_lengkap,
      latitude,
      longitude,
      kategori_potensi ( nama ),
      lokasi_foto ( url, is_utama, urutan )
    `)
    .eq('status', 'aktif')
    .eq('tampil_di_peta', true)
    .neq('id', excludeId);

  if (error) throw error;

  return (data || [])
    .filter((row) => row.latitude != null && row.longitude != null)
    .map((row) => {
      const fotoUtama =
        row.lokasi_foto?.find((f) => f.is_utama) ||
        row.lokasi_foto?.slice().sort((a, b) => a.urutan - b.urutan)[0];

      return {
        id: row.id,
        nama: row.nama,
        kategori: row.kategori_potensi?.nama || '',
        lokasi: row.alamat_lengkap,
        foto: fotoUtama ? [fotoUtama.url] : [],
        lat: row.latitude,
        lng: row.longitude,
      };
    });
};

// =====================================================================
// HALAMAN KATEGORI PUBLIK (direktori/katalog)
// =====================================================================
export const getSemuaLokasiKategori = async () => {
  const { data, error } = await supabase
    .from('v_lokasi_dengan_foto_utama')
    .select('*')
    .order('nama');

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    nama: row.nama,
    kategori: row.kategori_nama,
    deskripsi: row.deskripsi,
    lokasi: row.dusun_nama || row.alamat_lengkap || '-',
    foto: row.foto_utama_url,
  }));
};

export const getKategoriPotensiList = async () => {
  const { data, error } = await supabase
    .from('kategori_potensi')
    .select('id, nama')
    .order('nama');
  if (error) throw error;
  return data;
};

export const getDusunList = async () => {
  const { data, error } = await supabase
    .from('dusun')
    .select('id, nama')
    .order('nama');
  if (error) throw error;
  return data;
};

// =====================================================================
// HALAMAN BERANDA PUBLIK
// =====================================================================
export const getStatistikPotensi = async () => {
  const { data, error } = await supabase
    .from('lokasi')
    .select('kategori_potensi ( nama )')
    .eq('status', 'aktif');

  if (error) throw error;

  const rows = data || [];
  const hitung = (namaList) =>
    rows.filter((r) => namaList.includes(r.kategori_potensi?.nama)).length;

  return {
    umkm: hitung(['UMKM']),
    wisata: hitung(['Wisata Alam']),
    agrobisnis: hitung(['Pertanian', 'Peternakan']),
  };
};

// Semua lokasi aktif & tampil di peta, untuk section "Potensi Unggulan" di Beranda.
// TIDAK diacak/dibatasi di sini — pengacakan dan rotasi berkala dilakukan di komponen
// (Beranda.jsx) lewat setInterval, supaya kartu yang tampil berganti otomatis selagi
// halaman terbuka, bukan cuma berubah saat reload.
export const getSemuaPotensiAktif = async () => {
  const { data, error } = await supabase
    .from('lokasi')
    .select(`
      id,
      nama,
      deskripsi,
      latitude,
      longitude,
      lokasi_foto ( url, is_utama )
    `)
    .eq('status', 'aktif')
    .eq('tampil_di_peta', true);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    nama: row.nama,
    deskripsi: row.deskripsi,
    lat: row.latitude,
    lng: row.longitude,
    foto: row.lokasi_foto?.find((f) => f.is_utama)?.url || row.lokasi_foto?.[0]?.url || null,
  }));
};

export const getBeritaTerkiniRingkas = async (limitData = 3) => {
  const { data, error } = await supabase
    .from('berita')
    .select(`
      id,
      judul,
      tanggal_publikasi,
      kategori_berita ( nama ),
      berita_foto ( url, urutan )
    `)
    .eq('status', 'terbit')
    .order('tanggal_publikasi', { ascending: false })
    .limit(limitData);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    judul: row.judul,
    kategori: row.kategori_berita?.nama || '',
    tanggal: row.tanggal_publikasi
      ? new Date(row.tanggal_publikasi).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '',
    gambar: (row.berita_foto || [])
      .slice()
      .sort((a, b) => a.urutan - b.urutan)
      .map((f) => f.url),
  }));
};
// =====================================================================
// DASHBOARD ADMIN
// =====================================================================
export const getStatistikDashboard = async () => {
  const { data, error } = await supabase
    .from('lokasi')
    .select('id, kategori_potensi ( nama )')
    .eq('status', 'aktif');

  if (error) throw error;

  const rows = data || [];
  const perKategori = {};
  rows.forEach((r) => {
    const nama = r.kategori_potensi?.nama || 'Lainnya';
    perKategori[nama] = (perKategori[nama] || 0) + 1;
  });

  return {
    total: rows.length,
    perKategori, // contoh: { UMKM: 12, "Tempat Ibadah": 5, ... }
  };
};

export const getDistribusiDusun = async () => {
  const { data, error } = await supabase
    .from('lokasi')
    .select('id, dusun ( nama )')
    .eq('status', 'aktif');

  if (error) throw error;

  const rows = data || [];
  const perDusun = {};
  rows.forEach((r) => {
    const nama = r.dusun?.nama || 'Tanpa Dusun';
    perDusun[nama] = (perDusun[nama] || 0) + 1;
  });

  return { total: rows.length, perDusun };
};

export const getDataTerbaruLokasi = async (limitData = 5) => {
  const { data, error } = await supabase
    .from('v_lokasi_dengan_foto_utama')
    .select('id, nama, kategori_nama, dusun_nama, alamat_lengkap, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limitData);

  if (error) throw error;
  return data || [];
};