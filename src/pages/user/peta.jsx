import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { FaMapMarkedAlt, FaWhatsapp, FaTimes, FaUser, FaSlidersH } from "react-icons/fa";
import { getLokasiPeta } from "../../services/lokasiService";

const center = [-8.184, 112.47];

const KATEGORI = [
  { key: "umkm", label: "UMKM", icon: "🍜", color: "#f97316" },
  { key: "tempat-ibadah", label: "Tempat Ibadah", icon: "🕌", color: "#0ea5e9" },
  { key: "sarana-pendidikan", label: "Sarana Pendidikan", icon: "🏫", color: "#2563eb" },
  { key: "fasilitas-kesehatan", label: "Fasilitas Kesehatan", icon: "🏥", color: "#ef4444" },
  { key: "bengkel", label: "Bengkel", icon: "🔧", color: "#78716c" },
  { key: "laundry", label: "Laundry", icon: "🧺", color: "#06b6d4" },
  { key: "sarana-olahraga", label: "Sarana Olahraga", icon: "⚽", color: "#16a34a" },
  { key: "sanggar-kesenian", label: "Sanggar Kesenian", icon: "🎭", color: "#a855f7" },
  { key: "minimarket", label: "Minimarket", icon: "🛒", color: "#eab308" },
];

const BASEMAP = {
  jalan: {
    label: "Peta Jalan",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  satelit: {
    label: "Satelit",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    labelOverlay:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  },
  topografi: {
    label: "Topografi",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap contributors",
  },
};

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
  if (meter < 1000) return Math.round(meter) + "m";
  return (meter / 1000).toFixed(1) + "km";
}

function formatRupiah(angka) {
  if (angka == null) return "";
  if (angka >= 1000) return "Rp " + Math.round(angka / 1000) + "k";
  return "Rp " + angka;
}

function buatIcon(poi) {
  const kat = KATEGORI.find((k) => k.key === poi.kategori);
  const color = kat ? kat.color : "#ef4444";
  const emoji = kat ? kat.icon : "📍";

  return L.divIcon({
    className: "",
    html:
      '<div style="display:flex;align-items:center;gap:6px;transform:translate(-16px,-16px);white-space:nowrap;">' +
      '<div style="width:32px;height:32px;border-radius:50%;background:' +
      color +
      ';display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;flex-shrink:0;">' +
      emoji +
      "</div>" +
      '<div style="background:white;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600;color:#1f2937;box-shadow:0 1px 4px rgba(0,0,0,0.25);">' +
      poi.nama +
      "</div>" +
      "</div>",
    iconSize: [0, 0],
  });
}

function PanTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position);
  }, [position, map]);
  return null;
}

function FitBoundsToPolygon({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [positions, map]);
  return null;
}

