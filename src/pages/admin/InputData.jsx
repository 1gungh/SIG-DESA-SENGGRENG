import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaInfoCircle,
  FaAddressBook,
  FaUtensils,
  FaImages,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaPlus,
  FaTrash,
  FaCloudUploadAlt,
  FaClock,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

// IMPORT SERVICES
import {
  createLokasi,
  updateLokasi,
  getLokasiById,
  uploadFotoLokasi,
  deleteFotoLokasi,
  setFotoUtamaLokasi,
  createProdukLokasi,
  replaceProdukLokasi,
  createJamOperasionalLokasi,
  replaceJamOperasionalLokasi,
} from "../../services/lokasiService";

const KATEGORI_LIST = [
  "Semua",
  "UMKM",
  "Tempat Ibadah",
  "Sarana Pendidikan",
  "Fasilitas Kesehatan",
  "Bengkel",
  "Laundry",
  "Sarana Olahraga",
  "Sanggar Kesenian",
  "Minimarket",
];
const center = [-8.160956530474579, 112.51604637427506];

const DUSUN = [
  "Dusun Krajan",
  "Dusun Ngrancah",
  "Dusun Kecopokan",
];

const DAFTAR_HARI = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu"
];

function LokasiPicker({ posisi, onPilih }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      onPilih([e.latlng.lat, e.latlng.lng]);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onPilih([latLng.lat, latLng.lng]);
        }
      },
    }),
    [onPilih]
  );

  const icon = L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#16a34a;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid white;"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  return posisi ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={posisi}
      icon={icon}
      ref={markerRef}
    />
  ) : null;
}

