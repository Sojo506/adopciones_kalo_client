import { useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { dashboardModuleGroups, dashboardNavigationSections, dashboardReadinessItems } from "../../data/dashboardModules";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const stats = [
    {
      value: String(dashboardNavigationSections.reduce((total, section) => total + section.items.length, 0)).padStart(2, "0"),
      label: "Modulos preparados",
      detail: "Navegacion inicial lista para usuarios, adopciones, inventario, ventas y finanzas",
    },
    {
      value: "47",
      label: "Tablas detectadas",
      detail: "El esquema actual deja suficiente base para preparar modulos reales por dominio",
    },
    {
      value: "06",
      label: "Bloques funcionales",
      detail: "Adopciones, bienestar, comercial, facturacion, donaciones y control",
    },
  ];

  const commandLines = [
    "Usuarios, cuentas y contactos listos para convertirse en modulo",
    "Perritos, eventos y casas cuna ya mapeados desde el esquema",
    "Ventas, facturas, donaciones e inventario preparados por dominio",
  ];

  useEffect(() => {
    document.title = "Dashboard | Adopciones Kalö";
  }, []);

  return (
    <main className="container py-4 py-lg-5">
      <div className="row g-4">
        <Sidebar />

        <section className="col-12 col-lg-9 col-xl-9">
          <div className="dashboard-shell">
            <section className="dashboard-hero">
              <div className="dashboard-hero__content">
                <span className="dashboard-hero__eyebrow">Arquitectura funcional</span>
                <h1>Dashboard preparado con modulos reales del sistema.</h1>
                <p>
                  {isAdmin
                    ? "Este panel ya no muestra bloques genericos. Ahora organiza los dominios funcionales reales que aparecen en scheme.sql para que luego podamos construir cada vista encima de una base clara."
                    : "Tu panel ya fue reorganizado para reflejar las areas reales del sistema, con una lectura mas clara y una estructura preparada para crecer."}
                </p>

                <div className="dashboard-command-strip">
                  {commandLines.map((line) => (
                    <div key={line} className="dashboard-command-strip__item">
                      <span />
                      <strong>{line}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-hero__meta">
                <div className="dashboard-role-card">
                  <span>Rol detectado</span>
                  <strong>{user?.roleName || user?.tipoUsuario || "Cliente"}</strong>
                  <p>
                    {isAdmin
                      ? "Acceso administrativo para preparar modulos operativos y comerciales."
                      : "Vista general disponible mientras se conectan las pantallas reales del sistema."}
                  </p>
                </div>
                <div className="dashboard-signal-card">
                  <span>Estado del panel</span>
                  <strong>Listo para crecer</strong>
                  <p>Los modulos ya tienen nombre, objetivo y relacion con tablas concretas; faltan solo sus vistas internas.</p>
                </div>
              </div>
            </section>

            <section className="dashboard-stats-grid">
              {stats.map((stat) => (
                <article key={stat.label} className="dashboard-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                  <p>{stat.detail}</p>
                </article>
              ))}
            </section>

            <section className="dashboard-content-grid">
              <div className="dashboard-main-column">
                <div className="dashboard-panel dashboard-panel--core">
                  <div className="dashboard-panel__header">
                    <div>
                      <span className="dashboard-panel__eyebrow">Mapa operativo</span>
                      <h2>Modulos funcionales preparados</h2>
                    </div>
                    <span className="dashboard-status-tag">Basado en scheme.sql</span>
                  </div>

                  <div className="dashboard-module-grid">
                    {dashboardModuleGroups.map((module) => (
                      <article key={module.title} className="dashboard-module-card">
                        <span className="dashboard-module-card__badge">{module.badge}</span>
                        <h3>{module.title}</h3>
                        <p>{module.description}</p>
                        <div className="dashboard-module-card__tables">
                          {module.tables.map((tableName) => (
                            <span key={tableName}>{tableName}</span>
                          ))}
                        </div>
                        <ul>
                          {module.modules.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="dashboard-panel">
                  <div className="dashboard-panel__header">
                    <div>
                      <span className="dashboard-panel__eyebrow">Contexto actual</span>
                      <h2>Perfil y alcance del panel</h2>
                    </div>
                  </div>

                  <div className="dashboard-user-card">
                    <div className="dashboard-user-card__row">
                      <span>Correo</span>
                      <strong>{user?.correo || user?.usuario || "-"}</strong>
                    </div>
                    <div className="dashboard-user-card__row">
                      <span>Identificacion</span>
                      <strong>{user?.identificacion || "-"}</strong>
                    </div>
                    <div className="dashboard-user-card__row">
                      <span>Alcance preparado</span>
                      <strong>Usuarios, perritos, inventario, ventas, donaciones y reportes</strong>
                    </div>
                    <div className="dashboard-user-card__row">
                      <span>Estado de construccion</span>
                      <strong>Modulos definidos sin vistas internas</strong>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="dashboard-side-column">
                <div className="dashboard-panel">
                  <div className="dashboard-panel__header">
                    <div>
                      <span className="dashboard-panel__eyebrow">Capas transversales</span>
                      <h2>Areas listas para conectar</h2>
                    </div>
                  </div>

                  <div className="dashboard-readiness-list">
                    {dashboardReadinessItems.map((module) => (
                      <article key={module.name} className="dashboard-readiness-item">
                        <div>
                          <h3>{module.name}</h3>
                          <p>{module.note}</p>
                        </div>
                        <span>{module.state}</span>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="dashboard-panel dashboard-panel--accent">
                  <span className="dashboard-panel__eyebrow">Siguiente fase</span>
                  <h2>Las vistas pueden construirse modulo por modulo sin rehacer la arquitectura.</h2>
                  <p>
                    La navegacion ya esta preparada para usuarios, perritos, productos, categorias, inventario,
                    movimientos, ventas, facturas, donaciones, seguimiento de responsabilidad, auditoria y reportes.
                  </p>
                </div>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
