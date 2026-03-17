import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { dashboardNavigationSections } from "../../data/dashboardModules";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  return (
    <>
      <div className={`dashboard-sidebar-backdrop${isOpen ? " is-visible" : ""}`} onClick={onClose} />
      <aside className={`dashboard-sidebar-minimal${isOpen ? " is-open" : ""}`}>
        <div className="dashboard-sidebar-minimal__header">
          <div>
            <p className="dashboard-sidebar-minimal__eyebrow">Dashboard</p>
            <h2>{isAdmin ? "Panel admin" : "Panel"}</h2>
          </div>
          <button className="dashboard-sidebar-minimal__close" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>

        <div className="dashboard-sidebar-minimal__profile">
          <strong>{user?.nombre || "Usuario"}</strong>
          <span>{user?.correo || user?.usuario || "Sesion activa"}</span>
          <small>{user?.roleName || user?.tipoUsuario || "Cliente"}</small>
        </div>

        {dashboardNavigationSections.map((section) => (
          <div key={section.title} className="dashboard-sidebar-minimal__section">
            <p>{section.title}</p>
            <nav>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => `dashboard-sidebar-minimal__link${isActive ? " is-active" : ""}`}
                  end={item.to === "/dashboard"}
                  onClick={onClose}
                  to={item.to}
                  title={item.table ? `${item.label} (${item.table})` : item.label}
                >
                  <strong>{item.label}</strong>
                  {item.hint ? <span>{item.hint}</span> : null}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
