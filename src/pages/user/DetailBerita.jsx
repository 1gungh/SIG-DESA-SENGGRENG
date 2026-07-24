import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaChevronLeft, FaCalendarAlt, FaWhatsapp, FaTimes } from "react-icons/fa";
// 1. DIPERBAIKI: Import fungsi getBeritaBySlug
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

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 2. DIPERBAIKI: Panggil fungsi getBeritaBySlug
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
          galeri: galeriFoto,
        };

        setData(normalized);

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
  // 3. DIPERBAIKI: Ubah id menjadi slug di sini
  }, [slug]); 

  useEffect(() => {
    if (!previewImage) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

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

  const fotoTambahan = data.galeri.slice(1);

  return (
    <div className="min-h-screen bg-[#F5FBF1] pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 mb-4 transition-colors"
        >
          <FaChevronLeft className="text-xs" />
          Kembali ke Beranda
        </Link>

        <div
          className="relative rounded-2xl overflow-hidden bg-gray-100 h-56 sm:h-80 cursor-zoom-in"
          onClick={() => setPreviewImage(data.gambar)}
        >
          <img src={data.gambar} alt={data.judul} className="w-full h-full object-cover" />
          <span className="absolute top-4 left-4 bg-green-700 text-white text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-md">
            {data.kategori}
          </span>
        </div>

        {fotoTambahan.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {fotoTambahan.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPreviewImage(f.url)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-gray-100 hover:opacity-80 transition-opacity cursor-zoom-in"
                title="Lihat foto"
              >
                <img src={f.url} alt="Foto berita" className="w-full h-full object-cover" />
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
                  // 4. DIPERBAIKI: Link di sini sekarang menggunakan b.slug
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

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Tutup"
          >
            <FaTimes />
          </button>
          <img
            src={previewImage}
            alt="Pratinjau foto"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default DetailBerita;