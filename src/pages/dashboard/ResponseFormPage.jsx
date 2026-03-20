import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as requestQuestionsApi from "../../api/requestQuestions";
import * as responsesApi from "../../api/responses";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idSolicitud: "",
  idPregunta: "",
  respuesta: "",
  idEstado: "1",
};

const buildRelationKey = (idSolicitud, idPregunta) => `${String(idSolicitud)}:${String(idPregunta)}`;

const buildRequestLabel = (requestQuestion) => {
  const base = `#${requestQuestion.idSolicitud}`;
  return requestQuestion.solicitante ? `${base} - ${requestQuestion.solicitante}` : base;
};

const buildQuestionLabel = (requestQuestion) => {
  return `#${requestQuestion.idPregunta} - ${requestQuestion.pregunta}`;
};

const mapResponseToForm = (response) => ({
  idSolicitud: String(response?.idSolicitud ?? ""),
  idPregunta: String(response?.idPregunta ?? ""),
  respuesta: response?.respuesta ?? "",
  idEstado: String(response?.idEstado ?? "1"),
});

const buildPayload = (values) => ({
  idSolicitud: Number(values.idSolicitud),
  idPregunta: Number(values.idPregunta),
  respuesta: values.respuesta.trim(),
  idEstado: Number(values.idEstado),
});

const getSelectableRequestQuestions = ({ requestQuestions, responses, currentResponse }) => {
  const currentRelationKey = currentResponse
    ? buildRelationKey(currentResponse.idSolicitud, currentResponse.idPregunta)
    : null;
  const usedRelationKeys = new Set(
    (Array.isArray(responses) ? responses : [])
      .filter((response) => Number(response.idRespuesta) !== Number(currentResponse?.idRespuesta))
      .map((response) => buildRelationKey(response.idSolicitud, response.idPregunta)),
  );

  return (Array.isArray(requestQuestions) ? requestQuestions : []).filter((requestQuestion) => {
    const relationKey = buildRelationKey(requestQuestion.idSolicitud, requestQuestion.idPregunta);

    if (relationKey === currentRelationKey) {
      return true;
    }

    if (Number(requestQuestion.idEstado) !== 1) {
      return false;
    }

    return !usedRelationKeys.has(relationKey);
  });
};

