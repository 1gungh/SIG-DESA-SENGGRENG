import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaDatabase,
  FaCog,
  FaPen,
  FaPowerOff,
  FaList,
  FaPlus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import logo from "../assets/images/logo-desa.png";
import { useAuth } from "../context/AuthContext";

const MENU = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FaChartBar },

  {
    label: "Kelola Data",
    icon: FaDatabase,
    children: [
      {
        to: "/admin/data/input-data",
        label: "Input Data",
        icon: FaPlus,
      },
      {
        to: "/admin/data/list-data",
        label: "List Data",
        icon: FaList,
      },
    ],
  },

  {
    label: "Berita",
    icon: FaPen,
    children: [
      {
        to: "/admin/berita/input-berita",
        label: "Input Berita",
        icon: FaPlus,
      },
      {
        to: "/admin/berita/list-berita",
        label: "List Berita",
        icon: FaList,
      },
    ],
  },

  { to: "/admin/pengaturan", label: "Pengaturan", icon: FaCog },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Nama diambil dari user_metadata (diisi/diubah lewat halaman Pengaturan).
  // Kalau belum pernah diisi, fallback ke bagian sebelum "@" di email, lalu "Admin".
  const namaAdmin = user?.user_metadata?.nama || user?.email?.split("@")[0] || "Admin";

  // Sidebar sebagai off-canvas drawer, khusus tampilan mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const [openMenu, setOpenMenu] = useState(() => {
    if (location.pathname.startsWith("/admin/data")) {
      return "Data";
    }

    if (location.pathname.startsWith("/admin/berita")) {
      return "Berita";
    }

    return null;
  });

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  // Tutup drawer mobile setiap kali pindah halaman lewat menu
  const handleNavigate = () => {
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      {/* LOGO */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo Desa Senggreng"
            className="w-12 h-12 object-contain flex-shrink-0"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />

          <div>
            <p className="font-bold text-green-700 text-xl leading-tight">
              SIG DESA SENGGRENG
            </p>
            <p className="text-xs text-center text-gray-500 tracking-wide">
              SISTEM INFORMASI GEOGRAFIS
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 pt-6 px-3 pb-3 flex flex-col overflow-y-auto">
        {MENU.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isOpen = openMenu === item.label;

            const isChildActive = item.children.some(
              (child) => location.pathname === child.to
            );

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center justify-between w-full px-6 py-4 rounded-lg text-sm font-medium transition ${
                    isChildActive
                      ? "bg-green-50 text-green-800"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <Icon className="text-base" />
                    {item.label}
                  </span>

                  <FiChevronDown
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="ml-6 border-l border-gray-100">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;

                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          onClick={handleNavigate}
                          className={({ isActive }) =>
                            `flex items-center gap-3 pl-6 pr-6 py-3 text-sm transition ${
                              isActive
                                ? "text-green-700 font-semibold"
                                : "text-gray-500 hover:text-green-700"
                            }`
                          }
                        >
                          <ChildIcon className="text-xs" />
                          {child.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavigate}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-green-50 text-green-800"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon className="text-base" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
          {namaAdmin.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{namaAdmin}</p>
          <p className="text-[11px] text-gray-400 truncate">{user?.email || "Admin Utama"}</p>
        </div>

        <button
          className="text-gray-400 hover:text-red-500 shrink-0"
          title="Keluar"
          onClick={handleLogout}
        >
          <FaPowerOff />
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR DESKTOP — tampilan & posisi sama persis seperti sebelumnya, tersembunyi di layar kecil */}
      <aside className="hidden md:flex sticky top-0 h-screen w-85 shrink-0 bg-white border-r border-gray-100 flex-col">
        {sidebarContent}
      </aside>

      {/* SIDEBAR MOBILE — drawer geser dari kiri, hanya muncul saat dibuka */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[1100] flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85%] bg-white flex flex-col shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 z-10"
            >
              <FaTimes className="text-xs" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* KONTEN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR MOBILE — hanya tampil di layar kecil, berisi tombol hamburger */}
        <div className="md:hidden sticky top-0 z-[999] bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 shrink-0"
          >
            <FaBars className="text-base" />
          </button>
          <img src={logo} alt="Logo Desa Senggreng" className="w-7 h-7 object-contain shrink-0" />
          <p className="font-bold text-green-700 text-sm truncate">SIG DESA SENGGRENG</p>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;