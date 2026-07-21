import { Routes } from "react-router-dom";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {UserRoutes}
      {AdminRoutes}
    </Routes>
  );
}