import { useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const stats = [
    { value: "08", label: "Modulos preparados", detail: "Usuarios, adopciones, solicitudes y mas" },
    { value: "03", label: "Frentes criticos", detail: "Operacion, seguimiento y reporteria" },
    { value: isAdmin ? "Admin" : "Cliente", label: "Perfil activo", detail: "Permisos detectados en tiempo real" },
  ];

  const priorityModules = [
    {
      title: "Gestion de usuarios",
      badge: "Acceso y roles",
      description: "Administra perfiles, tipos de usuario y estados de cuenta desde una sola vista.",
      items: ["Administradores y clientes", "Cambios de estado", "Validacion de acceso"],
    },
    {
      title: "Solicitudes y adopciones",
      badge: "Operacion diaria",
      description: "Supervisa solicitudes entrantes, aprobaciones y seguimiento de adopciones activas.",
      items: ["Panel de solicitudes", "Adopciones activas", "Seguimiento post adopcion"],
    },
    {
      title: "Campanas y donaciones",
      badge: "Impacto social",
      description: "Centraliza recaudacion, campanas activas y su rendimiento financiero.",
      items: ["Campanas vigentes", "Donaciones recibidas", "Total recaudado por campana"],
    },
  ];

  const supportModules = [
    { name: "Perfiles y direcciones", state: "Listo para integrar", note: "Vista de perfil completo y ubicaciones." },
    { name: "Auditoria del sistema", state: "Listo para integrar", note: "Trazabilidad de cambios y responsables." },
    { name: "Reportes financieros", state: "Listo para integrar", note: "Resumen mensual y metricas de adopcion." },
    { name: "Casas cuna y refugios", state: "Listo para integrar", note: "Capacidad, ubicacion y seguimiento." },
  ];

  const commandLines = [
    "Usuarios y roles sincronizados",
    "Solicitudes listas para clasificacion",
    "Seguimiento de adopciones en observacion",
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
                <span className="dashboard-hero__eyebrow">Centro de mando</span>
                <h1>Operacion central{user?.nombre ? `, ${user.nombre}` : ""}</h1>
                <p>
                  {isAdmin
                    ? "Una interfaz mas firme, densa y ejecutiva para supervisar las areas clave de Adopciones Kalö desde un solo punto."
                    : "Tu panel ya esta listo para organizar informacion operativa con una lectura mas clara y estructurada."}
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
                  <p>{isAdmin ? "Acceso completo a modulos administrativos." : "Acceso limitado segun tu perfil."}</p>
                </div>
                <div className="dashboard-signal-card">
                  <span>Nivel de control</span>
                  <strong>{isAdmin ? "Elevado" : "Basico"}</strong>
                  <p>{isAdmin ? "Capacidad de orquestar modulos, reportes y supervisiones." : "Consulta y seguimiento de tu informacion."}</p>
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
                      <h2>Nucleo de modulos del panel</h2>
                    </div>
                    <span className="dashboard-status-tag">Robusto y escalable</span>
                  </div>

                  <div className="dashboard-module-grid">
                    {priorityModules.map((module) => (
                      <article key={module.title} className="dashboard-module-card">
                        <span className="dashboard-module-card__badge">{module.badge}</span>
                        <h3>{module.title}</h3>
                        <p>{module.description}</p>
                        <ul>
                          {module.items.map((item) => (
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
                      <span className="dashboard-panel__eyebrow">Identidad activa</span>
                      <h2>Perfil operativo actual</h2>
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
                      <span>Tipo de usuario</span>
                      <strong>{user?.roleName || user?.tipoUsuario || user?.tipo || "-"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="dashboard-side-column">
                <div className="dashboard-panel">
                  <div className="dashboard-panel__header">
                    <div>
                      <span className="dashboard-panel__eyebrow">Expansion</span>
                      <h2>Modulos listos para conectar</h2>
                    </div>
                  </div>

                  <div className="dashboard-readiness-list">
                    {supportModules.map((module) => (
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
                  <span className="dashboard-panel__eyebrow">Direccion del panel</span>
                  <h2>Una base visual mas firme para crecer por capas.</h2>
                  <p>
                    La siguiente iteracion puede conectar estas superficies con rutas reales, tablas de gestion,
                    indicadores vivos y filtros por modulo.
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
