import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  dashboardNavigationSections,
  findDashboardNavigationItem,
} from "../../data/dashboardModules";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    const activeSectionTitle = findDashboardNavigationItem(location.pathname)?.sectionTitle || null;

    if (activeSectionTitle) {
      setOpenSection(activeSectionTitle);
    }
  }, [location.pathname]);

  const toggleSection = (sectionTitle) => {
    setOpenSection((prev) => (prev === sectionTitle ? null : sectionTitle));
  };

  const displayName =
    [user?.nombre, user?.apellidoPaterno].filter(Boolean).join(" ") ||
    user?.usuario ||
    "Usuario";
  const displayRole = user?.roleName || user?.tipoUsuario || "Sesion activa";

  return (
    <>
      <div
        className={`dashboard-sidebar-backdrop${isOpen ? " is-visible" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`dashboard-sidebar-minimal${isOpen ? " is-open" : ""}`}
        aria-label="Navegacion del dashboard"
      >
        <div className="dashboard-sidebar-minimal__header">
          <div>
            <p className="dashboard-sidebar-minimal__eyebrow">Dashboard</p>
            <h2>{isAdmin ? "Panel admin" : "Panel"}</h2>
          </div>

          <button
            className="dashboard-sidebar-minimal__close"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>

        <div className="dashboard-sidebar-minimal__profile">
          <strong>{displayName}</strong>
          <span>{user?.correo || user?.usuario || "Sesion activa"}</span>
          <small>{displayRole}</small>
        </div>

        <div className="dashboard-sidebar-minimal__accordion">
          {dashboardNavigationSections.map((section, index) => {
            const isSectionOpen = openSection === section.title;
            const sectionId = `section-${index}`;

            return (
              <div key={section.title} className="dashboard-sidebar-minimal__section">
                <button
                  type="button"
                  className={`dashboard-sidebar-minimal__section-toggle${isSectionOpen ? " is-open" : ""
                    }`}
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={isSectionOpen}
                  aria-controls={sectionId}
                >
                  <span>{section.title}</span>
                  <span className="dashboard-sidebar-minimal__section-icon">
                    {isSectionOpen ? "−" : "+"}
                  </span>
                </button>

                <div
                  id={sectionId}
                  className={`dashboard-sidebar-minimal__section-content${isSectionOpen ? " is-open" : ""
                    }`}
                >
                  <nav>
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        className={({ isActive }) =>
                          `dashboard-sidebar-minimal__link${isActive ? " is-active" : ""}`
                        }
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
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
