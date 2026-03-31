import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as requestQuestionsApi from "../../api/requestQuestions";
import { useAuth } from "../../hooks/useAuth";

const buildRequestTypeLabel = (requestQuestion) => {
  return requestQuestion.tipoSolicitud || "Tipo de solicitud asociado";
};

const RequestQuestionsDashboard = () => {
  const { isAdmin } = useAuth();
  const [requestQuestions, setRequestQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [search, setSearch] = useState("");

  const filteredRequestQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return requestQuestions;
    }

    return requestQuestions.filter((requestQuestion) =>
      [
        requestQuestion.idTipoSolicitud,
        requestQuestion.tipoSolicitud,
        requestQuestion.idPregunta,
        requestQuestion.pregunta,
        requestQuestion.tipoRespuesta,
        requestQuestion.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [requestQuestions, search]);

  const loadRequestQuestions = async () => {
    try {
      setLoading(true);
      const data = await requestQuestionsApi.getRequestQuestions({ force: true });
      setRequestQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las relaciones tipo solicitud-pregunta",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Tipo solicitud-pregunta | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadRequestQuestions();
  }, [isAdmin]);

  const onDelete = async (requestQuestion) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar relacion tipo solicitud-pregunta",
      text: "Se desactivara la relacion seleccionada.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    const relationKey = `${requestQuestion.idTipoSolicitud}:${requestQuestion.idPregunta}`;

    try {
      setDeletingKey(relationKey);
      await requestQuestionsApi.deleteRequestQuestion(
        requestQuestion.idTipoSolicitud,
        requestQuestion.idPregunta,
      );
      await loadRequestQuestions();

      Swal.fire({
        icon: "success",
        title: "Relacion eliminada",
        text: "La relacion tipo solicitud-pregunta fue desactivada correctamente.",
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
          <h1>Tipo solicitud-pregunta</h1>
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
          <p className="dashboard-page__eyebrow">Composicion de formularios</p>
          <h1>Tipo solicitud-pregunta</h1>
          <p className="dashboard-page__lede">
            Administra la relacion N:N entre cada tipo de solicitud y las preguntas que componen su
            formulario base.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--primary"
          to="/dashboard/tipos-solicitud-pregunta/nuevo"
        >
          Crear relacion
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las relaciones nuevas siempre inician activas. Si necesitas volver a usar una relacion
          que ya existe inactiva, editala y reactivala en lugar de crearla de nuevo.
        </div>

        <div className="dashboard-alert">
          No puedes eliminar o desactivar una relacion tipo solicitud-pregunta si ya tiene
          respuestas activas asociadas a solicitudes de ese tipo y a esa misma pregunta.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingKey !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por tipo de solicitud, pregunta, tipo de respuesta o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredRequestQuestions.length} de {requestQuestions.length} relaciones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando relaciones tipo solicitud-pregunta...</div>
        ) : filteredRequestQuestions.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay relaciones tipo solicitud-pregunta que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tipo solicitud</th>
                  <th>Pregunta</th>
                  <th>Tipo respuesta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequestQuestions.map((requestQuestion) => {
                  const relationKey = `${requestQuestion.idTipoSolicitud}:${requestQuestion.idPregunta}`;
                  const isDeletingCurrent = deletingKey === relationKey;

                  return (
                    <tr key={relationKey}>
                      <td>{buildRequestTypeLabel(requestQuestion)}</td>
                      <td>
                        #{requestQuestion.idPregunta} - {requestQuestion.pregunta}
                      </td>
                      <td>{requestQuestion.tipoRespuesta || "Tipo registrado"}</td>
                      <td>{requestQuestion.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingKey !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingKey !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/tipos-solicitud-pregunta/${requestQuestion.idTipoSolicitud}/${requestQuestion.idPregunta}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingKey !== null}
                            onClick={() => onDelete(requestQuestion)}
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

export default RequestQuestionsDashboard;
