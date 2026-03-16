import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const primaryModules = [
    { to: "/dashboard", label: "Resumen", hint: "Vista general" },
    { to: "/dashboard/usuarios", label: "Usuarios", hint: "Roles y accesos" },
    { to: "/dashboard/solicitudes", label: "Solicitudes", hint: "Entrantes y seguimiento" },
    { to: "/dashboard/adopciones", label: "Adopciones", hint: "Procesos activos" },
    { to: "/dashboard/reportes", label: "Reportes", hint: "Finanzas y metricas" },
  ];

  const secondaryModules = [
    { to: "/dashboard/perfil", label: "Perfil", hint: "Datos del administrador" },
    { to: "/dashboard/direcciones", label: "Direcciones", hint: "Ubicaciones y casas cuna" },
    { to: "/dashboard/auditoria", label: "Auditoria", hint: "Historial y trazabilidad" },
  ];

  return (
    <aside className="col-12 col-lg-3 col-xl-3 mb-4">
      <div className="dashboard-sidebar">
        <div className="dashboard-sidebar__top">
          <span className="dashboard-sidebar__eyebrow">Centro de control</span>
          <h3>{isAdmin ? "Panel administrativo" : "Portal del usuario"}</h3>
          <p>
            {user?.nombre ? `${user.nombre}, ` : ""}
            {isAdmin ? "gestiona los modulos principales del sistema." : "consulta tu informacion y actividad."}
          </p>
        </div>

        <div className="dashboard-sidebar__section">
          <span className="dashboard-sidebar__label">Operaciones</span>
          <nav className="dashboard-nav">
            {primaryModules.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) => `dashboard-nav__item${isActive ? " active" : ""}`}
                end={item.to === "/dashboard"}
                to={item.to}
              >
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="dashboard-sidebar__section">
          <span className="dashboard-sidebar__label">Gestion interna</span>
          <nav className="dashboard-nav">
            {secondaryModules.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) => `dashboard-nav__item${isActive ? " active" : ""}`}
                to={item.to}
              >
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
