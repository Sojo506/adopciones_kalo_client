import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import AccountsDashboard from "./AccountsDashboard";
import AccountFormPage from "./AccountFormPage";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHome from "./DashboardHome";
import DashboardPlaceholder from "./DashboardPlaceholder";
import EmailFormPage from "./EmailFormPage";
import EmailsDashboard from "./EmailsDashboard";
import OtpFormPage from "./OtpFormPage";
import OtpsDashboard from "./OtpsDashboard";
import PhoneFormPage from "./PhoneFormPage";
import PhonesDashboard from "./PhonesDashboard";
import UserTypeFormPage from "./UserTypeFormPage";
import UserTypesDashboard from "./UserTypesDashboard";
import UsersDashboard from "./UsersDashboard";
import UserFormPage from "./UserFormPage";

const Dashboard = () => {
  const [menuOpenPath, setMenuOpenPath] = useState(null);
  const location = useLocation();
  const menuOpen = menuOpenPath === location.pathname;

  const closeMenu = () => setMenuOpenPath(null);
  const toggleMenu = () => {
    setMenuOpenPath((currentPath) => (currentPath === location.pathname ? null : location.pathname));
  };

  return (
    <main className="dashboard-layout">
      <Sidebar isOpen={menuOpen} onClose={closeMenu} />

      <section className="dashboard-layout__content">
        <header className="dashboard-topbar">
          <button
            aria-expanded={menuOpen}
            className="dashboard-topbar__toggle"
            onClick={toggleMenu}
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
            <Route path="tipos-usuario" element={<UserTypesDashboard />} />
            <Route path="tipos-usuario/nuevo" element={<UserTypeFormPage />} />
            <Route path="tipos-usuario/:idTipoUsuario/editar" element={<UserTypeFormPage />} />
            <Route path="correos" element={<EmailsDashboard />} />
            <Route path="correos/nuevo" element={<EmailFormPage />} />
            <Route path="correos/:identificacion/:correo/editar" element={<EmailFormPage />} />
            <Route path="telefonos" element={<PhonesDashboard />} />
            <Route path="telefonos/nuevo" element={<PhoneFormPage />} />
            <Route path="telefonos/:identificacion/:telefono/editar" element={<PhoneFormPage />} />
            <Route path="cuentas" element={<AccountsDashboard />} />
            <Route path="cuentas/nuevo" element={<AccountFormPage />} />
            <Route path="cuentas/:idCuenta/editar" element={<AccountFormPage />} />
            <Route path="codigos-otp" element={<OtpsDashboard />} />
            <Route path="codigos-otp/nuevo" element={<OtpFormPage />} />
            <Route path="codigos-otp/:idCodigoOtp/editar" element={<OtpFormPage />} />
            <Route path="*" element={<DashboardPlaceholder />} />
          </Routes>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
