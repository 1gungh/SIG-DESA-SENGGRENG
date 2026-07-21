import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaWhatsapp,
  FaChevronLeft,
} from "react-icons/fa";
import { getLokasiDetailPublik, getLokasiTerdekat } from "../../services/lokasiService";

// Warna badge kategori pada kartu "Potensi Terdekat", supaya bervariasi seperti referensi desain
const WARNA_BADGE_KATEGORI = {
  UMKM: "bg-green-50 text-green-700",
  "Wisata Alam": "bg-purple-50 text-purple-600",
  Pertanian: "bg-amber-50 text-amber-600",
  Peternakan: "bg-orange-50 text-orange-600",
  Fasilitas: "bg-pink-50 text-pink-600",
};

// Hitung jarak lurus antar 2 koordinat (rumus Haversine), sama seperti yang dipakai di Peta.jsx
function hitungJarak(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatJarak(meter) {
  if (meter == null || isNaN(meter)) return "";
  if (meter < 1000) return Math.round(meter) + " m";
  return (meter / 1000).toFixed(1) + " km";
}

function DetailPotensi() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [terdekat, setTerdekat] = useState([]);
  const [fotoAktif, setFotoAktif] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let batal = false;

    const muatDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const hasil = await getLokasiDetailPublik(id);

        if (!hasil) {
          if (!batal) {
            setError("Data tidak ditemukan.");
            setLoading(false);
          }
          return;
        }

        if (batal) return;
        setData(hasil);
        setFotoAktif(0);

        const daftarLain = await getLokasiTerdekat(id);

        const urutkanBerdasarkanJarak = (acuan) => {
          const daftar = daftarLain.map((d) => ({
            ...d,
            jarakMeter:
              d.lat != null && d.lng != null && acuan
                ? hitungJarak(acuan.lat, acuan.lng, d.lat, d.lng)
                : null,
          }));
          daftar.sort((a, b) => {
            if (a.jarakMeter == null) return 1;
            if (b.jarakMeter == null) return -1;
            return a.jarakMeter - b.jarakMeter;
          });
          if (!batal) {
            setTerdekat(daftar.slice(0, 3));
            setLoading(false);
          }
        };

        // Ambil lokasi pengguna sekarang, lalu urutkan potensi lain berdasarkan jarak
        // sebenarnya. Kalau geolocation gagal/ditolak, fallback pakai lokasi potensi
        // yang sedang dibuka sebagai acuan urutan.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              urutkanBerdasarkanJarak({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {
              urutkanBerdasarkanJarak(hasil.lat != null ? { lat: hasil.lat, lng: hasil.lng } : null);
            }
          );
        } else {
          urutkanBerdasarkanJarak(hasil.lat != null ? { lat: hasil.lat, lng: hasil.lng } : null);
        }
      } catch (err) {
        if (!batal) {
          setError("Gagal memuat data: " + err.message);
          setLoading(false);
        }
      }
    };

    muatDetail();

    return () => {
      batal = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Memuat data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="text-gray-500 text-sm">{error || "Data tidak ditemukan."}</p>
        <Link to="/peta" className="text-green-700 text-sm font-medium hover:underline">
          &larr; Kembali ke Peta
        </Link>
      </div>
    );
  }

  const daftarFoto = Array.isArray(data.foto) && data.foto.length > 0 ? data.foto : [];
  const daftarProduk = Array.isArray(data.produk) ? data.produk : [];
  const nomorWa = data.whatsapp ? data.whatsapp.replace(/^0/, "62").replace(/\D/g, "") : null;

  return (
    <div className="min-h-screen bg-[#F5FBF1] pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        {/* Tombol kembali */}
        <Link
          to="/peta"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 mb-4 transition-colors"
        >
          <FaChevronLeft className="text-xs" />
          Kembali ke Peta
        </Link>

        {/* Foto utama */}
        <div className="rounded-2xl overflow-hidden bg-gray-100 h-72 sm:h-96">
          {daftarFoto.length > 0 ? (
            <img
              src={daftarFoto[fotoAktif]}
              alt={data.nama}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              Belum ada foto
            </div>
          )}
        </div>

        {/* Galeri thumbnail */}
        {daftarFoto.length > 1 && (
          <div className="flex gap-3 mt-3">
            {daftarFoto.map((url, i) => (
              <button
                key={url + i}
                onClick={() => setFotoAktif(i)}
                className={`w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                  fotoAktif === i ? "border-green-600" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6">
          {/* KOLOM KIRI: Deskripsi & Produk */}
          <div className="flex flex-col gap-5 min-w-0">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{data.nama}</h1>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {data.kategori}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-700 mt-4 mb-1.5">Deskripsi Usaha</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{data.deskripsi}</p>
            </div>

            {daftarProduk.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Produk & Menu</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {daftarProduk.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#FBF8F1] border border-gray-100 rounded-xl px-4 py-3"
                    >
                      <span className="text-sm text-gray-700">{p.nama}</span>
                      <span className="text-sm font-semibold text-green-700">
                        Rp {Number(p.harga || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: Info Bisnis */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">Informasi Bisnis</p>

              <div className="flex flex-col gap-3 text-sm">
                {data.lokasi && (
                  <div className="flex items-start gap-2.5 text-gray-600">
                    <FaMapMarkerAlt className="text-green-700 mt-0.5 shrink-0" />
                    <span>{data.lokasi}</span>
                  </div>
                )}
                {data.jam_teks && (
                  <div className="flex items-start gap-2.5 text-gray-600">
                    <FaClock className="text-green-700 mt-0.5 shrink-0" />
                    <span>{data.jam_teks} WIB</span>
                  </div>
                )}
                {data.pemilik && (
                  <div className="flex items-start gap-2.5 text-gray-600">
                    <FaUser className="text-green-700 mt-0.5 shrink-0" />
                    <span>{data.pemilik}</span>
                  </div>
                )}
              </div>

              {nomorWa && (
                <a
                  href={`https://wa.me/${nomorWa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
                >
                  <FaWhatsapp />
                  Chat WhatsApp
                </a>
              )}

              {data.lat && data.lng && (
                <div className="mt-4 rounded-xl overflow-hidden h-32 bg-gray-100">
                  <iframe
                    title="Lokasi"
                    className="w-full h-full border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.lng - 0.005}%2C${data.lat - 0.005}%2C${data.lng + 0.005}%2C${data.lat + 0.005}&marker=${data.lat}%2C${data.lng}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Potensi Terdekat */}
        {terdekat.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">
                Potensi Terdekat <span className="text-gray-400 font-normal">Jelajahi UMKM dan titik menarik di sekitar lokasi ini</span>
              </p>
              <Link to="/kategori" className="text-sm text-green-700 hover:underline shrink-0">
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {terdekat.map((t) => (
                <Link
                  key={t.id}
                  to={`/potensi/${t.id}`}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="h-28 bg-gray-100">
                    {Array.isArray(t.foto) && t.foto[0] && (
                      <img src={t.foto[0]} alt={t.nama} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3">
                    <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${WARNA_BADGE_KATEGORI[t.kategori] || "bg-green-50 text-green-700"}`}>
                      {t.kategori}
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-1.5">{t.nama}</p>
                    <p className="text-xs text-gray-400">
                      {t.lokasi}
                      {t.jarakMeter != null && ` · ${formatJarak(t.jarakMeter)} dari sini`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailPotensi;