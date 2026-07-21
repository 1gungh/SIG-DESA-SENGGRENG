import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaImage,
  FaCog,
  FaMapMarkerAlt,
  FaTimes,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

import {
  createBerita,
  updateBerita,
  getBeritaById,
  getKategoriBerita,
  uploadFotoBerita,
  deleteFotoBerita,
  setFotoUtamaBerita,
} from "../../services/beritaService";

// Pilihan ukuran font sederhana. Nilai 1-7 mengikuti standar execCommand("fontSize").
const UKURAN_FONT = [
  { label: "Kecil", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Sedang", value: "4" },
  { label: "Besar", value: "5" },
  { label: "Sangat Besar", value: "6" },
];

// Toolbar ringan untuk editor isi berita. Memakai document.execCommand
// (masih didukung luas di semua browser modern) supaya tidak perlu
// menambah dependency besar seperti CKEditor.
function ToolbarEditor({ onCommand, ukuranAktif, onUkuranChange, onAlign }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand("bold")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Tebal"
      >
        <FaBold size={12} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand("italic")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Miring"
      >
        <FaItalic size={12} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand("underline")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Garis Bawah"
      >
        <FaUnderline size={12} />
      </button>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand("insertUnorderedList")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Daftar Poin"
      >
        <FaListUl size={12} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand("insertOrderedList")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Daftar Angka"
      >
        <FaListOl size={12} />
      </button>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAlign("kiri")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Rata Kiri"
      >
        <FaAlignLeft size={12} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAlign("tengah")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Rata Tengah"
      >
        <FaAlignCenter size={12} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAlign("kanan")}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        title="Rata Kanan"
      >
        <FaAlignRight size={12} />
      </button>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <select
        value={ukuranAktif}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => onUkuranChange(e.target.value)}
        className="border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-600 bg-white cursor-pointer"
        title="Ukuran Font"
      >
        {UKURAN_FONT.map((u) => (
          <option key={u.value} value={u.value}>{u.label}</option>
        ))}
      </select>
    </div>
  );
}

