import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaHome, FaMapMarkedAlt, FaThLarge, FaInfoCircle } from "react-icons/fa";
import menus from "../../constants/menu";
import logo from "../../assets/images/logo-desa.png";

const mobileIcons = {
  "/": FaHome,
  "/peta": FaMapMarkedAlt,
  "/kategori": FaThLarge,
  "/tentang": FaInfoCircle,
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        {/* Container Utama & Bagian Desktop: Tetap menggunakan struktur awal kamu */}
        <div className="w-full flex items-center justify-between pl-10 pr-4 md:pr-30 py-4">
          
          <NavLink to="/" className="flex items-center gap-4">
            <img
              src={logo}
              alt="Logo Desa Senggreng"
              className="w-10 h-10 md:w-15 md:h-15 transition-transform hover:scale-105"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            <div className="flex flex-col items-center text-center">
              <h1 className="text-base md:text-2xl font-bold text-green-700 leading-tight">
                SIG DESA SENGGRENG
              </h1>
              <p className="text-[10px] md:text-sm font-semibold text-gray-690 uppercase tracking-wide">
                Sistem Informasi Geografis
              </p>
            </div>
          </NavLink>

          {/* Menu - Desktop (Sama sekali tidak disentuh) */}
          <ul className="hidden md:flex items-center gap-10">
            {menus.map((menu) => (
              <li key={menu.id}>
                <NavLink
                  to={menu.path}
                  end={menu.path === "/"}
                  className={({ isActive }) =>
                    `relative py-1 transition-colors duration-200 ${
                      isActive
                        ? "text-green-700 font-semibold after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-green-700"
                        : "text-gray-700 font-semibold hover:text-green-700 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-green-700 after:transition-all after:duration-300 hover:after:w-full"
                    }`
                  }
                >
                  {menu.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Hamburger Button - Mobile (Diperbaiki letaknya di ujung kanan layar mobile saja) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-green-700 focus:outline-none"
            aria-label="Buka menu"
          >
            {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>

        </div>

        {/* Dropdown Menu Mobile: Diperbarui agar bersih dari garis bawah / underline */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-gray-100 ${
            isOpen ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col px-4 py-6 gap-1">
            {menus.map((menu, index) => {
              const IconKomponen = mobileIcons[menu.path] || FaInfoCircle;

              return (
                <li
                  key={menu.id}
                  className="transition-all duration-300"
                  style={{
                    transitionDelay: isOpen ? `${index * 60}ms` : "0ms",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(-10px)",
                  }}
                >
                  <NavLink
                    to={menu.path}
                    end={menu.path === "/"}
                    onClick={() => setIsOpen(false)}
                    // Ditambahkan no-underline untuk menghapus garis bawah dan flex untuk merapikan ikon
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 rounded-xl no-underline transition-colors ${
                        isActive
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                  >
                    <IconKomponen className="text-lg opacity-85" />
                    <span>{menu.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;