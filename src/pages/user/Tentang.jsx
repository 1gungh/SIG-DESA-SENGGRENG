import ScrollReveal from "../../components/common/ScrollReveal";

function Tentang() {
  return (
    <div className="w-full">
      {/* Video Profil Desa */}
    {/* Video Profil Desa */}
<section className="w-full relative overflow-hidden bg-black">
  <div className="relative w-full aspect-video md:h-[100vh] lg:h-[120vh] overflow-hidden">
    <video
      className="absolute inset-0 w-full h-full object-cover object-center"
      autoPlay
      muted
      loop
      playsInline
    >
      <source src="/ProfileDesaSenggrengBahasaIndonesia.mp4" type="video/mp4" />
      Browser Anda tidak mendukung tag video.
    </video>
  </div>
</section>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-12">
        <div>
          <ScrollReveal>
            <span className="inline-block bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Profil Desa
            </span>
          </ScrollReveal>

          <ScrollReveal>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 md:mb-6">
              Tentang Desa Senggreng
            </h1>
          </ScrollReveal>

          <ScrollReveal>
            <p className="max-w-3xl text-base sm:text-lg text-gray-700 leading-relaxed">
              Desa Senggreng merupakan permata hijau di Kabupaten Malang. Dengan
              sejarah panjang sebagai wilayah yang subur, masyarakat kami terus
              berinovasi untuk menjadi desa yang mandiri, sejahtera, dan siap
              menghadapi era digital tanpa meninggalkan akar budaya.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="w-full bg-green-50 py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <FeatureCard
              icon="🏪"
              title="UMKM Terdata"
              desc="Memetakan lebih dari 100+ unit usaha warga."
              bg="bg-amber-100"
              className="col-span-2"
            />
            <FeatureCard
              icon="🗺️"
              title="Destinasi Wisata"
              desc="Menyajikan titik wisata lokal yang eksotis."
              bg="bg-green-100"
            />
            <FeatureCard
              icon="🌾"
              title="Lahan Pertanian"
              desc="Optimalisasi pengelolaan sumber daya alam."
              bg="bg-rose-100"
            />
            <FeatureCard
              icon="📊"
              title="Data Real-time"
              desc="Statistik akurat untuk pengambilan kebijakan."
              bg="bg-blue-100"
              className="col-span-2"
            />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
              Mengapa SIG Potensi Desa?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
              Sistem Informasi Geografis (SIG) ini dibangun sebagai jembatan
              informasi antara potensi desa dan dunia luar. Kami percaya
              bahwa data yang terorganisir adalah kunci utama pertumbuhan
              ekonomi desa di era modern.
            </p>
            <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
              Dengan memetakan UMKM, Wisata, dan Pertanian secara digital,
              kami memudahkan investor, pembeli, dan wisatawan untuk
              menemukan keunikan yang dimiliki oleh Desa Senggreng dengan
              satu klik saja.
            </p>
            <a
              href="/peta"
              className="inline-block bg-green-700 hover:bg-green-800 text-white font-medium px-5 py-2.5 rounded-lg transition text-sm sm:text-base"
            >
              Lihat Peta →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="w-full bg-green-800 py-12 md:py-16 text-center px-5 sm:px-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">
          Ingin berkontribusi untuk kemajuan Senggreng?
        </h2>
        <p className="text-green-100 max-w-xl mx-auto mb-6 text-sm sm:text-base">
          Kami membuka pintu bagi relawan, investor, maupun mitra yang ingin
          berkolaborasi dalam mengembangkan potensi desa melalui teknologi
          informasi.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <a
            href="https://wa.me/+6288228529370"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-green-800 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition"
          >
            Hubungi Kami
          </a>
          <a
            href="/dokumen"
            className="border border-white text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition"
          >
            Pelajari Dokumen
          </a>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, bg, className = "" }) {
  return (
    <div
      className={`bg-gray-100 rounded-2xl p-5 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${bg}`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

export default Tentang;