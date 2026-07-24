import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaChevronLeft, FaCalendarAlt, FaWhatsapp, FaTimes } from "react-icons/fa";
import { getBeritaBySlug, getAllBerita } from "../../services/beritaService"; 

const WARNA_BADGE_KATEGORI = {
  UMKM: "bg-green-50 text-green-700",
  "Tempat Ibadah": "bg-purple-50 text-purple-600",
  "Sarana Pendidikan": "bg-blue-50 text-blue-600",
  "Fasilitas Kesehatan": "bg-red-50 text-red-600",
  Bengkel: "bg-orange-50 text-orange-600",
  Laundry: "bg-cyan-50 text-cyan-600",
  "Sarana Olahraga": "bg-amber-50 text-amber-600",
  "Sanggar Kesenian": "bg-pink-50 text-pink-600",
  Minimarket: "bg-teal-50 text-teal-600",
};

const WARNA_BADGE_DEFAULT = "bg-green-50 text-green-700";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200";

function formatTanggal(tgl) {
  if (!tgl) return "-";
  return new Date(tgl).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailBerita() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [lainnya, setLainnya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MENGGUNAKAN LOGIKA YANG SAMA DENGAN DETAIL POTENSI
  const [fotoAktif, setFotoAktif] = useState(0);
  const [lightboxBuka, setLightboxBuka] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const hasil = await getBeritaBySlug(slug); 
        if (!mounted) return;

        if (!hasil) {
          setError("Berita tidak ditemukan.");
          setData(null);
          setLoading(false);
          return;
        }

        const semuaFoto = [...(hasil.berita_foto || [])].sort(
          (a, b) => (a.urutan || 0) - (b.urutan || 0)
        );
        const fotoUtamaObj = semuaFoto.find((f) => f.is_utama) || semuaFoto[0];
        const galeriFoto = fotoUtamaObj
          ? [fotoUtamaObj, ...semuaFoto.filter((f) => f.id !== fotoUtamaObj.id)]
          : [];

        const normalized = {
          id: hasil.id,
          judul: hasil.judul,
          kategori: hasil.kategori_berita?.nama || "Berita",
          isiHtml: hasil.isi || "",
          tanggal: formatTanggal(hasil.tanggal_publikasi),
          gambar: fotoUtamaObj?.url || FALLBACK_IMG,
          // Ekstrak URL foto saja agar formatnya persis dengan DetailPotensi
          galeri: galeriFoto.map((f) => f.url), 
        };

        setData(normalized);
        setFotoAktif(0); // Reset foto aktif saat berita berubah

        const semua = await getAllBerita();
        const filtered = semua
          .filter((b) => String(b.id) !== String(hasil.id))
          .slice(0, 3);
        setLainnya(filtered);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat berita.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [slug]); 

  // Menutup lightbox dengan tombol ESC
  useEffect(() => {
    if (!lightboxBuka) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxBuka(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxBuka]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Memuat berita...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="text-gray-500 text-sm">{error || "Berita tidak ditemukan."}</p>
        <Link to="/" className="text-green-700 text-sm font-medium hover:underline">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    "Simak berita ini: " + data.judul
  )}`;

  // Menyiapkan daftar foto (menggunakan gambar fallback jika galeri kosong)
  const daftarFoto = data.galeri.length > 0 ? data.galeri : [data.gambar];

  return (
    <div className="min-h-screen bg-[#F5FBF1] pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        {/* Tombol Kembali */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 mb-4 transition-colors"
        >
          <FaChevronLeft className="text-xs" />
          Kembali ke Beranda
        </Link>

        {/* Foto utama (Disamakan dengan DetailPotensi) */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-56 sm:h-96 group">
          {daftarFoto.length > 0 ? (
            <img
              src={daftarFoto[fotoAktif]}
              alt={data.judul}
              onClick={() => setLightboxBuka(true)}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              Belum ada foto
            </div>
          )}
          <span className="absolute top-4 left-4 bg-green-700 text-white text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-md z-10">
            {data.kategori}
          </span>
        </div>

        {/* Galeri thumbnail (Disamakan dengan DetailPotensi) */}
        {daftarFoto.length > 1 && (
          <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mt-6">
          <div className="flex flex-col gap-4 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{data.judul}</h1>

            <div className="flex items-center gap-4 text-xs text-gray-500 pb-4 border-b border-gray-100">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-gray-400" />
                {data.tanggal}
              </span>
            </div>

            <div
              className="prose prose-sm max-w-none text-gray-600 leading-relaxed [&_p]:mb-4 [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: data.isiHtml }}
            />

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2">
              <span className="text-sm text-gray-500">Bagikan Berita:</span>
              <a
                href={waShareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              >
                <FaWhatsapp />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <p className="text-sm font-semibold mb-1.5">Ingin Produk Anda Dipasarkan?</p>
              <p className="text-xs text-blue-100 leading-relaxed mb-4">
                Daftarkan diri pengrajin UMKM Desa Senggreng untuk ikut pelatihan pemasaran di Peta Potensi SIG Desa Senggreng.
              </p>
              <Link
                to="/kategori"
                className="block text-center bg-white text-blue-700 text-sm font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>

        {/* Berita Lainnya */}
        {lainnya.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">Berita Lainnya</p>
              <Link to="/" className="text-sm text-green-700 hover:underline">
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lainnya.map((b) => (
                <Link
                  key={b.id}
                  to={`/berita/${b.slug}`} 
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="h-28 bg-gray-100">
                    <img
                      src={b.foto_utama_url || FALLBACK_IMG}
                      alt={b.judul}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <span
                      className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 ${
                        WARNA_BADGE_KATEGORI[b.kategori_nama] || WARNA_BADGE_DEFAULT
                      }`}
                    >
                      {b.kategori_nama}
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-1.5 leading-snug">{b.judul}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <FaCalendarAlt className="text-[10px]" />
                      {formatTanggal(b.tanggal_publikasi)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Modal untuk melihat gambar full (Disamakan dengan DetailPotensi) */}
      {lightboxBuka && daftarFoto.length > 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxBuka(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl transition-colors"
            onClick={() => setLightboxBuka(false)}
          >
            <FaTimes />
          </button>
          
          <img
            src={daftarFoto[fotoAktif]}
            alt="Gambar Full"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}

export default DetailBerita;