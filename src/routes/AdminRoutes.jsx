import { Route } from "react-router-dom";
import AuthGuard from "../layouts/AuthGuard";
import AdminLayout from "../layouts/AdminLayout";
import LoginAdmin from "../pages/admin/LoginAdmin";
import Dashboard from "../pages/admin/Dashboard";
import ListData from "../pages/admin/ListData";
import InputData from "../pages/admin/InputData";
import ListBerita from "../pages/admin/ListBerita";
import InputBerita from "../pages/admin/InputBerita";
import Pengaturan from "../pages/admin/Pengaturan";

const AdminRoutes = (
  <Route path="/admin">
    {/* Login TIDAK dibungkus AuthGuard */}
    <Route path="login" element={<LoginAdmin />} />

    {/* SEMUA route di bawah ini WAJIB login */}
    <Route
      element={
        <AuthGuard>
          <AdminLayout />
        </AuthGuard>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="data/input-data" element={<InputData />} />
      <Route path="data/edit-data/:id" element={<InputData />} />
      <Route path="data/list-data" element={<ListData />} />
      <Route path="berita/input-berita" element={<InputBerita />} />
      <Route path="berita/edit-berita/:id" element={<InputBerita />} />
      <Route path="berita/list-berita" element={<ListBerita />} />
      <Route path="pengaturan" element={<Pengaturan />} />
    </Route>
  </Route>
);

export default AdminRoutes;