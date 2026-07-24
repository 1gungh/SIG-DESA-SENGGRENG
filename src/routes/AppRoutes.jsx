import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import InputData from "../pages/admin/InputData";
import ListData from "../pages/admin/ListData";

// 1. Buat komponen ScrollToTop
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Fungsi ini akan dijalankan setiap kali 'pathname' berubah
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function AppRoutes() {
  return (
    // 2. Bungkus dengan Fragment (<> </>) karena kita mereturn lebih dari 1 elemen
    <>
      <ScrollToTop />
      
      <Routes>
        <Route path="data/input-data" element={<InputData />} />
        <Route path="data/edit-data/:id" element={<InputData />} />
        <Route path="data/list-data" element={<ListData />} />
        {UserRoutes}
        {AdminRoutes}
      </Routes>
    </>
  );
}