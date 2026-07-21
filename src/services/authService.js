import { supabase } from '../lib/supabaseClient'

// Ambil data admin yang sedang login (dari sesi Supabase Auth yang aktif).
// Sengaja pakai getSession() (baca dari local storage), BUKAN getUser() —
// getUser() selalu melakukan request baru ke server dan gampang kena 403
// kalau ada delay/mismatch token, padahal sesi sebenarnya valid.
export async function getAdminSaatIni() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const user = data?.session?.user
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    nama: user.user_metadata?.nama || '',
  }
}

// Update nama (disimpan di user_metadata) dan/atau email.
// CATATAN: kalau email diubah, Supabase mengirim email konfirmasi ke alamat baru —
// email lama tetap aktif sampai link konfirmasi di email baru diklik.
export async function updateProfilAdmin({ nama, email }) {
  const payload = { data: { nama } }
  if (email) payload.email = email

  const { data, error } = await supabase.auth.updateUser(payload)
  if (error) throw error
  return data.user
}

// Update password. Supabase tidak butuh password lama untuk updateUser
// selama sesi (access token) yang sedang login masih valid.
export async function updatePasswordAdmin(passwordBaru) {
  const { error } = await supabase.auth.updateUser({ password: passwordBaru })
  if (error) throw error
}