function InputData() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // ---------- STATE FORM ----------
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pemilik, setPemilik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [dusun, setDusun] = useState("");
  const [produk, setProduk] = useState([{ nama: "", harga: "" }]);

  const [jamOperasional, setJamOperasional] = useState([
    {
      hari: { mulai: "Senin", selesai: "Jumat" },
      jam: {
        buka: { h: 8, m: 0 },
        tutup: { h: 17, m: 0 }
      }
    }
  ]);

  // Foto baru yang mau diupload (belum ada di database)
  const [fotoList, setFotoList] = useState([]);
  // Foto yang sudah tersimpan di database (mode edit)
  const [fotoLama, setFotoLama] = useState([]);
  const [fotoHapusLoading, setFotoHapusLoading] = useState(null); // id foto yang sedang dihapus

  const [posisi, setPosisi] = useState(center);
  const [tampilDiPeta, setTampilDiPeta] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const [latInput, setLatInput] = useState(center[0].toString());
  const [lngInput, setLngInput] = useState(center[1].toString());

  // ---------- AMBIL DATA EXISTING (MODE EDIT) ----------
  useEffect(() => {
    if (!isEdit) return;

    const muatData = async () => {
      setLoadingData(true);
      try {
        const data = await getLokasiById(id);

        setNama(data.nama || "");
        setKategori(data.kategori_potensi?.nama || "");
        setDeskripsi(data.deskripsi || "");
        setWhatsapp(data.whatsapp || "");
        setPemilik(data.nama_pemilik || "");
        setAlamat(data.alamat_lengkap || "");
        setDusun(data.dusun?.nama || "");
        setTampilDiPeta(data.tampil_di_peta ?? true);

        if (data.latitude && data.longitude) {
          const pos = [data.latitude, data.longitude];
          setPosisi(pos);
          setLatInput(pos[0].toString());
          setLngInput(pos[1].toString());
        }

        if (data.lokasi_produk?.length > 0) {
          setProduk(
            [...data.lokasi_produk]
              .sort((a, b) => a.urutan - b.urutan)
              .map((p) => ({ nama: p.nama_produk, harga: p.harga ?? "" }))
          );
        }

        if (data.lokasi_jam_operasional?.length > 0) {
          setJamOperasional(
            [...data.lokasi_jam_operasional]
              .sort((a, b) => a.urutan - b.urutan)
              .map((jo) => ({
                hari: { mulai: jo.hari_mulai, selesai: jo.hari_selesai },
                jam: {
                  buka: {
                    h: parseInt(jo.jam_buka.split(":")[0], 10),
                    m: parseInt(jo.jam_buka.split(":")[1], 10),
                  },
                  tutup: {
                    h: parseInt(jo.jam_tutup.split(":")[0], 10),
                    m: parseInt(jo.jam_tutup.split(":")[1], 10),
                  },
                },
              }))
          );
        }

        if (data.lokasi_foto?.length > 0) {
          setFotoLama([...data.lokasi_foto].sort((a, b) => a.urutan - b.urutan));
        }
      } catch (err) {
        alert("Gagal memuat data lokasi: " + err.message);
        navigate("/admin/data/list-data");
      } finally {
        setLoadingData(false);
      }
    };

    muatData();
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (posisi) {
      setLatInput(posisi[0].toString());
      setLngInput(posisi[1].toString());
    }
  }, [posisi]);

  const handleLatChange = (val) => {
    setLatInput(val);
    const lat = parseFloat(val);
    if (!isNaN(lat)) {
      setPosisi([lat, posisi[1]]);
    }
  };

  const handleLngChange = (val) => {
    setLngInput(val);
    const lng = parseFloat(val);
    if (!isNaN(lng)) {
      setPosisi([posisi[0], lng]);
    }
  };

  // ---------- PRODUK ----------
  const tambahProduk = () => setProduk((prev) => [...prev, { nama: "", harga: "" }]);
  const hapusProduk = (index) => setProduk((prev) => prev.filter((_, i) => i !== index));
  const updateProduk = (index, field, value) =>
    setProduk((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  // ---------- JAM OPERASIONAL ----------
  const tambahJamOperasional = () => {
    setJamOperasional((prev) => [
      ...prev,
      {
        hari: { mulai: "Senin", selesai: "Minggu" },
        jam: { buka: { h: 0, m: 0 }, tutup: { h: 0, m: 0 } }
      }
    ]);
  };
  const hapusJamOperasional = (index) => setJamOperasional((prev) => prev.filter((_, i) => i !== index));
  const updateJamOperasional = (index, field, value) => {
    setJamOperasional((prev) =>
      prev.map((jo, i) => {
        if (i !== index) return jo;

        if (field.startsWith("hari.")) {
          const dayType = field.split(".")[1];
          return { ...jo, hari: { ...jo.hari, [dayType]: value } };
        }

        const [type, timeUnit] = field.split(".");
        let parsedVal = parseInt(value, 10);

        if (isNaN(parsedVal)) parsedVal = 0;
        if (timeUnit === "h" && parsedVal > 23) parsedVal = 23;
        if (timeUnit === "m" && parsedVal > 59) parsedVal = 59;
        if (parsedVal < 0) parsedVal = 0;

        return {
          ...jo,
          jam: {
            ...jo.jam,
            [type]: {
              ...jo.jam[type],
              [timeUnit]: parsedVal
            }
          }
        };
      })
    );
  };

  const formatDuaDigit = (num) => String(num).padStart(2, "0");

  // ---------- FOTO BARU (belum diupload) ----------
  const totalFoto = fotoLama.length + fotoList.length;

  const handleFotoChange = (e) => {
    const sisaSlot = 5 - totalFoto;
    const files = Array.from(e.target.files || []).slice(0, sisaSlot);
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setFotoList((prev) => [...prev, ...previews].slice(0, sisaSlot >= 0 ? undefined : 0));
    e.target.value = ""; // supaya bisa pilih file yang sama lagi kalau perlu
  };

  const hapusFotoBaru = (index) => setFotoList((prev) => prev.filter((_, i) => i !== index));

  // ---------- FOTO LAMA (sudah ada di database, mode edit) ----------
  const hapusFotoLama = async (foto) => {
    if (!confirm("Hapus foto ini secara permanen?")) return;
    setFotoHapusLoading(foto.id);
    try {
      await deleteFotoLokasi(foto.id, foto.url);
      setFotoLama((prev) => prev.filter((f) => f.id !== foto.id));
    } catch (err) {
      alert("Gagal menghapus foto: " + err.message);
    } finally {
      setFotoHapusLoading(null);
    }
  };

  const jadikanUtama = async (foto) => {
    try {
      await setFotoUtamaLokasi(id, foto.id);
      setFotoLama((prev) => prev.map((f) => ({ ...f, is_utama: f.id === foto.id })));
    } catch (err) {
      alert("Gagal mengubah foto utama: " + err.message);
    }
  };

  const gunakanLokasiSaya = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di perangkat ini.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosisi([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.")
    );
  };

  const handleBatal = () => navigate("/admin/data/list-data");

  // =============== FUNGSI SUBMIT KE SUPABASE ===============
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!nama || !kategori || !alamat) {
      alert("Nama lokasi, kategori, dan alamat wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama: nama,
        kategori_id: kategori, // dikirim sebagai String (misal "UMKM"), dikonversi jadi UUID di service
        deskripsi: deskripsi,
        whatsapp: whatsapp,
        nama_pemilik: pemilik,
        dusun_id: dusun, // dikirim sebagai String, dikonversi jadi UUID di service
        alamat_lengkap: alamat,
        latitude: posisi[0] ? Number(posisi[0]) : null,
        longitude: posisi[1] ? Number(posisi[1]) : null,
        tampil_di_peta: tampilDiPeta,
        status: "aktif",
      };

      let lokasiId;

      if (isEdit) {
        await updateLokasi(id, payload);
        lokasiId = id;
      } else {
        const createdLokasi = await createLokasi(payload);
        lokasiId = createdLokasi.id;
      }

      // Upload foto baru (foto lama yang sudah ada di database tidak disentuh di sini,
      // penghapusan/perubahan foto utama untuk foto lama sudah langsung diproses saat diklik)
      if (fotoList.length > 0) {
        const sudahAdaFotoUtama = fotoLama.some((f) => f.is_utama);
        for (let i = 0; i < fotoList.length; i++) {
          const isUtama = !sudahAdaFotoUtama && i === 0;
          const urutan = fotoLama.length + i + 1;
          await uploadFotoLokasi(lokasiId, fotoList[i].file, isUtama, urutan);
        }
      }

      // Produk & Jam Operasional
      const produkValid = produk.filter((p) => p.nama.trim() !== "");

      if (isEdit) {
        await replaceProdukLokasi(lokasiId, produkValid);
        await replaceJamOperasionalLokasi(lokasiId, jamOperasional);
      } else {
        if (produkValid.length > 0) {
          await createProdukLokasi(lokasiId, produkValid);
        }
        if (jamOperasional.length > 0) {
          await createJamOperasionalLokasi(lokasiId, jamOperasional);
        }
      }

      alert(isEdit ? "Data lokasi berhasil diperbarui!" : "Data lokasi dan galeri foto berhasil disimpan!");
      navigate("/admin/data/list-data");
    } catch (err) {
      console.error("Terjadi error:", err);
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#F5FBF1] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat data lokasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FBF1] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Lokasi" : "Tambah Lokasi Baru"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBatal}
              className="px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors bg-white"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-green-700 hover:bg-green-800 hover:shadow-md disabled:opacity-50 text-white transition-all"
            >
              <FaMapMarkerAlt className="text-xs" />
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Lokasi"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* KOLOM KIRI */}
          <div className="flex flex-col gap-5">
            {/* Informasi Dasar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <FaInfoCircle className="text-gray-400 text-sm" />
                <p className="text-sm font-semibold text-gray-800">Informasi Dasar</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Nama Lokasi / Unit Usaha
                  </label>
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Kripik Tempe Mak"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Kategori Potensi
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white transition-colors cursor-pointer"
                  >
                    <option value="">Pilih Kategori</option>
                    {KATEGORI_LIST.filter((k) => k !== "Semua").map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Deskripsi Singkat
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan secara singkat mengenai potensi lokasi ini..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none transition-colors"
                />
              </div>
            </div>

            {/* Kontak & Alamat */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <FaAddressBook className="text-gray-400 text-sm" />
                <p className="text-sm font-semibold text-gray-800">Kontak & Alamat</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    WhatsApp / Telepon
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 focus-within:ring-2 focus-within:ring-green-600 transition-colors">
                    <span className="px-3 text-sm text-gray-500 bg-gray-50 h-full flex items-center border-r border-gray-200">
                      +62
                    </span>
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="81234567890"
                      className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Nama Pemilik / CP
                  </label>
                  <input
                    value={pemilik}
                    onChange={(e) => setPemilik(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Dusun
                  </label>
                  <select
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  >
                    <option value="">Pilih Dusun</option>
                    {DUSUN.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Alamat Lengkap
                  </label>
                  <input
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Jalan, RT/RW..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Produk & Menu */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <FaUtensils className="text-gray-400 text-sm" />
                <p className="text-sm font-semibold text-gray-800">Produk & Menu</p>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                {produk.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={p.nama}
                      onChange={(e) => updateProduk(i, "nama", e.target.value)}
                      placeholder="Nama Produk"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                    />
                    <input
                      value={p.harga}
                      onChange={(e) => updateProduk(i, "harga", e.target.value)}
                      placeholder="Harga"
                      className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                    />
                    <button
                      onClick={() => hapusProduk(i)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={tambahProduk}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 rounded-lg py-2.5 text-sm text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50/40 transition-colors"
              >
                <FaPlus className="text-xs" />
                Tambah Item Baru
              </button>
            </div>

            {/* Jam Operasional */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <FaClock className="text-gray-400 text-sm" />
                <p className="text-sm font-semibold text-gray-800">Jam Operasional</p>
              </div>

              <div className="flex flex-col gap-3">
                {jamOperasional.map((jo, i) => (
                  <div key={i} className="flex flex-col lg:flex-row lg:items-center gap-2 border-b border-gray-100 pb-3 lg:border-none lg:pb-0">
                    <div className="flex flex-1 items-center gap-1.5">
                      <select
                        value={jo.hari.mulai}
                        onChange={(e) => updateJamOperasional(i, "hari.mulai", e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors cursor-pointer"
                      >
                        {DAFTAR_HARI.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>

                      <span className="text-xs text-gray-400 font-medium shrink-0">s/d</span>

                      <select
                        value={jo.hari.selesai}
                        onChange={(e) => updateJamOperasional(i, "hari.selesai", e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors cursor-pointer"
                      >
                        {DAFTAR_HARI.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-200 self-start lg:self-auto">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={formatDuaDigit(jo.jam.buka.h)}
                        onChange={(e) => updateJamOperasional(i, "buka.h", e.target.value)}
                        className="w-10 text-center bg-transparent text-sm font-semibold focus:outline-none"
                        placeholder="00"
                      />
                      <span>:</span>

                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formatDuaDigit(jo.jam.buka.m)}
                        onChange={(e) => updateJamOperasional(i, "buka.m", e.target.value)}
                        className="w-10 text-center bg-transparent text-sm font-semibold focus:outline-none"
                        placeholder="00"
                      />

                      <span className="mx-2 text-gray-400 text-xs font-medium">s/d</span>

                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={formatDuaDigit(jo.jam.tutup.h)}
                        onChange={(e) => updateJamOperasional(i, "tutup.h", e.target.value)}
                        className="w-10 text-center bg-transparent text-sm font-semibold focus:outline-none"
                        placeholder="00"
                      />
                      <span>:</span>

                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formatDuaDigit(jo.jam.tutup.m)}
                        onChange={(e) => updateJamOperasional(i, "tutup.m", e.target.value)}
                        className="w-10 text-center bg-transparent text-sm font-semibold focus:outline-none"
                        placeholder="00"
                      />
                    </div>

                    <button
                      onClick={() => hapusJamOperasional(i)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 self-end lg:self-auto"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={tambahJamOperasional}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 rounded-lg py-2.5 text-sm text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50/40 transition-colors mt-3"
              >
                <FaPlus className="text-xs" />
                Tambah Hari Operasional
              </button>
            </div>

            {/* Galeri Foto */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                <FaImages className="text-green-700 text-sm" />
                <p className="text-sm font-semibold text-gray-800">Galeri Foto</p>
                <span className="text-xs text-gray-400 ml-auto">{totalFoto}/5</span>
              </div>

              {totalFoto < 5 && (
                <label className="w-full flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-colors bg-[#F4F9F1] py-6 px-4 text-center mb-4">
                  <FaCloudUploadAlt className="text-green-700 text-3xl mb-1" />
                  <span className="text-xs font-semibold text-gray-800">Klik atau seret foto ke sini</span>
                  <span className="text-[10px] text-gray-500">Maksimal 5 foto, ukuran per file maks 2MB (JPG/PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                {/* Foto lama (sudah tersimpan di database, mode edit) */}
                {fotoLama.map((f) => (
                  <div key={f.id} className="relative w-16 h-16 rounded-xl border border-gray-200 shrink-0 bg-gray-50 group">
                    <img src={f.url} alt="Foto lokasi" className="w-full h-full object-cover rounded-xl" />

                    {f.is_utama && (
                      <span className="absolute -top-1.5 -left-1.5 bg-yellow-400 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                        <FaStar className="text-[9px]" />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => hapusFotoLama(f)}
                      disabled={fotoHapusLoading === f.id}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors border border-white disabled:opacity-50"
                    >
                      <span className="text-[10px] font-bold leading-none">✕</span>
                    </button>

                    {!f.is_utama && (
                      <button
                        type="button"
                        onClick={() => jadikanUtama(f)}
                        title="Jadikan foto utama"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"
                      >
                        <FaRegStar className="text-white text-lg" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Foto baru (belum diupload, preview lokal) */}
                {fotoList.map((f, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl border border-gray-200 shrink-0 bg-gray-50">
                    <img src={f.url} alt={`Foto baru ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                    <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/50 text-white rounded-b-xl py-0.5">
                      Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => hapusFotoBaru(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors border border-white"
                    >
                      <span className="text-[10px] font-bold leading-none">✕</span>
                    </button>
                  </div>
                ))}

                {totalFoto < 5 && (
                  <label className="w-16 h-16 flex items-center justify-center border border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/40 transition-colors bg-[#E2ECE0] text-gray-600 shrink-0">
                    <span className="text-base font-medium">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {isEdit && (
                <p className="text-[11px] text-gray-400 mt-3">
                  Arahkan kursor ke foto untuk menjadikannya foto utama. Foto ditandai bintang kuning = foto utama saat ini.
                </p>
              )}
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="flex flex-col gap-5">
            {/* Titik Koordinat */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400 text-sm" />
                  <p className="text-sm font-semibold text-gray-800">Titik Koordinat</p>
                </div>
                <button
                  onClick={gunakanLokasiSaya}
                  className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium transition-colors"
                >
                  <FaLocationArrow className="text-[10px]" />
                  Gunakan Lokasi Saya
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-100 mb-3">
                <MapContainer
                  center={posisi}
                  zoom={15}
                  style={{ height: "220px", width: "100%" }}
                  key={posisi.join(",")}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LokasiPicker posisi={posisi} onPilih={setPosisi} />
                </MapContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg px-3 py-1.5 border border-transparent focus-within:border-green-600 focus-within:bg-white transition-colors">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wide block">Latitude</label>
                  <input
                    type="text"
                    value={latInput}
                    onChange={(e) => handleLatChange(e.target.value)}
                    placeholder="-8.184"
                    className="w-full bg-transparent text-xs font-semibold text-gray-800 focus:outline-none"
                  />
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-1.5 border border-transparent focus-within:border-green-600 focus-within:bg-white transition-colors">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wide block">Longitude</label>
                  <input
                    type="text"
                    value={lngInput}
                    onChange={(e) => handleLngChange(e.target.value)}
                    placeholder="112.47"
                    className="w-full bg-transparent text-xs font-semibold text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Geser/klik peta atau ketik koordinat secara manual di kotak atas untuk menempatkan pin tepat di lokasi.
              </p>
            </div>

            {/* Toggle tampil di peta publik */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <button
                type="button"
                onClick={() => setTampilDiPeta(!tampilDiPeta)}
                className="w-full flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Tampilkan di Peta Publik</p>
                  <p className="text-xs text-gray-400 mt-0.5">Lokasi akan langsung terlihat oleh warga</p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ml-3 ${
                    tampilDiPeta ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${
                      tampilDiPeta ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputData;