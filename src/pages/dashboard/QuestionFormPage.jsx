import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as questionsApi from "../../api/questions";
import * as responseTypesApi from "../../api/responseTypes";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  pregunta: "",
  idTipoRespuesta: "",
  idEstado: "",
};

const mapQuestionToForm = (question) => ({
  pregunta: question?.pregunta ?? "",
  idTipoRespuesta: String(question?.idTipoRespuesta ?? ""),
  idEstado: String(question?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  pregunta: values.pregunta.trim(),
  idTipoRespuesta: Number(values.idTipoRespuesta),
  idEstado: Number(values.idEstado),
});

const QuestionFormPage = () => {
  const { idPregunta } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [responseTypes, setResponseTypes] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idPregunta);
  const hasStates = states.length > 0;
  const hasResponseTypes = responseTypes.length > 0;
  const hasCatalogs = hasStates && hasResponseTypes;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasCatalogs;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar pregunta | Dashboard Kalö" : "Nueva pregunta | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, responseTypesData] = await Promise.all([
          catalogsApi.getStates(),
          responseTypesApi.getResponseTypes({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableResponseTypes = Array.isArray(responseTypesData) ? responseTypesData : [];

        setStates(availableStates);
        setResponseTypes(availableResponseTypes);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          const activeResponseType = availableResponseTypes.find(
            (responseType) => Number(responseType.idEstado) === 1,
          );

          reset({
            ...EMPTY_FORM,
            idEstado: String(activeState?.idEstado ?? availableStates?.[0]?.idEstado ?? ""),
            idTipoRespuesta: String(
              activeResponseType?.idTipoRespuesta ?? availableResponseTypes?.[0]?.idTipoRespuesta ?? "",
            ),
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar los catalogos",
          text: error?.response?.data?.message || "Intenta de nuevo en un momento.",
        });
      } finally {
        setCatalogsLoading(false);
      }
    };

    loadCatalogs();
  }, [isEditing, reset]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadQuestion = async () => {
      try {
        setDetailLoading(true);
        const detail = await questionsApi.getQuestionById(idPregunta, { force: true });
        reset(mapQuestionToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la pregunta",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/preguntas");
      } finally {
        setDetailLoading(false);
      }
    };

    loadQuestion();
  }, [idPregunta, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasCatalogs) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await questionsApi.updateQuestion(idPregunta, payload);
      } else {
        await questionsApi.createQuestion(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Pregunta actualizada" : "Pregunta creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La pregunta fue creada correctamente.",
      });

      navigate("/dashboard/preguntas");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar",
        text: error?.response?.data?.message || "Verifica la informacion e intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Preguntas</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede crear o actualizar esta informacion.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Banco de preguntas</p>
          <h1>{isEditing ? "Actualizar pregunta" : "Crear pregunta"}</h1>
          <p className="dashboard-page__lede">
            Define una pregunta reutilizable, el tipo de respuesta esperado y el estado con que
            quedara disponible para asignarse a formularios.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/preguntas">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {!catalogsLoading && !detailLoading ? (
          <>
            <div className="dashboard-alert">
              Esta pantalla administra solo el banco de preguntas. La asignacion a formularios se
              resuelve desde <Link to="/dashboard/tipos-solicitud-pregunta">Tipo solicitud-pregunta</Link>.
            </div>

            <div className="dashboard-alert">
              Si una pregunta sigue asignada a solicitudes activas o ya tiene respuestas activas,
              el backend no permitira desactivarla.
            </div>
          </>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasStates ? (
          <div className="dashboard-empty-state">
            No hay estados disponibles para completar este formulario.
          </div>
        ) : !hasResponseTypes ? (
          <div className="dashboard-empty-state">
            No hay tipos de respuesta disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input dashboard-input--full">
                  <span>Pregunta</span>
                  <textarea
                    className="form-control"
                    rows={4}
                    {...register("pregunta", {
                      required: "La pregunta es obligatoria",
                      maxLength: {
                        value: 500,
                        message: "La pregunta no puede superar 500 caracteres",
                      },
                    })}
                  />
                  {errors.pregunta ? <small>{errors.pregunta.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Tipo de respuesta</span>
                  <select
                    className="form-select"
                    {...register("idTipoRespuesta", {
                      required: "El tipo de respuesta es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un tipo de respuesta</option>
                    {responseTypes.map((responseType) => (
                      <option key={responseType.idTipoRespuesta} value={responseType.idTipoRespuesta}>
                        {responseType.nombre}
                        {Number(responseType.idEstado) !== 1 ? ` (${responseType.estado || "Inactivo"})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.idTipoRespuesta ? <small>{errors.idTipoRespuesta.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Estado</span>
                  <select
                    className="form-select"
                    {...register("idEstado", { required: "El estado es obligatorio" })}
                  >
                    <option value="">Selecciona un estado</option>
                    {states.map((state) => (
                      <option key={state.idEstado} value={state.idEstado}>
                        {state.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idEstado ? <small>{errors.idEstado.message}</small> : null}
                </label>
              </div>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear pregunta"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/preguntas">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default QuestionFormPage;
