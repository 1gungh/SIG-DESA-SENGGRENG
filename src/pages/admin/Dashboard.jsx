import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkedAlt,
  FaShoppingBag,
  FaGraduationCap,
  FaHeart,
  FaMapMarkerAlt,
  FaMinus,
} from "react-icons/fa";
import {
  getStatistikDashboard,
  getDistribusiDusun,
  getDataTerbaruLokasi,
} from "../../services/lokasiService"; // sesuaikan path

const LUAS_WILAYAH = "584,50"; // statis, belum ada tabel luas wilayah di DB

// Warna tetap per kategori, dipakai untuk bar & donut chart
const WARNA_KATEGORI = {
  "UMKM": "#f97316",
  "Tempat Ibadah": "#0ea5e9",
  "Sarana Pendidikan": "#2563eb",
  "Fasilitas Kesehatan": "#ef4444",
  "Bengkel": "#78716c",
  "Laundry": "#06b6d4",
  "Sarana Olahraga": "#16a34a",
  "Sanggar Kesenian": "#a855f7",
  "Minimarket": "#eab308",
};
const WARNA_DUSUN_PALET = ["#059669", "#2563eb", "#f59e0b", "#7c3aed", "#ef4444", "#0ea5e9", "#a855f7", "#9ca3af"];

