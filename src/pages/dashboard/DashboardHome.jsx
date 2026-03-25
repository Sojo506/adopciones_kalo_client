import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardSummary } from "../../api/adminReports";
import { adminQuickActions } from "../../data/adminReports";
import { dashboardNavigationCount } from "../../data/dashboardModules";
import { useAuth } from "../../hooks/useAuth";

const countFormatter = new Intl.NumberFormat("es-CR");
const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCount = (value) => countFormatter.format(Number(value || 0));
const formatMoney = (value) => amountFormatter.format(Number(value || 0));

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(date);
};

const DashboardHome = () => {
  const { user, isAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    document.title = "Dashboard | Adopciones Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setSummary(null);
      setLoadingSummary(false);
      setSummaryError("");
      return;
    }

    let isMounted = true;

    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        setSummaryError("");
        const data = await getAdminDashboardSummary({ force: true });

        if (isMounted) {
          setSummary(data);
        }
      } catch (error) {
        if (isMounted) {
          setSummaryError(
            error?.response?.data?.message ||
              "No pudimos cargar el resumen administrativo en este momento.",
          );
        }
      } finally {
        if (isMounted) {
          setLoadingSummary(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const metrics = summary?.metrics;
  const adminMetricCards = isAdmin
    ? [
        {
          label: "Facturas activas",
          value: formatCount(metrics?.facturasActivas),
          helper: `Total facturado: ${formatMoney(metrics?.totalFacturado)}`,
        },
        {
          label: "Ventas activas",
          value: formatCount(metrics?.ventasActivas),
          helper: `Monto vendido: ${formatMoney(metrics?.totalVentas)}`,
        },
        {
          label: "Donaciones activas",
          value: formatCount(metrics?.donacionesActivas),
          helper: `Monto donado: ${formatMoney(metrics?.totalDonaciones)}`,
        },
        {
          label: "Adopciones activas",
          value: formatCount(metrics?.adopcionesActivas),
          helper: `${formatCount(metrics?.perritosActivos)} perritos activos en el sistema`,
        },
        {
          label: "Seguimientos sensibles",
          value: formatCount(metrics?.seguimientosVencidos),
          helper: `${formatCount(metrics?.seguimientosProximos)} vencen en la semana`,
        },
        {
          label: "Operacion inmediata",
          value: formatCount(metrics?.productosStockBajo),
          helper: `${formatCount(metrics?.campaniasVigentes)} campanias vigentes`,
        },
      ]
    : [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Resumen</p>
          <h1>{isAdmin ? "Panel administrativo" : "Panel operativo"}</h1>
          <p className="dashboard-page__lede">
            {isAdmin
              ? "Una vista ejecutiva para detectar pendientes, descargar reportes y entrar rapido a los modulos clave."
              : "Una vista limpia para moverte entre modulos reales del sistema sin ruido visual."}
          </p>
        </div>

        {isAdmin ? (
          <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/reportes">
            Abrir reportes
          </Link>
        ) : null}
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

        {isAdmin ? (
          <article className="dashboard-card">
            <p className="dashboard-page__eyebrow">Cierre del dia</p>
            <h2>{formatCount(metrics?.seguimientosVencidos)} alertas vencidas</h2>
            <p className="dashboard-muted">
              {formatCount(metrics?.productosStockBajo)} productos con stock bajo y{" "}
              {formatCount(metrics?.campaniasVigentes)} campanias vigentes para monitorear.
            </p>
          </article>
        ) : null}
      </section>

      {isAdmin ? (
        <>
          {summaryError ? <div className="dashboard-alert">{summaryError}</div> : null}

          <section className="dashboard-card dashboard-card--highlight">
            <div className="dashboard-section__header">
              <div>
                <p className="dashboard-page__eyebrow">Salud operativa</p>
                <h2>Indicadores del administrador</h2>
              </div>
              {loadingSummary ? <span className="dashboard-muted">Actualizando...</span> : null}
            </div>

            <div className="dashboard-kpi-grid">
              {adminMetricCards.map((metric) => (
                <article key={metric.label} className="dashboard-kpi-card">
                  <p>{metric.label}</p>
                  <strong>{metric.value}</strong>
                  <span>{metric.helper}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-action-grid">
            {adminQuickActions.map((action) => (
              <Link key={action.to} className="dashboard-action-card" to={action.to}>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </Link>
            ))}
          </section>

          {loadingSummary && !summary ? (
            <div className="dashboard-empty-state">Cargando resumen administrativo...</div>
          ) : (
            <section className="dashboard-panel-grid">
              <article className="dashboard-card">
                <div className="dashboard-section__header">
                  <div>
                    <p className="dashboard-page__eyebrow">Alertas</p>
                    <h2>Seguimientos proximos</h2>
                  </div>
                  <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/seguimientos">
                    Ver modulo
                  </Link>
                </div>

                <div className="dashboard-inline-list">
                  {summary?.followUpAlerts?.length ? (
                    summary.followUpAlerts.map((followUp) => (
                      <div key={followUp.idSeguimiento} className="dashboard-inline-list__item">
                        <strong>
                          #{followUp.idSeguimiento} · {followUp.nombrePerrito || "Sin perrito"}
                        </strong>
                        <span>
                          {followUp.adoptante || followUp.identificacion || "Sin adoptante"} ·{" "}
                          {followUp.prioridadLabel}
                        </span>
                        <small>
                          {followUp.tipoSeguimiento || "Seguimiento"} · vence el{" "}
                          {formatDate(followUp.fechaFin)} · {formatCount(followUp.cantidadEvidencias)} evidencias
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-empty-state">
                      No hay seguimientos urgentes para esta ventana de tiempo.
                    </div>
                  )}
                </div>
              </article>

              <article className="dashboard-card">
                <div className="dashboard-section__header">
                  <div>
                    <p className="dashboard-page__eyebrow">Abastecimiento</p>
                    <h2>Inventario critico</h2>
                  </div>
                  <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/inventario">
                    Ver modulo
                  </Link>
                </div>

                <div className="dashboard-inline-list">
                  {summary?.lowStockProducts?.length ? (
                    summary.lowStockProducts.map((product) => (
                      <div key={product.idInventario} className="dashboard-inline-list__item">
                        <strong>{product.producto || `Producto ${product.idProducto}`}</strong>
                        <span>
                          {product.categoria || "Sin categoria"} · {product.marca || "Sin marca"}
                        </span>
                        <small>
                          {formatCount(product.cantidad)} unidades · valor estimado{" "}
                          {formatMoney(product.valorEstimado)}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-empty-state">
                      No hay productos debajo del umbral operativo configurado.
                    </div>
                  )}
                </div>
              </article>

              <article className="dashboard-card">
                <div className="dashboard-section__header">
                  <div>
                    <p className="dashboard-page__eyebrow">Movimiento reciente</p>
                    <h2>Facturas recientes</h2>
                  </div>
                  <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/facturas">
                    Ver modulo
                  </Link>
                </div>

                <div className="dashboard-inline-list">
                  {summary?.recentInvoices?.length ? (
                    summary.recentInvoices.map((invoice) => (
                      <div key={invoice.idFactura} className="dashboard-inline-list__item">
                        <strong>{invoice.idFactura}</strong>
                        <span>
                          {invoice.moneda || invoice.idMoneda || "Sin moneda"} · total{" "}
                          {invoice.simbolo ? `${invoice.simbolo} ` : ""}
                          {formatMoney(invoice.total)}
                        </span>
                        <small>
                          {formatDate(invoice.fechaFactura)} · {formatCount(invoice.cantidadVentas)} ventas ·{" "}
                          {formatCount(invoice.cantidadDonaciones)} donaciones
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-empty-state">
                      Todavia no hay facturas para resumir en este panel.
                    </div>
                  )}
                </div>
              </article>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
};

export default DashboardHome;