function PanelDetailPOI({ poi, onClose, onLihatDetail }) {
  if (!poi) return null;

  const kat = KATEGORI.find((k) => k.key === poi.kategori);
  const punyaHarga = poi.hargaMin != null || poi.hargaMax != null;
  const mapsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + poi.lat + "," + poi.lng;
  const waUrl = poi.whatsapp
    ? "https://wa.me/" +
      poi.whatsapp +
      "?text=" +
      encodeURIComponent("Halo, saya lihat " + poi.nama + " di SIG Desa Senggreng")
    : null;

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-[340px] bg-white shadow-xl z-[1000] overflow-y-auto">
      <div className="relative w-full h-44 bg-gray-900">
        {poi.gambar ? (
          <img src={poi.gambar} alt={poi.nama} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: kat ? kat.color : "#9ca3af" }}
          >
            {kat ? kat.icon : "📍"}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-3">{poi.nama}</h2>

        {poi.deskripsi && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{poi.deskripsi}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {poi.jam && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Operasional</p>
              <p className="text-sm font-semibold text-gray-900">{poi.jam}</p>
            </div>
          )}
          {punyaHarga && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Kisaran Harga</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatRupiah(poi.hargaMin)} - {formatRupiah(poi.hargaMax)}
              </p>
            </div>
          )}
        </div>

        {poi.pemilik && (
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
            <FaUser className="text-gray-400 text-xs" />
            <span>Pemilik: {poi.pemilik}</span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
          <button
            onClick={() => onLihatDetail(poi)}
            className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
          >
            Detail
          </button>
          <div className="flex gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 border border-green-600 text-green-700 hover:bg-green-50 text-sm font-medium py-2.5 rounded-full transition-colors"
            >
              <FaMapMarkedAlt className="text-xs" />
              Petunjuk Arah
            </a>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
              >
                <FaWhatsapp className="text-sm" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Isi filter (pencarian + kategori + daftar lokasi terdekat) — dipakai bersama
// oleh sidebar desktop dan panel geser mobile, supaya logicnya tidak dobel.
function FilterContent({
  gpsError,
  searchTerm,
  setSearchTerm,
  activeKategori,
  pilihKategori,
  loadingPoi,
  errorPoi,
  filteredPOI,
  selectedPOI,
  handlePilihPOI,
}) {
  return (
    <>
      <h2 className="font-bold text-gray-900 text-lg mb-1">Filter Wilayah</h2>
      <p className="text-sm text-gray-500 mb-4">Eksplorasi Potensi Desa</p>

      {gpsError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-800">
          <p className="font-semibold mb-1">📍 Akses Lokasi Belum Aktif</p>
          <p>Mohon aktifkan GPS atau izinkan akses lokasi di browser Anda agar jarak terhitung secara akurat dari posisi Anda.</p>
        </div>
      )}

      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Cari UMKM atau Wisata..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-2">Kategori Potensi</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {KATEGORI.map((k) => {
          const active = activeKategori.includes(k.key);
          return (
            <button
              key={k.key}
              onClick={() => pilihKategori(k.key)}
              className={
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition " +
                (active
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")
              }
            >
              <span>{k.icon}</span> {k.label}
            </button>
          );
        })}
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-3">Daftar Lokasi Terdekat</h3>

      {loadingPoi && <p className="text-sm text-gray-400">Memuat data lokasi...</p>}
      {!loadingPoi && errorPoi && <p className="text-sm text-red-500">{errorPoi}</p>}

      {!loadingPoi && !errorPoi && (
        <div className="flex flex-col gap-3">
          {filteredPOI.length === 0 && (
            <p className="text-sm text-gray-400">Tidak ada lokasi ditemukan atau pilih kategori.</p>
          )}
          {filteredPOI.slice(0, 5).map((poi) => (
            <div
              key={poi.id}
              onClick={() => handlePilihPOI(poi)}
              className={
                "flex gap-3 items-center bg-white rounded-xl p-3 border transition cursor-pointer " +
                (selectedPOI && selectedPOI.id === poi.id
                  ? "border-green-600 shadow-sm"
                  : "border-gray-100 hover:shadow-sm")
              }
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                {poi.gambar ? (
                  <img src={poi.gambar} alt={poi.nama} className="w-full h-full object-cover" />
                ) : (
                  KATEGORI.find((k) => k.key === poi.kategori)?.icon
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{poi.nama}</p>
                <p className="text-xs text-gray-500">
                  {KATEGORI.find((k) => k.key === poi.kategori)?.label} - {formatJarak(poi.jarakMeter)} dari sini
                </p>
                {poi.jam && <p className="text-xs text-green-700">Buka ({poi.jam})</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Peta() {
  const navigate = useNavigate();
  const [batasDesa, setBatasDesa] = useState(null);
  const [poiList, setPoiList] = useState([]);
  const [loadingPoi, setLoadingPoi] = useState(true);
  const [errorPoi, setErrorPoi] = useState(null);

  const [activeKategori, setActiveKategori] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [gpsError, setGpsError] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [activeBasemap, setActiveBasemap] = useState("jalan");

  // Panel filter geser dari bawah, khusus tampilan mobile
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const muatPoi = async () => {
      setLoadingPoi(true);
      setErrorPoi(null);
      try {
        const data = await getLokasiPeta();
        setPoiList(data);
      } catch (err) {
        console.error("Gagal memuat data peta:", err);
        setErrorPoi("Gagal memuat data lokasi.");
      } finally {
        setLoadingPoi(false);
      }
    };
    muatPoi();
  }, []);

  useEffect(() => {
    axios
      .get("/batas_desa.geojson")
      .then((res) => {
        const geometry = res.data.features[0].geometry;
        let coords;

        if (geometry.type === "Polygon") {
          coords = geometry.coordinates[0];
        } else if (geometry.type === "MultiPolygon") {
          coords = geometry.coordinates[0][0];
        } else {
          console.warn("Tipe geometry tidak didukung:", geometry.type);
          return;
        }

        const path = coords
          .map(([lng, lat]) => [lat, lng])
          .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

        setBatasDesa(path);
      })
      .catch((err) => console.error("Gagal load batas desa:", err));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError(true);
      setUserLocation({ lat: center[0], lng: center[1] });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(false);
      },
      (err) => {
        console.warn("Gagal ambil lokasi user:", err.message);
        setGpsError(true);
        setUserLocation({ lat: center[0], lng: center[1] });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const pilihKategori = (key) => {
    setActiveKategori((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const filteredPOI = useMemo(() => {
    const acuan = userLocation || { lat: center[0], lng: center[1] };

    return poiList
      .filter((p) => activeKategori.includes(p.kategori))
      .filter((p) => p.nama.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((p) => ({
        ...p,
        jarakMeter: hitungJarak(acuan.lat, acuan.lng, p.lat, p.lng),
      }))
      .sort((a, b) => a.jarakMeter - b.jarakMeter);
  }, [poiList, activeKategori, searchTerm, userLocation]);

  const visibleIds = useMemo(() => new Set(filteredPOI.map((p) => p.id)), [filteredPOI]);

  const handlePilihPOI = useCallback((poi) => {
    setSelectedPOI(poi);
    setMobileFilterOpen(false);
  }, []);

  const handleLihatDetail = useCallback(
    (poi) => {
      navigate(`/potensi/${poi.id}`);
    },
    [navigate]
  );

  const basemapAktif = BASEMAP[activeBasemap];

  const filterProps = {
    gpsError,
    searchTerm,
    setSearchTerm,
    activeKategori,
    pilihKategori,
    loadingPoi,
    errorPoi,
    filteredPOI,
    selectedPOI,
    handlePilihPOI,
  };

  return (
    <div className="flex h-[calc(100vh-72px)] relative">
      {/* SIDEBAR DESKTOP — tidak diubah sama sekali dari versi sebelumnya */}
      <aside className="w-[400px] shrink-0 bg-green-50 border-r border-green-100 overflow-y-auto p-5 hidden md:block">
        <FilterContent {...filterProps} />
      </aside>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute top-3 right-3 z-[999] bg-white rounded-xl shadow-md border border-gray-200 p-1 flex gap-1">
          {Object.entries(BASEMAP).map(([key, bm]) => (
            <button
              key={key}
              onClick={() => setActiveBasemap(key)}
              className={
                "px-3 py-1.5 rounded-lg text-xs font-medium transition " +
                (activeBasemap === key ? "bg-green-700 text-white" : "text-gray-600 hover:bg-gray-100")
              }
            >
              {bm.label}
            </button>
          ))}
        </div>

        <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer key={activeBasemap} attribution={basemapAktif.attribution} url={basemapAktif.url} />

          {basemapAktif.labelOverlay && (
            <TileLayer attribution="Labels &copy; Esri" url={basemapAktif.labelOverlay} />
          )}

          {batasDesa && batasDesa.length > 0 && (
            <>
              <Polygon positions={batasDesa} pathOptions={{ color: "#FFFF00", weight: 4, fillOpacity: 0 }} />
              <FitBoundsToPolygon positions={batasDesa} />
            </>
          )}

          {poiList
            .filter((poi) => visibleIds.has(poi.id))
            .map((poi) => (
              <Marker
                key={poi.id}
                position={[poi.lat, poi.lng]}
                icon={buatIcon(poi)}
                eventHandlers={{ click: () => handlePilihPOI(poi) }}
              />
            ))}

          {selectedPOI && <PanTo position={[selectedPOI.lat, selectedPOI.lng]} />}
        </MapContainer>

        <PanelDetailPOI poi={selectedPOI} onClose={() => setSelectedPOI(null)} onLihatDetail={handleLihatDetail} />

        {/* TOMBOL FILTER MENGAMBANG — khusus mobile, sidebar desktop tetap tersembunyi di layar kecil */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-[998] flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium pl-4 pr-5 py-3 rounded-full shadow-lg transition-colors"
        >
          <FaSlidersH className="text-xs" />
          Filter & Lokasi
          {activeKategori.length > 0 && (
            <span className="bg-white text-green-700 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeKategori.length}
            </span>
          )}
        </button>
      </div>

      {/* PANEL FILTER MOBILE — geser dari bawah, overlay gelap di belakangnya */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-[1100] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-green-50 rounded-t-2xl max-h-[80vh] overflow-y-auto p-5 pb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-2 sticky top-0 bg-green-50 -mx-5 px-5 pt-1 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full absolute left-1/2 -translate-x-1/2 top-0" />
              <span />
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-gray-700 shadow-sm"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
            <FilterContent {...filterProps} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Peta;