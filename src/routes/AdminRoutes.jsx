import { lazy, Suspense } from "react";
import { Route, Navigate } from "react-router-dom";
import AuthGuard from "../layouts/AuthGuard";
import AdminLayout from "../layouts/AdminLayout";

// DIUBAH: import biasa -> React.lazy, supaya kode halaman admin (Dashboard,
// InputData, ListData, dll) tidak ikut ter-bundle ke index.js utama yang
// diunduh SEMUA pengunjung publik. Ini penyebab index.js masih 714 KB.
const LoginAdmin = lazy(() => import("../pages/admin/LoginAdmin"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ListData = lazy(() => import("../pages/admin/ListData"));
const InputData = lazy(() => import("../pages/admin/InputData"));
const ListBerita = lazy(() => import("../pages/admin/ListBerita"));
const InputBerita = lazy(() => import("../pages/admin/InputBerita"));
const Pengaturan = lazy(() => import("../pages/admin/Pengaturan"));

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

const AdminRoutes = (
  <Route path="/admin">
    {/* /admin polos otomatis diarahkan ke /admin/login */}
    <Route index element={<Navigate to="/admin/login" replace />} />

    {/* Login TIDAK dibungkus AuthGuard */}
    <Route path="login" element={withSuspense(LoginAdmin)} />

    {/* SEMUA route di bawah ini WAJIB login */}
    <Route
      element={
        <AuthGuard>
          <AdminLayout />
        </AuthGuard>
      }
    >
      <Route path="dashboard" element={withSuspense(Dashboard)} />
      <Route path="data/input-data" element={withSuspense(InputData)} />
      <Route path="data/edit-data/:id" element={withSuspense(InputData)} />
      <Route path="data/list-data" element={withSuspense(ListData)} />
      <Route path="berita/input-berita" element={withSuspense(InputBerita)} />
      <Route path="berita/edit-berita/:id" element={withSuspense(InputBerita)} />
      <Route path="berita/list-berita" element={withSuspense(ListBerita)} />
      <Route path="pengaturan" element={withSuspense(Pengaturan)} />
    </Route>
  </Route>
);

export default AdminRoutes;