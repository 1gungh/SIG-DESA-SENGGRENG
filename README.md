# 🗺️ SIG Desa Senggreng

<p align="center">
  <strong>Sistem Informasi Geografis Potensi Desa Senggreng</strong>
</p>

<p align="center">
  Platform WebGIS untuk memetakan, mengelola, dan memperkenalkan berbagai potensi serta fasilitas yang terdapat di Desa Senggreng.
</p>

<p align="center">
  <a href="https://sigsenggreng.com">
    🌐 Live Website
  </a>
  •
  <a href="https://github.com/1gungh/SIG-DESA-SENGGRENG">
    💻 Source Code
  </a>
</p>

---

## 📌 Tentang Project

**SIG Desa Senggreng** merupakan aplikasi **Sistem Informasi Geografis (SIG) berbasis web** yang dikembangkan untuk membantu masyarakat dalam memperoleh informasi mengenai berbagai potensi, fasilitas, dan lokasi penting yang terdapat di Desa Senggreng.

Website ini menggabungkan teknologi **WebGIS** dengan sistem pengelolaan data sehingga informasi mengenai lokasi dapat ditampilkan secara interaktif melalui peta.

Project ini dikembangkan dalam kegiatan **UM Belajar Bersama Masyarakat (UM BBM) Universitas Negeri Malang** dengan tujuan mendukung proses digitalisasi informasi dan potensi Desa Senggreng.

---

## 🎯 Tujuan

Project ini dikembangkan dengan beberapa tujuan utama:

- Membantu masyarakat menemukan berbagai potensi dan fasilitas desa.
- Menyediakan informasi lokasi melalui peta interaktif.
- Mendigitalisasi data potensi Desa Senggreng.
- Membantu perangkat desa dalam mengelola data lokasi.
- Meningkatkan akses informasi mengenai potensi dan fasilitas desa.
- Mendukung promosi potensi lokal melalui platform digital.

---

## ✨ Fitur Utama

### 🗺️ Peta Interaktif

Menampilkan berbagai lokasi potensi dan fasilitas Desa Senggreng dalam bentuk peta interaktif.

### 📍 Informasi Lokasi

Setiap lokasi dapat menampilkan informasi seperti:

- Nama lokasi
- Kategori
- Alamat
- Deskripsi
- Foto
- Informasi pemilik
- Kontak WhatsApp
- Koordinat lokasi

### 🔎 Pencarian Lokasi

Pengguna dapat mencari lokasi berdasarkan nama atau informasi yang tersedia.

### 🏷️ Filter Kategori

Data lokasi dapat difilter berdasarkan kategori sehingga pengguna lebih mudah menemukan informasi yang dibutuhkan.

### 📱 Responsive Design

Website dirancang agar dapat digunakan pada berbagai ukuran layar, baik:

- Desktop
- Laptop
- Tablet
- Smartphone

### 👨‍💼 Dashboard Admin

Menyediakan halaman administrasi untuk membantu pengelolaan data yang ditampilkan pada website.

### 📊 Pengelolaan Data Potensi

Admin dapat mengelola informasi lokasi dan data potensi desa.

### 📰 Manajemen Berita

Menyediakan fitur untuk mengelola dan menampilkan informasi atau berita mengenai kegiatan serta perkembangan desa.

### 📍 Penentuan Lokasi

Admin dapat menentukan lokasi menggunakan koordinat latitude dan longitude serta memanfaatkan lokasi perangkat.

---

## 📂 Kategori Data

Data yang ditampilkan dalam sistem mencakup beberapa kategori:

| Kategori | Deskripsi |
|---|---|
| 🏪 UMKM | Usaha mikro, kecil, dan menengah |
| 🕌 Tempat Ibadah | Masjid, gereja, dan tempat ibadah lainnya |
| 🏫 Sarana Pendidikan | Sekolah dan fasilitas pendidikan |
| 🏥 Fasilitas Kesehatan | Fasilitas pelayanan kesehatan |
| 🔧 Bengkel | Bengkel kendaraan |
| 🧺 Laundry | Usaha jasa laundry |
| ⚽ Sarana Olahraga | Lapangan dan fasilitas olahraga |
| 🎨 Sanggar Kesenian | Sanggar dan kegiatan kesenian |
| 🛒 Minimarket | Minimarket dan pusat kebutuhan sehari-hari |

---

## 🛠️ Teknologi yang Digunakan

### Frontend

- **React** — Library JavaScript untuk membangun antarmuka pengguna.
- **Vite** — Build tool dan development server.
- **Tailwind CSS** — Framework CSS untuk membangun antarmuka yang responsive.
- **React Leaflet** — Integrasi peta Leaflet dengan React.

### Backend & Database

- **Supabase** — Backend-as-a-Service.
- **PostgreSQL** — Database relasional.
- **PostGIS** — Ekstensi PostgreSQL untuk pengelolaan data geografis.
- **Supabase Storage** — Penyimpanan file dan gambar.
- **Supabase Authentication** — Sistem autentikasi pengguna/admin.

### GIS & Data

- **Leaflet** — Library JavaScript untuk peta interaktif.
- **GeoJSON** — Format data geografis.
- **QGIS** — Pengolahan dan visualisasi data geospasial.

### Development Tools

- **Git**
- **GitHub**
- **Visual Studio Code**
- **Node.js**
- **npm**

---

## 🏗️ Arsitektur Sistem

Secara umum, sistem menggunakan arsitektur sebagai berikut:

```text
                    ┌─────────────────────┐
                    │       User          │
                    │  Desktop / Mobile   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      React          │
                    │      + Vite         │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
      │   Leaflet   │   │   Website   │   │   Admin     │
      │     Map     │   │    Pages    │   │  Dashboard  │
      └─────────────┘   └─────────────┘   └──────┬──────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────┐
                                      │      Supabase       │
                                      ├─────────────────────┤
                                      │    PostgreSQL       │
                                      │      PostGIS        │
                                      │      Storage        │
                                      │  Authentication     │
                                      └─────────────────────┘
