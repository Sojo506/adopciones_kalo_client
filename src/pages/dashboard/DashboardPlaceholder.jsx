import { useMemo } from "react";
import { useLocation } from "react-router-dom";

const DashboardPlaceholder = () => {
  const location = useLocation();

  const sectionName = useMemo(() => {
    const slug = location.pathname.split("/").filter(Boolean).at(-1) || "dashboard";
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }, [location.pathname]);

  return (
    <div className="dashboard-page">
      <section className="dashboard-card">
        <p className="dashboard-page__eyebrow">Modulo en preparacion</p>
        <h2>{sectionName}</h2>
        <p className="dashboard-page__lede">
          Esta ruta ya existe dentro del panel y queda lista para conectarle su CRUD o vista
          operativa cuando continuemos con ese dominio.
        </p>
      </section>
    </div>
  );
};

export default DashboardPlaceholder;
