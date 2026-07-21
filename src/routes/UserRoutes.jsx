import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Beranda from "../pages/user/Beranda";
import Peta from "../pages/user/peta";
import Kategori from "../pages/user/Kategori";
import Tentang from "../pages/user/Tentang";
import DetailPotensi from "../pages/user/DetailPotensi";
import DetailBerita from "../pages/user/DetailBerita";

const UserRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/" element={<Beranda />} />
    <Route path="/peta" element={<Peta />} />
    <Route path="/kategori" element={<Kategori />} />
    <Route path="/tentang" element={<Tentang />} />
    <Route path="/potensi/:id" element={<DetailPotensi />} />
    <Route path="/berita/:id" element={<DetailBerita />} />
  </Route>
);

export default UserRoutes;