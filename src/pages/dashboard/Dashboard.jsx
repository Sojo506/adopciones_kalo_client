import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHome from "./DashboardHome";
import DashboardPlaceholder from "./DashboardPlaceholder";
import UsersDashboard from "./UsersDashboard";
import UserFormPage from "./UserFormPage";

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <main className="dashboard-layout">
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <section className="dashboard-layout__content">
        <header className="dashboard-topbar">
          <button
            aria-expanded={menuOpen}
            className="dashboard-topbar__toggle"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            {menuOpen ? "Ocultar menu" : "Mostrar menu"}
          </button>
          <div>
            <p className="dashboard-topbar__label">Centro administrativo</p>
          </div>
        </header>

        <div className="dashboard-layout__body">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="usuarios" element={<UsersDashboard />} />
            <Route path="usuarios/nuevo" element={<UserFormPage />} />
            <Route path="usuarios/:identificacion/editar" element={<UserFormPage />} />
            <Route path="*" element={<DashboardPlaceholder />} />
          </Routes>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
