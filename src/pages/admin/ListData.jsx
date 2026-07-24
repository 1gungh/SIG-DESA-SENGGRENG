import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUtensils,
  FaMosque,
  FaGraduationCap,
  FaClinicMedical,
  FaTools,
  FaTshirt,
  FaFutbol,
  FaPalette,
  FaShoppingBasket,
  FaMapMarkerAlt,
  FaPen,
  FaTrash,
} from "react-icons/fa";
import { getAllLokasi, deleteLokasi } from "../../services/lokasiService";

const KATEGORI_LIST = [
  "Semua",
  "UMKM",
  "Tempat Ibadah",
  "Tempat Wisata",
  "Sarana Pendidikan",
  "Fasilitas Kesehatan",
  "Bengkel",
  "Laundry",
  "Sarana Olahraga",
  "Sanggar Kesenian",
  "Minimarket",
];

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

function formatWaktuRelatif(timestamp) {
  if (!timestamp) return "-";
  const detik = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (detik < 60) return "Baru saja";
  if (detik < 3600) return `${Math.floor(detik / 60)} menit yang lalu`;
  if (detik < 86400) return `${Math.floor(detik / 3600)} jam yang lalu`;
  if (detik < 172800) return "Kemarin";
  if (detik < 604800) return `${Math.floor(detik / 86400)} hari lalu`;
  return `${Math.floor(detik / 604800)} minggu lalu`;
}

function ListData() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");

  // State baru untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const muatData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const hasil = await getAllLokasi();
      setData(hasil);
    } catch (err) {
      setErrorMsg("Gagal memuat data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  // Reset ke halaman 1 setiap kali user melakukan pencarian atau filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  const filteredData = useMemo(() => {
    return data
      .filter((d) => activeFilter === "Semua" || d.kategori_nama === activeFilter)
      .filter((d) => d.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, activeFilter, searchTerm]);

  // Memotong data hanya 10 item untuk halaman saat ini
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleTambah = () => {
    navigate("/admin/data/input-data");
  };

  const handleEdit = (item) => {
    navigate(`/admin/data/edit-data/${item.id}`);
  };

  const handleHapus = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await deleteLokasi(id);
      setData((prev) => prev.filter((d) => d.id !== id));

      // Jika data terakhir di halaman dihapus, mundur ke halaman sebelumnya
      if (paginatedData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBF1] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Kelola Data</h1>
        <p className="text-sm text-gray-500 mb-6">
          Tambah, ubah, atau hapus data potensi desa di sini.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Cari nama lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {KATEGORI_LIST.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <button
            onClick={handleTambah}
            className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
          >
            + Tambah Potensi Baru
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Nama Lokasi</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Terakhir Update</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Memuat data...
                  </td>
                </tr>
              )}
              {!loading && errorMsg && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-red-500 text-sm">
                    {errorMsg}
                  </td>
                </tr>
              )}
              {!loading && !errorMsg && filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}

              {/* Gunakan paginatedData di sini, bukan filteredData */}
              {!loading && !errorMsg && paginatedData.map((item) => {
                const IkonKategori = KATEGORI_ICON[item.kategori_nama] || FaMapMarkerAlt;
                return (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.foto_utama_url ? (
                          <img
                            src={item.foto_utama_url}
                            alt={item.nama}
                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-700 shrink-0">
                            <IkonKategori className="text-sm" />
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.nama}</p>
                          <p className="text-xs text-gray-500">
                            {item.dusun_nama || item.alamat_lengkap || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.kategori_nama}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          item.status === "aktif" ? "text-green-700" : "text-gray-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "aktif" ? "bg-green-600" : "bg-gray-400"
                          }`}
                        />
                        {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatWaktuRelatif(item.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center"
                        title="Edit"
                      >
                        <FaPen className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleHapus(item.id)}
                        className="text-red-500 hover:text-red-700 inline-flex items-center"
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

          {/* Bagian Bawah: Informasi Data & Tombol Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 mb-3 sm:mb-0">
              Menampilkan {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-xs font-medium rounded-md border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Sebelumnya
              </button>

              <span className="px-3 py-1 text-xs font-medium text-gray-700 flex items-center">
                Hal {currentPage} / {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 text-xs font-medium rounded-md border ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListData;