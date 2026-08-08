import { useState } from "react";

import {
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaTiktok,
  FaGlobe,
  FaShareAlt,
  FaCopy,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import menus from "../../constants/menu";

import logo from "../../assets/images/logo-desa.png";

function Footer() {
  const [showShare, setShowShare] = useState(false);

const website = window.location.href;

const copyLink = async () => {
  const url = window.location.href;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;

      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      document.execCommand("copy");

      document.body.removeChild(textArea);
    }

    alert("Link berhasil disalin!");
    setShowShare(false);

  } catch (err) {
    alert("Gagal menyalin link.");
  }
};
  return (
    <footer className="bg-[#16241F] text-white pt-12 pb-6">
      <div className="pl-3 pr-3 md:pl-34 md:pr-15 grid grid-cols-1 gap-10 md:grid-cols-3">
        {/* LEFT - LOGO & DESKRIPSI */}
        <div className="w-full md:justify-self-start">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-start">
            <img
              src={logo}
              alt="Logo Desa Senggreng"
              className="w-20 h-20 object-contain shrink-0"
            />

            <div className="text-left w-full">
              <h1 className="text-2xl font-bold">
                SIG DESA SENGGRENG
              </h1>

              <p className="text-sm text-gray-300 uppercase">
                Sistem Informasi Geografis
              </p>

              <p className="text-gray-300 mt-4 text-sm leading-relaxed">
                Sistem Informasi Geografis Desa Senggreng — mendokumentasikan
                dan mempromosikan potensi desa secara digital.
              </p>

              {/* ICON WEBSITE & SHARE */}
              <div className="flex gap-4 mt-6">
                {/* Website */}
                <a
                  href="https://desasenggreng.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website Desa"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-green-500 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <FaGlobe />
                </a>

               <div className="relative">

  <button
    onClick={() => setShowShare(!showShare)}
    aria-label="Bagikan halaman ini"
    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-green-500 hover:text-white hover:scale-110 transition-all duration-300"
  >
    <FaShareAlt />
  </button>

  {showShare && (
    <div className="absolute bottom-12 left-0 w-52 rounded-xl bg-white shadow-2xl overflow-hidden z-50">

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `Yuk kunjungi website SIG Desa Senggreng:\n${website}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowShare(false)}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaWhatsapp className="text-green-500 text-lg" />
        <span className="text-gray-700">WhatsApp</span>
      </a>

      {/* Salin Link */}
      <button
        onClick={copyLink}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaCopy className="text-blue-500 text-lg" />
        <span className="text-gray-700">Salin Link</span>
      </button>

    </div>
  )}

</div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE - NAVIGASI */}
        <div className="w-full md:w-auto md:mx-auto">
          <h2 className="text-lg font-semibold mb-5 border-b border-green-400 pb-2 inline-block text-green-200">
            NAVIGASI
          </h2>

          <ul className="space-y-3 text-gray-300 text-left">
            {menus.map((m) => (
              <li key={m.id}>
                <NavLink
                  to={m.path}
                  end={m.path === "/"}
                  className={({ isActive }) =>
                    isActive
                      ? "text-white font-semibold transition-colors"
                      : "text-gray-300 hover:text-green-400 transition-colors"
                  }
                >
                  {m.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT - HUBUNGI KAMI */}
        <div className="w-full md:justify-self-end text-left">
          <h2 className="text-lg font-semibold mb-5 border-b border-green-400 pb-2 inline-block text-green-200">
            HUBUNGI KAMI
          </h2>

          <div className="space-y-5 text-gray-300 text-sm">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/desasenggreng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-green-400 transition-all duration-300"
            >
              <FaInstagram className="text-xl shrink-0" />
              <span>@desasenggreng</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/6288228529370"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-green-400 transition-all duration-300"
            >
              <FaWhatsapp className="text-xl shrink-0" />
              <span>088228529370</span>
            </a>

            {/* Email */}
            <a
              href="mailto:senggreng.sumberpucung@malangkab.go.id"
              className="flex items-start gap-3 break-all hover:text-green-400 transition-all duration-300"
            >
              <FaEnvelope className="text-xl shrink-0 mt-0.5" />
              <span>senggreng.sumberpucung@malangkab.go.id</span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@pemdes.senggreng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-green-400 transition-all duration-300"
            >
              <FaTiktok className="text-xl shrink-0" />
              <span>@pemdes.senggreng</span>
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm text-gray-400 px-4">
        © 2026 Pemerintah Desa Senggreng - Kecamatan Sumberpucung - Kabupaten
        Malang
      </div>
    </footer>
  );
}

export default Footer;