import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaArrowLeft } from "react-icons/fa";
import logo from "../../assets/images/logo-desa.png";
import { useAuth } from "../../context/AuthContext";

function LoginAdmin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State untuk form input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email/Username dan Kata Sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);

      if (result.success) {
        navigate("/admin/dashboard");
      } else {
        setError(result.message || "Email atau password salah.");
      }
    } catch (err) {
      console.error("Login gagal:", err);
      setError("Terjadi kesalahan saat mencoba login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#E6F4EA] to-[#F5FBF1] flex flex-col items-center justify-center p-4 relative">

      {/* CARD FORM LOGIN */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-sm hover:shadow-md transition-shadow">

        {/* Konten Atas / Logo & Judul */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="Logo Desa Senggreng"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Masuk Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola Potensi Desa Senggreng</p>
        </div>

        {/* PESAN ERROR */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
            {error}
          </div>
        )}

        {/* FORM INPUT */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          {/* Input Email / Username */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Email / Username
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-3 hover:border-gray-300 focus-within:ring-2 focus-within:ring-green-600 focus-within:border-transparent transition-all bg-white">
              <FaUser className="text-green-600 text-sm shrink-0 mr-3" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Input Kata Sandi */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600 block">
                Kata Sandi
              </label>
              <NavLink
                to="/lupa-sandi"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Lupa Sandi?
              </NavLink>
            </div>
            <div className="flex items-center border border-gray-200 rounded-xl px-3.5 py-3 hover:border-gray-300 focus-within:ring-2 focus-within:ring-green-600 focus-within:border-transparent transition-all bg-white">
              <FaLock className="text-green-600 text-sm shrink-0 mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-2"
              >
                {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>

          {/* Checkbox Ingat Saya */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-600 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs font-medium text-gray-500 cursor-pointer select-none">
              Ingat saya
            </label>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#046A38] hover:bg-[#03522B] text-white font-semibold text-sm py-3 rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 transition-all mt-3"
          >
            {loading ? "Menghubungkan..." : "Masuk"}
            {!loading && <FaSignInAlt className="text-xs" />}
          </button>
        </form>

        {/* Divider Garis Tipis */}
        <hr className="border-gray-100 my-6" />

        {/* Footer Hak Cipta */}
        <div className="text-center text-[10px] text-gray-400 font-medium leading-relaxed">
          <p>Pemerintah Desa Senggreng</p>
          <p>© 2026 SIG Potensi Desa</p>
        </div>

      </div>
    </div>
  );
}

export default LoginAdmin;