const ResponseFormPage = () => {
  const { idRespuesta } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [requestQuestions, setRequestQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);

  const isEditing = Boolean(idRespuesta);

  const selectableRequestQuestions = useMemo(() => {
    return getSelectableRequestQuestions({
      requestQuestions,
      responses,
      currentResponse,
    });
  }, [currentResponse, requestQuestions, responses]);

  const requestOptions = useMemo(() => {
    const byRequest = new Map();

    selectableRequestQuestions.forEach((requestQuestion) => {
      const key = String(requestQuestion.idSolicitud);

      if (!byRequest.has(key)) {
        byRequest.set(key, requestQuestion);
      }
    });

    return Array.from(byRequest.values()).sort((left, right) => left.idSolicitud - right.idSolicitud);
  }, [selectableRequestQuestions]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedRequestId = watch("idSolicitud");
  const watchedQuestionId = watch("idPregunta");

  const questionOptions = useMemo(() => {
    return selectableRequestQuestions.filter(
      (requestQuestion) => Number(requestQuestion.idSolicitud) === Number(watchedRequestId),
    );
  }, [selectableRequestQuestions, watchedRequestId]);

  const selectedRequest = useMemo(() => {
    return (
      requestOptions.find(
        (requestQuestion) => Number(requestQuestion.idSolicitud) === Number(watchedRequestId),
      ) || null
    );
  }, [requestOptions, watchedRequestId]);

  const selectedRequestQuestion = useMemo(() => {
    return (
      questionOptions.find(
        (requestQuestion) => Number(requestQuestion.idPregunta) === Number(watchedQuestionId),
      ) || null
    );
  }, [questionOptions, watchedQuestionId]);

  const hasRequiredData =
    states.length > 0 && requestOptions.length > 0 && questionOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  useEffect(() => {
    document.title = isEditing ? "Editar respuesta | Dashboard Kalö" : "Nueva respuesta | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, requestQuestionsData, responsesData] = await Promise.all([
          catalogsApi.getStates(),
          requestQuestionsApi.getRequestQuestions({ force: true }),
          responsesApi.getResponses({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableRequestQuestions = Array.isArray(requestQuestionsData) ? requestQuestionsData : [];
        const availableResponses = Array.isArray(responsesData) ? responsesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const selectableRelations = getSelectableRequestQuestions({
          requestQuestions: availableRequestQuestions,
          responses: availableResponses,
          currentResponse: null,
        });
        const defaultRelation = selectableRelations[0] || null;

        setStates(availableStates);
        setRequestQuestions(availableRequestQuestions);
        setResponses(availableResponses);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idSolicitud: String(defaultRelation?.idSolicitud ?? ""),
            idPregunta: String(defaultRelation?.idPregunta ?? ""),
            idEstado: String(activeState?.idEstado ?? 1),
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la informacion base",
          text: error?.response?.data?.message || "Intenta de nuevo en un momento.",
        });
      } finally {
        setCatalogsLoading(false);
      }
    };

    loadBaseData();
  }, [isEditing, reset]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadResponse = async () => {
      try {
        setDetailLoading(true);
        const detail = await responsesApi.getResponseById(idRespuesta, { force: true });
        setCurrentResponse(detail);
        reset(mapResponseToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la respuesta",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/respuestas");
      } finally {
        setDetailLoading(false);
      }
    };

    loadResponse();
  }, [idRespuesta, isEditing, navigate, reset]);

  useEffect(() => {
    if (catalogsLoading || detailLoading) {
      return;
    }

    if (!watchedRequestId && requestOptions.length > 0) {
      setValue("idSolicitud", String(requestOptions[0].idSolicitud), {
        shouldDirty: false,
      });
      return;
    }

    if (!questionOptions.length) {
      setValue("idPregunta", "", {
        shouldDirty: false,
      });
      return;
    }

    const hasSelectedQuestion = questionOptions.some(
      (requestQuestion) => Number(requestQuestion.idPregunta) === Number(watchedQuestionId),
    );

    if (!hasSelectedQuestion) {
      setValue("idPregunta", String(questionOptions[0].idPregunta), {
        shouldDirty: false,
      });
    }
  }, [
    catalogsLoading,
    detailLoading,
    questionOptions,
    requestOptions,
    setValue,
    watchedQuestionId,
    watchedRequestId,
  ]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await responsesApi.updateResponse(idRespuesta, payload);
      } else {
        await responsesApi.createResponse(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Respuesta actualizada" : "Respuesta creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La respuesta fue creada correctamente.",
      });

      navigate("/dashboard/respuestas");
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
          <h1>Respuestas</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar respuesta" : "Nueva respuesta"}</p>
          <h1>{isEditing ? "Actualizar respuesta" : "Crear respuesta"}</h1>
          <p className="dashboard-page__lede">
            Selecciona una pregunta asignada al formulario, registra la respuesta y controla el
            estado del registro.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/respuestas">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las preguntas disponibles salen de{" "}
          <Link to="/dashboard/solicitudes-pregunta">Solicitud-pregunta</Link> y se ocultan si ya
          tienen una respuesta registrada en esa misma solicitud.
        </div>

        <div className="dashboard-alert">
          Si cambias la solicitud, el selector de pregunta se recalcula solo con las preguntas
          disponibles para ese formulario.
        </div>

        {selectedRequestQuestion && Number(selectedRequestQuestion.idEstado) !== 1 ? (
          <div className="dashboard-alert">
            La relacion actual solicitud-pregunta esta inactiva. Necesitas mover la respuesta a una
            relacion activa para poder guardar cambios.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados y relaciones solicitud-pregunta disponibles para completar este
            formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Solicitud</span>
                  <select
                    className="form-select"
                    {...register("idSolicitud", {
                      required: "La solicitud es obligatoria",
                    })}
                  >
                    <option value="">Selecciona una solicitud</option>
                    {requestOptions.map((requestQuestion) => (
                      <option key={requestQuestion.idSolicitud} value={requestQuestion.idSolicitud}>
                        {buildRequestLabel(requestQuestion)}
                      </option>
                    ))}
                  </select>
                  {errors.idSolicitud ? <small>{errors.idSolicitud.message}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Pregunta</span>
                  <select
                    className="form-select"
                    {...register("idPregunta", {
                      required: "La pregunta es obligatoria",
                    })}
                  >
                    <option value="">Selecciona una pregunta</option>
                    {questionOptions.map((requestQuestion) => (
                      <option
                        key={buildRelationKey(requestQuestion.idSolicitud, requestQuestion.idPregunta)}
                        value={requestQuestion.idPregunta}
                      >
                        {buildQuestionLabel(requestQuestion)}
                        {requestQuestion.tipoRespuesta ? ` (${requestQuestion.tipoRespuesta})` : ""}
                        {Number(requestQuestion.idEstado) !== 1
                          ? ` - ${requestQuestion.estado || "Inactiva"}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {errors.idPregunta ? <small>{errors.idPregunta.message}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Respuesta</span>
                  <textarea
                    className="form-control"
                    rows={4}
                    {...register("respuesta", {
                      required: "La respuesta es obligatoria",
                      maxLength: {
                        value: 500,
                        message: "La respuesta no puede superar 500 caracteres",
                      },
                    })}
                  />
                  {errors.respuesta ? <small>{errors.respuesta.message}</small> : null}
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

            {selectedRequest ? (
              <p className="dashboard-muted">Solicitud seleccionada: {buildRequestLabel(selectedRequest)}.</p>
            ) : null}

            {selectedRequestQuestion ? (
              <p className="dashboard-muted">
                Pregunta seleccionada: {buildQuestionLabel(selectedRequestQuestion)}
                {selectedRequestQuestion.tipoRespuesta
                  ? ` (${selectedRequestQuestion.tipoRespuesta})`
                  : ""}
                .
              </p>
            ) : null}

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear respuesta"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/respuestas">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ResponseFormPage;
