import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// DIUBAH: import biasa -> React.lazy, supaya tiap halaman jadi chunk JS
// terpisah dan tidak semua ter-bundle dalam satu file besar (814 KB seperti
// hasil npm run build sebelumnya). Peta.jsx khususnya berat karena bawa
// library react-leaflet + leaflet.
const Beranda = lazy(() => import("../pages/user/Beranda"));
const Peta = lazy(() => import("../pages/user/peta"));
const Kategori = lazy(() => import("../pages/user/Kategori"));
const Tentang = lazy(() => import("../pages/user/Tentang"));
const DetailPotensi = lazy(() => import("../pages/user/DetailPotensi"));
const DetailBerita = lazy(() => import("../pages/user/DetailBerita"));

// Tampilan loading sederhana selagi chunk halaman diunduh.
function LoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-gray-400 text-sm">
      Memuat halaman...
    </div>
  );
}

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const UserRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/" element={withSuspense(Beranda)} />
    <Route path="/peta" element={withSuspense(Peta)} />
    <Route path="/kategori" element={withSuspense(Kategori)} />
    <Route path="/tentang" element={withSuspense(Tentang)} />
    <Route path="/potensi/:kategoriSlug/:lokasiSlug" element={withSuspense(DetailPotensi)} />
    <Route path="/berita/:slug" element={withSuspense(DetailBerita)} />
  </Route>
);

export default UserRoutes;