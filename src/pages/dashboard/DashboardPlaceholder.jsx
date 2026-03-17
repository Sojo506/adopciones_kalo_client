import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { findDashboardNavigationItem } from "../../data/dashboardModules";

const formatFallbackTitle = (pathname) => {
  const slug = pathname.split("/").filter(Boolean).at(-1) || "dashboard";

  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const DashboardPlaceholder = () => {
  const location = useLocation();
  const currentItem = findDashboardNavigationItem(location.pathname);
  const sectionName = currentItem?.label || formatFallbackTitle(location.pathname);

  useEffect(() => {
    document.title = `${sectionName} | Dashboard | Adopciones Kalö`;
  }, [sectionName]);

  return (
    <div className="dashboard-page">
      <section className="dashboard-card">
        <p className="dashboard-page__eyebrow">{currentItem?.sectionTitle || "Modulo en preparacion"}</p>
        <h2>{sectionName}</h2>
        <p className="dashboard-page__lede">
          {currentItem?.description ||
            "Esta ruta ya existe dentro del panel y queda lista para conectarle su CRUD o vista operativa cuando continuemos con ese dominio."}
        </p>
        {currentItem?.table ? (
          <div className="dashboard-tags">
            <span>{currentItem.table}</span>
            <span>CRUD listo para conectar</span>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default DashboardPlaceholder;
