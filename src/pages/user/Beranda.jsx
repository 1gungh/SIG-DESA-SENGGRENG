import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaMapMarkedAlt, FaArrowRight } from "react-icons/fa";
import heroImage from "../../assets/images/beranda-1.png";
import {
  getStatistikPotensi,
  getSemuaPotensiAktif,
  getBeritaTerkiniRingkas,
} from "../../services/lokasiService";

// Warna badge kategori berita — fallback kalau kategori belum dikenal
const BADGE_KATEGORI_BERITA = {
  UMKM: "bg-green-100 text-green-700",
  Pertanian: "bg-orange-100 text-orange-600",
  Wisata: "bg-blue-100 text-blue-600",
  Pelatihan: "bg-purple-100 text-purple-600",
  Sosial: "bg-pink-100 text-pink-600",
  Infrastruktur: "bg-gray-200 text-gray-700",
};

// Komponen carousel foto — auto slide tiap beberapa detik, dengan indikator dot
function ImageCarousel({ images, alt, intervalMs = 3000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images, intervalMs]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
        Belum ada foto
      </div>
    );
  }

  return (
    <div className="relative w-full h-40 overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "bg-white w-4" : "bg-white/60 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Pilih N item acak dari sebuah array (Fisher-Yates), tanpa mengubah array aslinya
function pilihAcak(array, jumlah) {
  const hasil = [...array];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil.slice(0, jumlah);
}

function Beranda() {
  const [stats, setStats] = useState({ umkm: 0, wisata: 0, agrobisnis: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const [berita, setBerita] = useState([]);
  const [loadingBerita, setLoadingBerita] = useState(true);

  const [potensiUnggulan, setPotensiUnggulan] = useState([]);
  const [semuaPotensi, setSemuaPotensi] = useState([]); // seluruh data, dipakai untuk rotasi acak
  const [loadingPotensi, setLoadingPotensi] = useState(true);

  // Statistik dinamis
  useEffect(() => {
    const muatStatistik = async () => {
      setLoadingStats(true);
      try {
        const hasil = await getStatistikPotensi();
        setStats(hasil);
      } catch (err) {
        console.error("Gagal memuat data statistik:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    muatStatistik();
  }, []);

  // Berita terkini
  useEffect(() => {
    const muatBerita = async () => {
      setLoadingBerita(true);
      try {
        const hasil = await getBeritaTerkiniRingkas(3);
        setBerita(hasil);
      } catch (err) {
        console.error("Gagal memuat berita terkini:", err);
      } finally {
        setLoadingBerita(false);
      }
    };
    muatBerita();
  }, []);

  // Potensi unggulan — ambil semua data sekali, tampilkan 3 acak,
  // lalu rotasi ulang otomatis tiap beberapa detik selagi halaman ini terbuka.
  useEffect(() => {
    const muatPotensi = async () => {
      setLoadingPotensi(true);
      try {
        const hasil = await getSemuaPotensiAktif();
        setSemuaPotensi(hasil);
        setPotensiUnggulan(pilihAcak(hasil, 3));
      } catch (err) {
        console.error("Gagal memuat potensi unggulan:", err);
      } finally {
        setLoadingPotensi(false);
      }
    };
    muatPotensi();
  }, []);

  useEffect(() => {
    if (semuaPotensi.length <= 3) return; // tidak perlu rotasi kalau datanya cuma sedikit

    const RENTANG_ROTASI_MS = 8000; // ganti sesuai selera, misal 8 detik
    const timer = setInterval(() => {
      setPotensiUnggulan(pilihAcak(semuaPotensi, 3));
    }, RENTANG_ROTASI_MS);

    return () => clearInterval(timer);
  }, [semuaPotensi]);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative h-[420px] md:h-[480px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Desa Senggreng"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-white text-2xl md:text-5xl font-bold drop-shadow-md">
            SIG Potensi Desa Senggreng
          </h1>

          <NavLink
            to="/peta"
            className="mt-5 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded font-medium shadow-lg transition-colors"
          >
            <FaMapMarkedAlt />
            Jelajahi Desa
          </NavLink>
        </div>
      </section>

      {/* STATISTIK DINAMIS */}
      <section className="relative z-10 -mt-10 flex justify-center">
        <div className="max-w-7xl w-full bg-white rounded-2xl shadow-md border border-gray-200 p-4 mx-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100 py-6 px-4">

            {/* Box UMKM */}
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-700">
                {loadingStats ? "..." : `${stats.umkm}+`}
              </p>
              <p className="text-xs font-semibold md:text-sm text-gray-500 mt-1">UMKM AKTIF</p>
            </div>

            {/* Box Wisata */}
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {loadingStats ? "..." : stats.wisata}
              </p>
              <p className="text-xs font-semibold md:text-sm text-gray-500 mt-1">DESTINASI WISATA</p>
            </div>

            {/* Box Agrobisnis */}
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                {loadingStats ? "..." : stats.agrobisnis}
              </p>
              <p className="text-xs font-semibold md:text-sm text-gray-500 mt-1">TITIK AGROBISNIS</p>
            </div>

          </div>
        </div>
      </section>

      {/* BERITA TERKINI */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-10">
        <h2 className="text-xl md:text-2xl font-bold text-green-700">
          Berita Terkini
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-6 pt-1">
          Ikuti perkembangan terbaru dan kegiatan produktif di Desa Senggreng.
        </p>

        {loadingBerita && <p className="text-sm text-gray-400">Memuat berita...</p>}

        {!loadingBerita && berita.length === 0 && (
          <p className="text-sm text-gray-400">Belum ada berita yang dipublikasikan.</p>
        )}

        {!loadingBerita && berita.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 pt-3">
            {berita.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <ImageCarousel images={item.gambar} alt={item.judul} />

                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase ${
                        BADGE_KATEGORI_BERITA[item.kategori] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.kategori || "Berita"}
                    </span>
                    <span className="text-xs text-gray-400">{item.tanggal}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 leading-snug">
                    {item.judul}
                  </h3>
                  <NavLink
                    to={`/berita/${item.slug}`}
                    className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium mt-3 transition-colors"
                  >
                    Baca Selengkapnya <FaArrowRight className="text-xs" />
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* POTENSI UNGGULAN */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 -mt-3">
        <div className="flex flex-col mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-green-700">
            Potensi Unggulan
          </h2>

          <NavLink
            to="/kategori"
            className="self-end mt-2 inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors"
          >
            Lihat Semua Potensi <FaArrowRight className="text-xs" />
          </NavLink>
        </div>

        {loadingPotensi && <p className="text-sm text-gray-400 pb-10">Memuat potensi unggulan...</p>}

        {!loadingPotensi && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-10">
            {potensiUnggulan.map((p) => {
              const mapsUrl =
                p.lat != null && p.lng != null
                  ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
                  : null;
              // Link detail sekarang butuh kategoriSlug + slug (bukan id lagi).
              // Kalau salah satunya kosong (data lama belum ikut migrasi), fallback ke /kategori.
              const detailUrl =
                p.kategoriSlug && p.slug ? `/potensi/${p.kategoriSlug}/${p.slug}` : "/kategori";

              return (
                <div
                  key={p.id}
                  className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-500 text-sm overflow-hidden">
                    {p.foto ? (
                      <img src={p.foto} alt={p.nama} className="w-full h-full object-cover" />
                    ) : (
                      "Belum ada foto"
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{p.nama}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-3">
                      {p.deskripsi}
                    </p>
                    <div className="flex gap-2 mt-4">
                      {mapsUrl ? (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                        >
                          <FaMapMarkedAlt className="text-[10px]" />
                          Rute Lokasi
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-gray-200 text-gray-400 text-xs px-3 py-2 rounded-lg cursor-not-allowed">
                          <FaMapMarkedAlt className="text-[10px]" />
                          Rute Lokasi
                        </span>
                      )}
                      <NavLink
                        to={detailUrl}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        Detail
                      </NavLink>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card CTA */}
            <div className="bg-green-700 rounded-2xl p-6 flex flex-col justify-between text-white">
              <div>
                <h3 className="font-semibold text-base mb-2">
                  Ingin Mengetahui Lebih Dalam?
                </h3>
                <p className="text-sm text-green-100 leading-relaxed">
                  Jelajahi peta interaktif untuk melihat seluruh potensi UMKM,
                  wisata, pertanian, peternakan, dan fasilitas umum di Desa
                  Senggreng secara lengkap.
                </p>
              </div>

              <NavLink
                to="/peta"
                className="mt-6 inline-flex items-center justify-center gap-2 bg-white text-green-700 hover:bg-gray-100 font-medium text-sm px-5 py-2.5 rounded-lg transition-colors w-fit"
              >
                <FaMapMarkedAlt />
                Buka Peta
              </NavLink>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Beranda;