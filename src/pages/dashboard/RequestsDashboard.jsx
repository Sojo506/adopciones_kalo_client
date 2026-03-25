import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as requestsApi from "../../api/requests";
import { useAuth } from "../../hooks/useAuth";

const formatDogReference = (request) => {
  if (!request?.idPerrito) {
    return "Sin adopción";
  }

  return request.nombrePerrito
    ? `#${request.idPerrito} - ${request.nombrePerrito}`
    : `#${request.idPerrito}`;
};

const RequestsDashboard = () => {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return requests;
    }

    return requests.filter((request) =>
      [
        request.idSolicitud,
        request.identificacion,
        request.solicitante,
        request.idPerrito,
        request.nombrePerrito,
        request.tipoSolicitud,
        request.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [requests, search]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await requestsApi.getRequests({ force: true });
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las solicitudes",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Solicitudes | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadRequests();
  }, [isAdmin]);

  const onDelete = async (request) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar solicitud",
      text: `Se desactivara la solicitud #${request.idSolicitud}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(request.idSolicitud);
      await requestsApi.deleteRequest(request.idSolicitud);
      await loadRequests();

      Swal.fire({
        icon: "success",
        title: "Solicitud eliminada",
        text: "La solicitud fue desactivada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos eliminar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Solicitudes</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de formularios</p>
          <h1>Solicitudes</h1>
          <p className="dashboard-page__lede">
            Administra cada formulario de solicitud, su solicitante, el tipo de proceso y el estado
            actual del caso.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/solicitudes/nuevo">
          Crear solicitud
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          La solicitud guarda el formulario base. Las preguntas se asignan desde{" "}
          <Link to="/dashboard/tipos-solicitud-pregunta">Tipo solicitud-pregunta</Link> y el
          perrito solo aparece aqui cuando ya existe una adopcion asociada.
        </div>

        <div className="dashboard-alert">
          No puedes eliminar o desactivar una solicitud si todavia tiene preguntas asignadas,
          respuestas, adopciones o registros de casa cuna activos.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, identificacion, solicitante, perrito, tipo o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredRequests.length} de {requests.length} solicitudes
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando solicitudes...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay solicitudes que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Identificacion</th>
                  <th>Solicitante</th>
                  <th>Tipo de solicitud</th>
                  <th>Perrito</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const isDeletingCurrent = deletingId === request.idSolicitud;

                  return (
                    <tr key={request.idSolicitud}>
                      <td>{request.identificacion}</td>
                      <td>{request.solicitante || "-"}</td>
                      <td>{request.tipoSolicitud || request.idTipoSolicitud}</td>
                      <td>{formatDogReference(request)}</td>
                      <td>{request.estado || request.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/solicitudes/${request.idSolicitud}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(request)}
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

export default RequestsDashboard;
