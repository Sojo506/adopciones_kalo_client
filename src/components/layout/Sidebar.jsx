import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { dashboardNavigationSections } from "../../data/dashboardModules";

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  return (
    <aside className="col-12 col-lg-3 col-xl-3 mb-4">
      <div className="dashboard-sidebar">
        <div className="dashboard-sidebar__top">
          <span className="dashboard-sidebar__eyebrow">Centro de control</span>
          <h3>{isAdmin ? "Modulos del sistema" : "Panel operativo"}</h3>
          <p>
            {user?.nombre ? `${user.nombre}, ` : ""}
            {isAdmin
              ? "aqui tienes el mapa funcional preparado segun el esquema actual de la base de datos."
              : "aqui puedes consultar las areas principales habilitadas dentro del sistema."}
          </p>
        </div>

        {dashboardNavigationSections.map((section) => (
          <div key={section.title} className="dashboard-sidebar__section">
            <span className="dashboard-sidebar__label">{section.title}</span>
            <nav className="dashboard-nav">
              {section.items.map((item) => (
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
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
