import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfilAdmin, updatePasswordAdmin } from "../../services/authService";

function Pengaturan() {
  const { user, loading: loadingAuth } = useAuth();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");

  const [menyimpan, setMenyimpan] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [infoEmail, setInfoEmail] = useState(null);

  // Isi form dari user yang sudah tersedia lewat AuthContext (tidak fetch ulang ke server)
  useEffect(() => {
    if (user) {
      setNama(user.user_metadata?.nama || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSimpan = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoEmail(null);
    setMenyimpan(true);

    try {
      // Simpan dulu profil (nama + email kalau berubah)
      await updateProfilAdmin({ nama, email });

      // Kalau kolom password diisi, update terpisah
      if (passwordBaru.trim() !== "") {
        if (passwordBaru.length < 6) {
          throw new Error("Password baru minimal 6 karakter.");
        }
        await updatePasswordAdmin(passwordBaru);
        setPasswordBaru("");
      }

      setTersimpan(true);
      setInfoEmail(
        "Jika Anda mengubah email, cek inbox email baru untuk link konfirmasi — email lama tetap aktif sampai link tersebut diklik."
      );
      setTimeout(() => setTersimpan(false), 3000);
    } catch (err) {
      setErrorMsg("Gagal menyimpan: " + err.message);
    } finally {
      setMenyimpan(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <p className="text-sm text-gray-400">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Pengaturan</h1>
      <p className="text-sm text-gray-500 mb-6">Kelola profil dan preferensi akun admin.</p>

      <form
        onSubmit={handleSimpan}
        className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-4"
      >
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nama</label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Ubah Password</label>
          <input
            type="password"
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            placeholder="Kosongkan jika tidak ingin mengubah"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <button
          type="submit"
          disabled={menyimpan}
          className="self-start bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
        >
          {menyimpan ? "Menyimpan..." : "Simpan Perubahan"}
        </button>

        {tersimpan && (
          <p className="text-xs text-green-700">✓ Perubahan berhasil disimpan.</p>
        )}

        {infoEmail && tersimpan && (
          <p className="text-xs text-gray-500">{infoEmail}</p>
        )}

        {errorMsg && (
          <p className="text-xs text-red-500">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

export default Pengaturan;