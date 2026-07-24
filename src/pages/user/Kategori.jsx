import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import {
  getSemuaLokasiKategori,
  getKategoriPotensiList,
  getDusunList,
} from "../../services/lokasiService";

const KATEGORI_STYLE = {
  UMKM: { bg: "bg-blue-600", text: "text-white" },
  "Wisata Alam": { bg: "bg-green-600", text: "text-white" },
  Pertanian: { bg: "bg-rose-500", text: "text-white" },
  Peternakan: { bg: "bg-orange-500", text: "text-white" },
  Fasilitas: { bg: "bg-purple-600", text: "text-white" },
};

const ITEM_PER_HALAMAN = 8;

function Kategori() {
  const [dataLokasi, setDataLokasi] = useState([]);
  const [kategoriList, setKategoriList] = useState([]); // dari tabel kategori_potensi
  const [dusunList, setDusunList] = useState([]); // dari tabel dusun
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriAktif, setKategoriAktif] = useState("Semua Kategori");
  const [dusunAktif, setDusunAktif] = useState("Semua Dusun");
  const [halaman, setHalaman] = useState(1);

  useEffect(() => {
    const muatData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [lokasi, kategori, dusun] = await Promise.all([
          getSemuaLokasiKategori(),
          getKategoriPotensiList(),
          getDusunList(),
        ]);
        setDataLokasi(lokasi);
        setKategoriList(kategori);
        setDusunList(dusun);
      } catch (err) {
        setErrorMsg("Gagal memuat data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  const filteredData = useMemo(() => {
    return dataLokasi
      .filter((p) => p.nama.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((p) => kategoriAktif === "Semua Kategori" || p.kategori === kategoriAktif)
      .filter((p) => dusunAktif === "Semua Dusun" || p.lokasi === dusunAktif);
  }, [dataLokasi, searchTerm, kategoriAktif, dusunAktif]);

  const totalHalaman = Math.max(1, Math.ceil(filteredData.length / ITEM_PER_HALAMAN));
  const dataHalamanIni = filteredData.slice(
    (halaman - 1) * ITEM_PER_HALAMAN,
    halaman * ITEM_PER_HALAMAN
  );

  return (
    <div className="w-full bg-green-50 min-h-screen py-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Jelajahi Potensi Desa Senggreng
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mb-6">
          Temukan berbagai kekayaan sumber daya, kuliner khas UMKM, dan destinasi wisata
          unggulan di wilayah Desa Senggreng.
        </p>

        {/* Toolbar: search + filter + dusun */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama tempat atau produk..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHalaman(1);
              }}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={kategoriAktif}
              onChange={(e) => {
                setKategoriAktif(e.target.value);
                setHalaman(1);
              }}
              className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>

            <select
              value={dusunAktif}
              onChange={(e) => {
                setDusunAktif(e.target.value);
                setHalaman(1);
              }}
              className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Semua Dusun">Semua Dusun</option>
              {dusunList.map((d) => (
                <option key={d.id} value={d.nama}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid kartu */}
        {loading && <p className="text-center text-gray-400 py-16">Memuat data...</p>}

        {!loading && errorMsg && (
          <p className="text-center text-red-500 py-16">{errorMsg}</p>
        )}

        {!loading && !errorMsg && dataHalamanIni.length === 0 && (
          <p className="text-center text-gray-400 py-16">Tidak ada data ditemukan.</p>
        )}

        {!loading && !errorMsg && dataHalamanIni.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {dataHalamanIni.map((item) => (
              <KartuPotensi key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !errorMsg && totalHalaman > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setHalaman((h) => Math.max(1, h - 1))}
              disabled={halaman === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setHalaman(num)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                  halaman === num
                    ? "bg-green-700 text-white"
                    : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
              disabled={halaman === totalHalaman}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KartuPotensi({ item }) {
  
  const style = KATEGORI_STYLE[item.kategori] || { bg: "bg-gray-500", text: "text-white" };
  
  // Link detail sekarang butuh kategoriSlug + slug (bukan id lagi).
  // Fallback ke "#" kalau data lama belum punya slug (belum migrasi / belum sinkron).
  const detailUrl =
    item.kategoriSlug && item.slug ? `/potensi/${item.kategoriSlug}/${item.slug}` : "#";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-36 bg-gray-100">
        {item.foto ? (
          <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            Belum ada foto
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
        >
          {item.kategori}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{item.nama}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {item.deskripsi}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <FaMapMarkerAlt className="text-gray-400" />
            {item.lokasi}
          </span>
          <Link
            to={detailUrl}
            className="text-[11px] font-medium text-green-700 hover:underline whitespace-nowrap"
          >
            Lihat Detail →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Kategori;