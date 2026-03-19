import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as questionsApi from "../../api/questions";
import { useAuth } from "../../hooks/useAuth";

const QuestionsDashboard = () => {
  const { isAdmin } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return questions;
    }

    return questions.filter((question) =>
      [question.idPregunta, question.pregunta, question.tipoRespuesta, question.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [questions, search]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionsApi.getQuestions({ force: true });
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las preguntas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Preguntas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadQuestions();
  }, [isAdmin]);

  const onDelete = async (question) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar pregunta",
      text: "Se desactivara la pregunta seleccionada.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(question.idPregunta);
      await questionsApi.deleteQuestion(question.idPregunta);
      await loadQuestions();

      Swal.fire({
        icon: "success",
        title: "Pregunta eliminada",
        text: "La pregunta fue desactivada correctamente.",
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
          <h1>Preguntas</h1>
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
          <h1>Preguntas</h1>
          <p className="dashboard-page__lede">
            Administra el banco de preguntas utilizado en solicitudes y formularios del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/preguntas/nuevo">
          Crear pregunta
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una pregunta si todavia tiene respuestas activas asociadas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, pregunta, tipo de respuesta o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredQuestions.length} de {questions.length} preguntas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando preguntas...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay preguntas que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pregunta</th>
                  <th>Tipo de respuesta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => {
                  const isDeletingCurrent = deletingId === question.idPregunta;

                  return (
                    <tr key={question.idPregunta}>
                      <td>{question.idPregunta}</td>
                      <td>{question.pregunta}</td>
                      <td>{question.tipoRespuesta || question.idTipoRespuesta}</td>
                      <td>{question.estado || question.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/preguntas/${question.idPregunta}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(question)}
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

export default QuestionsDashboard;
