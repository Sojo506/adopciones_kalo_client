import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as responsesApi from "../../api/responses";
import { useAuth } from "../../hooks/useAuth";

const buildRequestLabel = (response) => {
  const base = `#${response.idSolicitud}`;
  return response.solicitante ? `${base} - ${response.solicitante}` : base;
};

const buildQuestionLabel = (response) => {
  return `#${response.idPregunta} - ${response.pregunta}`;
};

const formatResponsePreview = (value) => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "-";
  }

  if (normalized.length <= 96) {
    return normalized;
  }

  return `${normalized.slice(0, 93)}...`;
};

const ResponsesDashboard = () => {
  const { isAdmin } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredResponses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return responses;
    }

    return responses.filter((response) =>
      [
        response.idRespuesta,
        response.idSolicitud,
        response.identificacion,
        response.solicitante,
        response.tipoSolicitud,
        response.idPregunta,
        response.pregunta,
        response.tipoRespuesta,
        response.respuesta,
        response.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [responses, search]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const data = await responsesApi.getResponses({ force: true });
      setResponses(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las respuestas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Respuestas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadResponses();
  }, [isAdmin]);

  const onDelete = async (response) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar respuesta",
      text: `Se desactivara la respuesta #${response.idRespuesta}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(response.idRespuesta);
      await responsesApi.deleteResponse(response.idRespuesta);
      await loadResponses();

      Swal.fire({
        icon: "success",
        title: "Respuesta eliminada",
        text: "La respuesta fue desactivada correctamente.",
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
          <h1>Respuestas</h1>
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
          <p className="dashboard-page__eyebrow">Captura de formularios</p>
          <h1>Respuestas</h1>
          <p className="dashboard-page__lede">
            Administra las respuestas registradas para cada pregunta asignada dentro de una
            solicitud.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/respuestas/nuevo">
          Crear respuesta
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Cada combinacion de solicitud y pregunta puede tener una sola respuesta. Si ya existe,
          edita el registro actual en lugar de crear uno nuevo.
        </div>

        <div className="dashboard-alert">
          Solo puedes responder preguntas que sigan activas en{" "}
          <Link to="/dashboard/solicitudes-pregunta">Solicitud-pregunta</Link>.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por respuesta, solicitud, solicitante, pregunta, tipo o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredResponses.length} de {responses.length} respuestas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando respuestas...</div>
        ) : filteredResponses.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay respuestas que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitud</th>
                  <th>Tipo solicitud</th>
                  <th>Pregunta</th>
                  <th>Tipo respuesta</th>
                  <th>Respuesta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((response) => {
                  const isDeletingCurrent = deletingId === response.idRespuesta;

                  return (
                    <tr key={response.idRespuesta}>
                      <td>{response.idRespuesta}</td>
                      <td>{buildRequestLabel(response)}</td>
                      <td>{response.tipoSolicitud || response.idTipoSolicitud}</td>
                      <td>{buildQuestionLabel(response)}</td>
                      <td>{response.tipoRespuesta || response.idTipoRespuesta}</td>
                      <td title={response.respuesta}>{formatResponsePreview(response.respuesta)}</td>
                      <td>{response.estado || response.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/respuestas/${response.idRespuesta}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(response)}
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

export default ResponsesDashboard;