function buatSlug(judul) {
  return judul
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function InputBerita() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [kategoriList, setKategoriList] = useState([]); // dari Supabase: [{id, nama}]
  const [kategoriId, setKategoriId] = useState("");
  const [tanggal, setTanggal] = useState("");

  // Foto baru yang mau diupload (belum ada di database)
  const [gambarFiles, setGambarFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  // Foto yang sudah tersimpan di database (mode edit)
  const [fotoLama, setFotoLama] = useState([]);
  const [fotoHapusLoading, setFotoHapusLoading] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [ukuranFont, setUkuranFont] = useState("3");
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  // Ambil daftar kategori berita dari Supabase
  useEffect(() => {
    const muatKategori = async () => {
      try {
        const data = await getKategoriBerita();
        setKategoriList(data);
        // if (data.length > 0 && !isEdit) {
        //   setKategoriId(data[0].id);
        // }
      } catch (err) {
        console.error("Gagal memuat kategori berita:", err);
      }
    };
    muatKategori();
  }, [isEdit]);

  // Ambil data existing (mode edit)
  useEffect(() => {
    if (!isEdit) return;

    const muatData = async () => {
      setLoadingData(true);
      try {
        const data = await getBeritaById(id);

        setJudul(data.judul || "");
        setKategoriId(data.kategori_id || "");
        setTanggal(data.tanggal_publikasi || "");

        if (editorRef.current) {
          editorRef.current.innerHTML = data.isi || "";
        }
        setIsi(data.isi || "");

        if (data.berita_foto?.length > 0) {
          setFotoLama([...data.berita_foto].sort((a, b) => a.urutan - b.urutan));
        }
      } catch (err) {
        alert("Gagal memuat data berita: " + err.message);
        navigate("/admin/berita/list-berita");
      } finally {
        setLoadingData(false);
      }
    };

    muatData();
  }, [id, isEdit, navigate]);

  // Selalu simpan posisi kursor/seleksi TERAKHIR yang masih di dalam editor.
  useEffect(() => {
    const simpanSeleksi = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    };
    document.addEventListener("selectionchange", simpanSeleksi);
    return () => document.removeEventListener("selectionchange", simpanSeleksi);
  }, []);

  const pulihkanSeleksi = () => {
    editorRef.current?.focus();
    const range = savedRangeRef.current;
    if (!range) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const jalankanPerintah = (perintah) => {
    pulihkanSeleksi();
    document.execCommand(perintah, false, null);
    setIsi(editorRef.current?.innerHTML || "");
  };

  const ubahUkuranFont = (value) => {
    setUkuranFont(value);
    pulihkanSeleksi();
    document.execCommand("fontSize", false, value);
    setIsi(editorRef.current?.innerHTML || "");
  };

  const aturPerataanTeks = (jenis) => {
    pulihkanSeleksi();
    const perintah = jenis === "kiri" ? "justifyLeft" : jenis === "kanan" ? "justifyRight" : "justifyCenter";
    document.execCommand(perintah, false, null);
    setIsi(editorRef.current?.innerHTML || "");
  };

  const handleIsiChange = () => {
    setIsi(editorRef.current?.innerHTML || "");
  };

  // Bersihkan memori blob URL galeri saat komponen unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const prosesFileGambar = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const hanyaGambar = fileArray.filter((file) => file.type.startsWith("image/"));

    if (hanyaGambar.length === 0) {
      alert("Mohon masukkan berkas berformat gambar saja.");
      return;
    }

    setGambarFiles((prev) => [...prev, ...hanyaGambar]);
    const urlBaru = hanyaGambar.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urlBaru]);
  };

  const handleGambarChange = (e) => {
    prosesFileGambar(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    prosesFileGambar(e.dataTransfer.files);
  };

  const hapusGambarBaru = (indexHapus) => {
    setGambarFiles((prev) => prev.filter((_, idx) => idx !== indexHapus));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[indexHapus]);
      return prev.filter((_, idx) => idx !== indexHapus);
    });
  };

  // ---------- FOTO LAMA (mode edit) ----------
  const hapusFotoLama = async (foto) => {
    if (!confirm("Hapus foto ini secara permanen?")) return;
    setFotoHapusLoading(foto.id);
    try {
      await deleteFotoBerita(foto.id, foto.url);
      setFotoLama((prev) => prev.filter((f) => f.id !== foto.id));
    } catch (err) {
      alert("Gagal menghapus foto: " + err.message);
    } finally {
      setFotoHapusLoading(null);
    }
  };

  const jadikanUtama = async (foto) => {
    try {
      await setFotoUtamaBerita(id, foto.id);
      setFotoLama((prev) => prev.map((f) => ({ ...f, is_utama: f.id === foto.id })));
    } catch (err) {
      alert("Gagal mengubah foto utama: " + err.message);
    }
  };

  const totalFoto = fotoLama.length + gambarFiles.length;

  const handleSubmit = async (statusBerita) => {
    if (!judul || !isi || totalFoto === 0) {
      alert("Judul, isi berita, dan minimal satu foto wajib diisi.");
      return;
    }
    if (!kategoriId) {
      alert("Kategori berita wajib dipilih.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        judul,
        slug: buatSlug(judul),
        kategori_id: kategoriId,
        isi,
        status: statusBerita, // 'draft' | 'terbit'
        tanggal_publikasi: tanggal || new Date().toISOString().split("T")[0],
      };

      let beritaId;

      if (isEdit) {
        await updateBerita(id, payload);
        beritaId = id;
      } else {
        const created = await createBerita(payload);
        beritaId = created.id;
      }

      // Upload foto baru — foto lama yang sudah ada di database tidak disentuh di sini
      if (gambarFiles.length > 0) {
        const sudahAdaFotoUtama = fotoLama.some((f) => f.is_utama);
        for (let i = 0; i < gambarFiles.length; i++) {
          const isUtama = !sudahAdaFotoUtama && i === 0;
          const urutan = fotoLama.length + i + 1;
          await uploadFotoBerita(beritaId, gambarFiles[i], isUtama, urutan);
        }
      }

      alert(statusBerita === "terbit" ? "Berita berhasil dipublikasikan." : "Berita disimpan sebagai draft.");
      navigate("/admin/berita/list-berita");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan berita: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const CARD_STATIC_STYLE = "bg-white rounded-2xl p-5 shadow-sm border border-gray-100";

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#F5FBF1] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat data berita...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FBF1] p-6 text-gray-800">
      <div className="max-w-6xl mx-auto">

        {/* HEADER UTAMA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Berita" : "Data Berita"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 bg-white disabled:opacity-50 transition-colors"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("terbit")}
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-green-700 hover:bg-green-800 text-white disabled:opacity-50 shadow-sm transition-colors"
            >
              {loading ? "Menyimpan..." : "Publikasikan"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* KOLOM KIRI (Konten Utama) */}
          <div className="flex flex-col gap-5 min-w-0">

            <div className={CARD_STATIC_STYLE}>
              <label className="text-sm font-semibold text-gray-800 mb-2 block">
                Judul Berita
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan judul berita yang menarik..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors break-words"
              />
            </div>

            <div className={CARD_STATIC_STYLE}>
              <label className="text-sm font-semibold text-gray-800 mb-2 block">
                Isi Berita Lengkap
              </label>

              <ToolbarEditor
                onCommand={jalankanPerintah}
                ukuranAktif={ukuranFont}
                onUkuranChange={ubahUkuranFont}
                onAlign={aturPerataanTeks}
              />

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleIsiChange}
                data-placeholder="Tulis isi berita lengkap di sini..."
                className="w-full min-h-[280px] border border-gray-200 rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors break-words overflow-y-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
              />
              <p className="text-[11px] text-gray-400 mt-2">
                Pilih (blok) teks lalu gunakan tombol rata kiri/tengah/kanan untuk mengatur perataan paragraf.
              </p>
            </div>
          </div>

          {/* KOLOM KANAN (Sidebar Pengaturan & Galeri) */}
          <div className="flex flex-col gap-5">

            <div className={CARD_STATIC_STYLE}>
              <div className="flex items-center gap-2 mb-4">
                <FaCog className="text-gray-400 text-sm" />
                <p className="text-sm font-semibold text-gray-800">Pengaturan</p>
              </div>

              <label className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5 block">
                KATEGORI BERITA
              </label>
              <select
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white transition-colors cursor-pointer"
              >
                <option value="">Pilih Kategori</option>
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>

              <label className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5 block">
                TANGGAL PUBLIKASI
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors cursor-pointer"
              />
            </div>

            <div className={CARD_STATIC_STYLE}>
              <div className="flex items-center gap-2 mb-4">
                <FaImage className="text-gray-400 text-sm" />
                <p className="text-sm font-semibold text-gray-800">Galeri Foto Berita</p>
                <span className="text-xs text-gray-400 ml-auto">{totalFoto} foto</span>
              </div>

              {/* Grid foto lama (sudah tersimpan, mode edit) + foto baru (preview lokal) */}
              {(fotoLama.length > 0 || previewUrls.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {fotoLama.map((f) => (
                    <div
                      key={f.id}
                      className="relative w-[calc(33.33%-6px)] aspect-square rounded-lg overflow-hidden group border border-gray-100 shrink-0"
                    >
                      <img src={f.url} alt="Foto berita" className="w-full h-full object-cover" />

                      {f.is_utama && (
                        <span className="absolute -top-1 -left-1 bg-yellow-400 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                          <FaStar className="text-[9px]" />
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => hapusFotoLama(f)}
                        disabled={fotoHapusLoading === f.id}
                        className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                      >
                        <FaTimes />
                      </button>

                      {!f.is_utama && (
                        <button
                          type="button"
                          onClick={() => jadikanUtama(f)}
                          title="Jadikan foto utama"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaRegStar className="text-white text-lg" />
                        </button>
                      )}
                    </div>
                  ))}

                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative w-[calc(33.33%-6px)] aspect-square rounded-lg overflow-hidden group border border-gray-100 shrink-0">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/50 text-white py-0.5">
                        Baru
                      </span>
                      <button
                        type="button"
                        onClick={() => hapusGambarBaru(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-red-700 shadow-sm transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label
                htmlFor="multi-drop-zone"
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl h-28 cursor-pointer hover:border-green-400 hover:bg-green-50/40 transition-colors overflow-hidden bg-gray-50"
              >
                <FaImage className="text-gray-300 text-xl" />
                <span className="text-[11px] text-gray-500 text-center px-4 pointer-events-none">
                  Tambah / Seret foto-foto ke sini
                </span>
                <input
                  id="multi-drop-zone"
                  type="file"
                  accept="image/*"
                  onChange={handleGambarChange}
                  className="hidden"
                  multiple
                />
              </label>
              <p className="text-[11px] text-gray-400 mt-2">
                Mendukung banyak file secara bersamaan (Maks. 2MB per gambar).
              </p>

              {isEdit && (
                <p className="text-[11px] text-gray-400 mt-2">
                  Arahkan kursor ke foto untuk menjadikannya foto utama.
                </p>
              )}
            </div>

            <div className="bg-green-50 rounded-2xl p-4 shadow-sm border border-green-100">
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-green-700 text-sm mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    Tips Penulisan
                  </p>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Sertakan informasi spasial (lokasi) dalam konten berita Anda
                    untuk memudahkan warga memahami konteks pembangunan desa.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default InputBerita;