import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { downloadAdminReportPdf } from "../../api/adminReports";
import { adminReportModules } from "../../data/adminReports";
import { useAuth } from "../../hooks/useAuth";

const triggerFileDownload = (blob, filename) => {
  const fileUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = fileUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(fileUrl);
};

const ReportsDashboard = () => {
  const { isAdmin } = useAuth();
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  useEffect(() => {
    document.title = "Reportes | Dashboard Kalo";
  }, []);

  const onDownloadReport = async (reportId) => {
    try {
      setDownloadingReportId(reportId);
      const { blob, filename } = await downloadAdminReportPdf(reportId);
      triggerFileDownload(blob, filename);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos generar el reporte",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDownloadingReportId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Reportes</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede descargar reportes desde este modulo.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Control ejecutivo</p>
          <h1>Reportes PDF</h1>
          <p className="dashboard-page__lede">
            Descarga cortes administrativos listos para compartir con el equipo o llevar a cierre.
          </p>
        </div>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Cada PDF se genera con datos consultados desde el package del sistema para mantener una
          sola fuente de verdad.
        </div>

        <div className="dashboard-report-grid">
          {adminReportModules.map((report) => {
            const isDownloadingCurrent = downloadingReportId === report.id;

            return (
              <article key={report.id} className="dashboard-report-card">
                <div className="dashboard-report-card__header">
                  <span className="dashboard-badge">{report.badge}</span>
                  <h2>{report.title}</h2>
                </div>

                <p className="dashboard-muted">{report.description}</p>

                <div className="dashboard-tags">
                  {report.highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>

                <div className="dashboard-report-card__footer">
                  <button
                    className="dashboard-btn dashboard-btn--primary"
                    disabled={downloadingReportId !== null}
                    onClick={() => onDownloadReport(report.id)}
                    type="button"
                  >
                    {isDownloadingCurrent ? "Descargando..." : "Descargar PDF"}
                  </button>

                  <Link
                    className={`dashboard-btn dashboard-btn--ghost${downloadingReportId !== null ? " is-disabled" : ""}`}
                    onClick={(event) => {
                      if (downloadingReportId !== null) {
                        event.preventDefault();
                      }
                    }}
                    to={report.modulePath}
                  >
                    {report.moduleLabel}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ReportsDashboard;
