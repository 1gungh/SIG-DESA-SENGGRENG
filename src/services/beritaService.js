import { supabase } from '../lib/supabaseClient'
import { compressImage } from '../utils/compressImage'

// Nama bucket storage untuk foto berita.
const BUCKET_BERITA = 'berita-photos'

// =====================================================================
// BERITA — CREATE
// =====================================================================
export async function createBerita(payload) {
  const { data, error } = await supabase
    .from('berita')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

// =====================================================================
// BERITA — READ (list & detail by id/slug)
// =====================================================================
export async function getAllBerita() {
  const { data, error } = await supabase
    .from('v_berita_dengan_foto_utama')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Mengambil berita berdasarkan ID (Biasanya dipakai di halaman Admin untuk Edit)
export async function getBeritaById(id) {
  const { data, error } = await supabase
    .from('berita')
    .select(`
      *,
      kategori_berita ( id, nama ),
      berita_foto ( id, url, is_utama, urutan )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// FUNGSI INI YANG DICARI OLEH HALAMAN DETAIL BERITA (FRONTEND)
export async function getBeritaBySlug(slug) {
  const { data, error } = await supabase
    .from('berita')
    .select(`
      *,
      kategori_berita ( id, nama ),
      berita_foto ( id, url, is_utama, urutan )
    `)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

// =====================================================================
// BERITA — UPDATE
// =====================================================================
export async function updateBerita(id, payload) {
  const { data, error } = await supabase
    .from('berita')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// =====================================================================
// BERITA — DELETE
// =====================================================================
export async function deleteBerita(id) {
  const { error } = await supabase.from('berita').delete().eq('id', id)
  if (error) throw error
}

// =====================================================================
// KATEGORI BERITA
// =====================================================================
export async function getKategoriBerita() {
  const { data, error } = await supabase.from('kategori_berita').select('*').order('nama')
  if (error) throw error
  return data
}

// =====================================================================
// FOTO BERITA
// =====================================================================
export async function uploadFotoBerita(beritaId, file, isUtama = false, urutan = 0) {
  // DITAMBAHKAN: kompres & resize sebelum upload, sama seperti uploadFotoLokasi
  // di lokasiService.js — supaya ukuran file di Storage jauh lebih kecil.
  const fileTerkompres = await compressImage(file, { maxWidth: 1280, quality: 0.75 })

  const filePath = `${beritaId}/${Date.now()}_${fileTerkompres.name}`
  const { error: uploadError } = await supabase.storage.from(BUCKET_BERITA).upload(filePath, fileTerkompres)
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from(BUCKET_BERITA).getPublicUrl(filePath)

  const { error: insertError } = await supabase.from('berita_foto').insert({
    berita_id: beritaId,
    url: urlData.publicUrl,
    is_utama: isUtama,
    urutan,
  })
  if (insertError) throw insertError
}

// Hapus satu foto berita (baris DB + file fisik di storage)
export async function deleteFotoBerita(fotoId, url) {
  try {
    const marker = `/${BUCKET_BERITA}/`
    const idx = url.indexOf(marker)
    if (idx !== -1) {
      const filePath = url.substring(idx + marker.length)
      await supabase.storage.from(BUCKET_BERITA).remove([filePath])
    }
  } catch {
    // kalau gagal hapus file fisik, tetap lanjut hapus record DB
  }

  const { error } = await supabase.from('berita_foto').delete().eq('id', fotoId)
  if (error) throw error
}

// Jadikan sebuah foto sebagai foto utama
export async function setFotoUtamaBerita(beritaId, fotoId) {
  const { error: err1 } = await supabase
    .from('berita_foto')
    .update({ is_utama: false })
    .eq('berita_id', beritaId)
  if (err1) throw err1

  const { error: err2 } = await supabase
    .from('berita_foto')
    .update({ is_utama: true })
    .eq('id', fotoId)
  if (err2) throw err2
}