function waktuRelatif(tanggalIso) {
  if (!tanggalIso) return "-";
  const detik = Math.floor((Date.now() - new Date(tanggalIso).getTime()) / 1000);
  if (detik < 60) return "Baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit yang lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam yang lalu`;
  const hari = Math.floor(jam / 24);
  if (hari === 1) return "Kemarin";
  if (hari < 7) return `${hari} hari yang lalu`;
  return new Date(tanggalIso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// Badge kecil di pojok kanan-atas tiap kartu statistik.
// Catatan: skema DB belum menyimpan data historis (snapshot bulan lalu),
// jadi persentase kenaikan tidak bisa dihitung — semua kartu ditampilkan "Stabil"
// sampai ada tabel snapshot statistik untuk perbandingan periode.
function BadgePerubahan() {
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
      <FaMinus className="text-[8px]" />
      Stabil
    </span>
  );
}

function KartuKomposisiEkonomi({ perKategori, total }) {
  const [hover, setHover] = useState(null);

  const data = useMemo(() => {
    return Object.entries(perKategori)
      .map(([label, jumlah]) => ({
        label,
        jumlah,
        persen: total > 0 ? Math.round((jumlah / total) * 1000) / 10 : 0,
        color: WARNA_KATEGORI[label] || "#9ca3af",
      }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [perKategori, total]);

  const maxSkala = useMemo(() => {
    const maxPersen = Math.max(10, ...data.map((d) => d.persen));
    return Math.ceil(maxPersen / 10) * 10;
  }, [data]);

  const stepSumbu = useMemo(() => {
    const step = maxSkala / 4;
    return [maxSkala, maxSkala - step, maxSkala - step * 2, maxSkala - step * 3, 0];
  }, [maxSkala]);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Komposisi Potensi per Kategori</p>
        <p className="text-xs text-gray-400 mt-4">Belum ada data lokasi aktif.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex-1 min-w-0">
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-900">Komposisi Potensi per Kategori</p>
        <p className="text-xs text-gray-400 mt-0.5">Distribusi lokasi aktif (% dari total {total} titik)</p>
      </div>

      <div className="flex gap-3 overflow-x-auto">
        <div className="flex flex-col justify-between text-[11px] text-gray-400 h-48 py-0.5 shrink-0">
          {stepSumbu.map((s) => (
            <span key={s}>{Math.round(s)}%</span>
          ))}
        </div>

        <div className="relative flex-1 h-48 min-w-[420px]">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {stepSumbu.map((s) => (
              <div key={s} className="border-t border-dashed border-gray-100" />
            ))}
          </div>

          <div className="relative h-full flex items-end justify-between gap-2 px-1">
            {data.map((d, i) => {
              const tinggiPersen = (d.persen / maxSkala) * 100;
              const sedangHover = hover === i;
              return (
                <div
                  key={d.label}
                  className="flex-1 h-full flex items-end justify-center relative"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {sedangHover && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
                      <p className="text-xs font-semibold text-gray-800">{d.label}</p>
                      <p className="text-xs text-gray-500">{d.jumlah} lokasi ({d.persen}%)</p>
                    </div>
                  )}
                  <div
                    className="w-8 rounded-t-md transition-colors"
                    style={{
                      height: `${tinggiPersen}%`,
                      backgroundColor: sedangHover ? "#d1d5db" : d.color,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-[11px] text-gray-500 mt-2 pl-8 min-w-[420px] overflow-x-auto">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center whitespace-nowrap px-1">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Diganti dari "Penggunaan Lahan" (tidak ada datanya di DB) menjadi
// "Distribusi per Dusun", karena data dusun memang ada dan riil.
function KartuDistribusiDusun({ perDusun, total }) {
  const data = useMemo(() => {
    return Object.entries(perDusun)
      .map(([label, jumlah], i) => ({
        label,
        jumlah,
        persen: total > 0 ? Math.round((jumlah / total) * 1000) / 10 : 0,
        color: WARNA_DUSUN_PALET[i % WARNA_DUSUN_PALET.length],
      }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [perDusun, total]);

  const gradientStops = useMemo(() => {
    let akumulasi = 0;
    return data
      .map((d) => {
        const awal = akumulasi;
        akumulasi += d.persen;
        return `${d.color} ${awal}% ${akumulasi}%`;
      })
      .join(", ");
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Distribusi per Dusun</p>
        <p className="text-xs text-gray-400 mt-4">Belum ada data lokasi aktif.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">Distribusi per Dusun</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">Total {total} titik potensi aktif</p>

      <div className="flex items-center gap-6">
        <div
          className="relative w-32 h-32 rounded-full shrink-0"
          style={{ background: `conic-gradient(${gradientStops})` }}
        >
          <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center">
            <p className="text-lg font-bold text-gray-900 leading-tight">{total}</p>
            <p className="text-[11px] text-gray-400">titik</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-32">
          {data.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                {d.label}
              </span>
              <span className="font-semibold text-gray-900">{d.persen}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [statistik, setStatistik] = useState({ total: 0, perKategori: {} });
  const [distribusiDusun, setDistribusiDusun] = useState({ total: 0, perDusun: {} });
  const [dataTerbaru, setDataTerbaru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function muatData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [stat, dusunData, terbaru] = await Promise.all([
          getStatistikDashboard(),
          getDistribusiDusun(),
          getDataTerbaruLokasi(5),
        ]);
        if (!mounted) return;
        setStatistik(stat);
        setDistribusiDusun(dusunData);
        setDataTerbaru(terbaru);
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
        if (mounted) setErrorMsg("Gagal memuat data dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    muatData();
    return () => {
      mounted = false;
    };
  }, []);

  const jumlahUmkm = statistik.perKategori["UMKM"] || 0;
  const jumlahPendidikan = statistik.perKategori["Sarana Pendidikan"] || 0;
  const jumlahKesehatan = statistik.perKategori["Fasilitas Kesehatan"] || 0;

  const kartuStatistik = [
    {
      label: "Luas Wilayah",
      nilai: LUAS_WILAYAH,
      satuan: "km²",
      icon: FaMapMarkedAlt,
      warnaIkon: "text-green-600",
      warnaBg: "bg-green-50",
    },
    {
      label: "Jumlah UMKM",
      nilai: String(jumlahUmkm),
      satuan: "unit",
      icon: FaShoppingBag,
      warnaIkon: "text-amber-500",
      warnaBg: "bg-amber-50",
    },
    {
      label: "Sarana Pendidikan",
      nilai: String(jumlahPendidikan),
      satuan: "unit",
      icon: FaGraduationCap,
      warnaIkon: "text-purple-500",
      warnaBg: "bg-purple-50",
    },
    {
      label: "Fasilitas Kesehatan",
      nilai: String(jumlahKesehatan),
      satuan: "unit",
      icon: FaHeart,
      warnaIkon: "text-rose-500",
      warnaBg: "bg-rose-50",
    },
    {
      label: "Titik Potensi",
      nilai: String(statistik.total),
      satuan: "titik",
      icon: FaMapMarkerAlt,
      warnaIkon: "text-sky-500",
      warnaBg: "bg-sky-50",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Ringkasan potensi Desa Senggreng</p>

      {loading && <p className="text-sm text-gray-400 mb-4">Memuat data dashboard...</p>}
      {!loading && errorMsg && <p className="text-sm text-red-500 mb-4">{errorMsg}</p>}

      {/* Kartu statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kartuStatistik.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${k.warnaBg} flex items-center justify-center`}>
                  <Icon className={`${k.warnaIkon} text-lg`} />
                </div>
                <BadgePerubahan />
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                {k.nilai}
                <span className="text-xs font-medium text-gray-400 ml-1">{k.satuan}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Komposisi per Kategori & Distribusi per Dusun */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <KartuKomposisiEkonomi perKategori={statistik.perKategori} total={statistik.total} />
        <KartuDistribusiDusun perDusun={distribusiDusun.perDusun} total={distribusiDusun.total} />
      </div>

      {/* Ringkasan data terbaru */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">Data Terbaru</p>
          <Link to="/admin/data/list-data" className="text-sm text-green-700 hover:underline">
            Lihat semua di List Data →
          </Link>
        </div>
        <div className="flex flex-col">
          {dataTerbaru.length === 0 && !loading && (
            <p className="text-sm text-gray-400 py-2">Belum ada data lokasi.</p>
          )}
          {dataTerbaru.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between py-2.5 ${
                i < dataTerbaru.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{item.nama}</p>
                <p className="text-xs text-gray-500">
                  {item.kategori_nama} · {item.dusun_nama || item.alamat_lengkap || "-"}
                </p>
              </div>
              <span className="text-xs text-gray-400">{waktuRelatif(item.updated_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;