import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrash,
  FaNewspaper,
  FaUtensils,
  FaMosque,
  FaGraduationCap,
  FaClinicMedical,
  FaTools,
  FaTshirt,
  FaFutbol,
  FaPalette,
  FaShoppingBasket,
} from "react-icons/fa";
import { getAllBerita, deleteBerita, getKategoriBerita } from "../../services/beritaService";

// Ikon per-kategori. Kalau nama kategori baru ditambahkan di database
// dan belum ada di sini, otomatis fallback ke FaNewspaper.
const KATEGORI_ICON = {
  UMKM: FaUtensils,
  "Tempat Ibadah": FaMosque,
  "Sarana Pendidikan": FaGraduationCap,
  "Fasilitas Kesehatan": FaClinicMedical,
  Bengkel: FaTools,
  Laundry: FaTshirt,
  "Sarana Olahraga": FaFutbol,
  "Sanggar Kesenian": FaPalette,
  Minimarket: FaShoppingBasket,
};

function ListBerita() {
  const navigate = useNavigate();
  const [dataBerita, setDataBerita] = useState([]);
  const [kategoriList, setKategoriList] = useState([]); // diambil dari Supabase, disamakan dgn InputBerita
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pencarian, setPencarian] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");

  // State pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State loading khusus per-baris saat menghapus (mencegah klik ganda)
  const [hapusLoadingId, setHapusLoadingId] = useState(null);

  const muatData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const hasil = await getAllBerita();
      setDataBerita(hasil);
    } catch (err) {
      setErrorMsg("Gagal memuat data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  // Ambil daftar kategori dari Supabase supaya filter selalu sinkron
  // dengan kategori yang tersedia di InputBerita.jsx
  useEffect(() => {
    const muatKategori = async () => {
      try {
        const data = await getKategoriBerita();
        setKategoriList(data);
      } catch (err) {
        console.error("Gagal memuat kategori berita:", err);
      }
    };
    muatKategori();
  }, []);

  // Reset ke halaman 1 setiap kali user melakukan pencarian atau ganti filter kategori
  useEffect(() => {
    setCurrentPage(1);
  }, [pencarian, activeFilter]);

  const beritaTersaring = useMemo(() => {
    return dataBerita
      .filter((b) => activeFilter === "Semua" || b.kategori_nama === activeFilter)
      .filter((b) => b.judul.toLowerCase().includes(pencarian.toLowerCase()));
  }, [dataBerita, pencarian, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(beritaTersaring.length / itemsPerPage));

  // Menjaga currentPage tetap valid setiap kali data/filter/totalPages berubah,
  // supaya tidak "nyangkut" di halaman yang sudah tidak ada datanya.
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return beritaTersaring.slice(startIndex, startIndex + itemsPerPage);
  }, [beritaTersaring, currentPage]);

  const handleHapus = async (id) => {
    if (!window.confirm("Yakin ingin menghapus berita ini?")) return;
    if (hapusLoadingId) return;

    setHapusLoadingId(id);
    try {
      await deleteBerita(id);
      setDataBerita((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setHapusLoadingId(null);
    }
  };

  const tampilkanTabel = !loading && !errorMsg && beritaTersaring.length > 0;
  const tampilkanKosong = !loading && !errorMsg && beritaTersaring.length === 0;

  return (
    <div className="min-h-screen bg-[#F5FBF1] p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Berita</h1>
          <button
            onClick={() => navigate("/admin/berita/input-berita")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-green-700 hover:bg-green-800 text-white shadow-sm"
          >
            <FaPlus className="text-xs" /> Tambah Berita
          </button>
        </div>

        {/* CARD PENCARIAN & FILTER */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
              <input
                type="text"
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
                placeholder="Cari judul berita..."
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
              />
            </div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
            >
              <option value="Semua">Semua</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.nama}>{k.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CARD TABEL */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <p className="text-sm">Memuat data...</p>
              </div>
            )}

            {!loading && errorMsg && (
              <div className="flex flex-col items-center justify-center py-16 text-red-500">
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            {tampilkanKosong && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FaNewspaper className="text-3xl mb-3" />
                <p className="text-sm">Belum ada berita yang cocok.</p>
              </div>
            )}

            {tampilkanTabel && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs tracking-wide">
                      JUDUL
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs tracking-wide">
                      KATEGORI
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs tracking-wide">
                      STATUS
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs tracking-wide">
                      TANGGAL
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs tracking-wide">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((b) => {
                    const IkonKategori = KATEGORI_ICON[b.kategori_nama] || FaNewspaper;
                    return (
                      <tr
                        key={b.id}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-4 font-medium text-gray-800">
                          <div className="flex items-center gap-3">
                            {b.foto_utama_url ? (
                              <img
                                src={b.foto_utama_url}
                                alt={b.judul}
                                className="w-9 h-9 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-700 shrink-0">
                                <IkonKategori className="text-xs" />
                              </span>
                            )}
                            <span className="line-clamp-2">{b.judul}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500">{b.kategori_nama || "-"}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              b.status === "terbit" ? "text-green-700" : "text-gray-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.status === "terbit" ? "bg-green-600" : "bg-gray-400"
                              }`}
                            />
                            {b.status === "terbit" ? "Terbit" : "Draft"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500">{b.tanggal_publikasi || "-"}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/berita/edit-berita/${b.id}`)}
                            disabled={hapusLoadingId === b.id}
                            className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center p-2 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit"
                          >
                            <FaPen className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleHapus(b.id)}
                            disabled={hapusLoadingId === b.id}
                            className="text-red-500 hover:text-red-700 inline-flex items-center p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Bagian Bawah: Informasi Data & Tombol Pagination */}
          {tampilkanTabel && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50 mt-auto">
              <div className="text-xs text-gray-500 mb-3 sm:mb-0">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, beritaTersaring.length)} dari {beritaTersaring.length} berita
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Sebelumnya
                </button>

                <span className="px-3 py-1.5 text-xs font-medium text-gray-700 flex items-center">
                  Hal {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListBerita;