import { useEffect } from "react";
import { dashboardNavigationCount } from "../../data/dashboardModules";
import { useAuth } from "../../hooks/useAuth";

const DashboardHome = () => {
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    document.title = "Dashboard | Adopciones Kalö";
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Resumen</p>
          <h1>{isAdmin ? "Panel administrativo" : "Panel operativo"}</h1>
          <p className="dashboard-page__lede">
            Una vista limpia para moverte entre modulos reales del sistema sin ruido visual.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <p className="dashboard-page__eyebrow">Sesion actual</p>
          <h2>{user?.nombre || "Usuario"}</h2>
          <p className="dashboard-muted">{user?.correo || user?.usuario || "Sin correo"}</p>
          <div className="dashboard-tags">
            <span>{user?.roleName || user?.tipoUsuario || "Cliente"}</span>
            <span>{user?.identificacion || "Sin identificacion"}</span>
          </div>
        </article>

        <article className="dashboard-card">
          <p className="dashboard-page__eyebrow">Navegacion</p>
          <h2>{dashboardNavigationCount} accesos</h2>
          <p className="dashboard-muted">
            Todas las tablas del esquema ya aparecen organizadas en la barra lateral para entrar a su CRUD.
          </p>
        </article>
      </section>
    </div>
  );
};

export default DashboardHome;
