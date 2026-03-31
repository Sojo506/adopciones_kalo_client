import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as emailsApi from "../../api/emails";
import { useAuth } from "../../hooks/useAuth";

const EmailsDashboard = () => {
  const { isAdmin } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [search, setSearch] = useState("");

  const filteredEmails = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return emails;
    }

    return emails.filter((email) =>
      [email.identificacion, email.usuario, email.correo, email.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [emails, search]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await emailsApi.getEmails({ force: true });
      setEmails(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los correos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Correos | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadEmails();
  }, [isAdmin]);

  const onDelete = async (email) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar correo",
      text: `Se desactivara el correo "${email.correo}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    const cacheKey = `${email.identificacion}:${email.correo}`;

    try {
      setDeletingKey(cacheKey);
      await emailsApi.deleteEmail(email.identificacion, email.correo);
      await loadEmails();

      Swal.fire({
        icon: "success",
        title: "Correo eliminado",
        text: "El correo fue desactivado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos eliminar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDeletingKey(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Correos</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede gestionar esta tabla desde el dashboard.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Gestion de correos</p>
          <h1>Correos</h1>
          <p className="dashboard-page__lede">
            Administra direcciones de correo asociadas a usuarios y su estado dentro del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/correos/nuevo">
          Crear correo
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingKey !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por identificacion, usuario, correo o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredEmails.length} de {emails.length} correos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando correos...</div>
        ) : filteredEmails.length === 0 ? (
          <div className="dashboard-empty-state">No hay correos que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Identificacion</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email) => {
                  const cacheKey = `${email.identificacion}:${email.correo}`;
                  const isDeletingCurrent = deletingKey === cacheKey;

                  return (
                    <tr key={cacheKey}>
                      <td>{email.identificacion}</td>
                      <td>{email.usuario || "-"}</td>
                      <td>{email.correo}</td>
                      <td>{email.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingKey !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingKey !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/correos/${email.identificacion}/${encodeURIComponent(email.correo)}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingKey !== null}
                            onClick={() => onDelete(email)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmailsDashboard;
