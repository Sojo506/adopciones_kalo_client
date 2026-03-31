import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as questionsApi from "../../api/questions";
import * as requestQuestionsApi from "../../api/requestQuestions";
import * as requestTypesApi from "../../api/requestTypes";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idTipoSolicitud: "",
  idPregunta: "",
  idEstado: "1",
};

const buildRequestTypeLabel = (requestType) => {
  return requestType.nombre || "Tipo de solicitud";
};

const buildQuestionLabel = (question) => {
  return question.pregunta || "Pregunta disponible";
};

const mapRequestQuestionToForm = (requestQuestion) => ({
  idTipoSolicitud: String(requestQuestion?.idTipoSolicitud ?? ""),
  idPregunta: String(requestQuestion?.idPregunta ?? ""),
  idEstado: String(requestQuestion?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  idTipoSolicitud: Number(values.idTipoSolicitud),
  idPregunta: Number(values.idPregunta),
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  idEstado: Number(values.idEstado),
});

const RequestQuestionFormPage = () => {
  const { idTipoSolicitud, idPregunta } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentRequestQuestion, setCurrentRequestQuestion] = useState(null);

  const isEditing = Boolean(idTipoSolicitud && idPregunta);

  const requestTypeOptions = useMemo(() => {
    return requestTypes.filter(
      (requestType) =>
        Number(requestType.idEstado) === 1 ||
        Number(requestType.idTipoSolicitud) === Number(currentRequestQuestion?.idTipoSolicitud),
    );
  }, [currentRequestQuestion?.idTipoSolicitud, requestTypes]);

  const questionOptions = useMemo(() => {
    return questions.filter(
      (question) =>
        Number(question.idEstado) === 1 ||
        Number(question.idPregunta) === Number(currentRequestQuestion?.idPregunta),
    );
  }, [currentRequestQuestion?.idPregunta, questions]);

  const hasRequiredData =
    states.length > 0 && requestTypeOptions.length > 0 && questionOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedRequestTypeId = watch("idTipoSolicitud");
  const watchedQuestionId = watch("idPregunta");

  const selectedRequestType = useMemo(() => {
    return (
      requestTypeOptions.find(
        (requestType) => Number(requestType.idTipoSolicitud) === Number(watchedRequestTypeId),
      ) || null
    );
  }, [requestTypeOptions, watchedRequestTypeId]);

  const selectedQuestion = useMemo(() => {
    return questionOptions.find((question) => Number(question.idPregunta) === Number(watchedQuestionId)) || null;
  }, [questionOptions, watchedQuestionId]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar tipo solicitud-pregunta | Dashboard Kalö"
      : "Nueva relacion tipo solicitud-pregunta | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, requestTypesData, questionsData] = await Promise.all([
          catalogsApi.getStates(),
          requestTypesApi.getRequestTypes({ force: true }),
          questionsApi.getQuestions({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableRequestTypes = Array.isArray(requestTypesData) ? requestTypesData : [];
        const availableQuestions = Array.isArray(questionsData) ? questionsData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeRequestType = availableRequestTypes.find(
          (requestType) => Number(requestType.idEstado) === 1,
        );
        const activeQuestion = availableQuestions.find((question) => Number(question.idEstado) === 1);

        setStates(availableStates);
        setRequestTypes(availableRequestTypes);
        setQuestions(availableQuestions);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idTipoSolicitud: String(activeRequestType?.idTipoSolicitud ?? ""),
            idPregunta: String(activeQuestion?.idPregunta ?? ""),
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

    const loadRequestQuestion = async () => {
      try {
        setDetailLoading(true);
        const detail = await requestQuestionsApi.getRequestQuestionByPk(
          idTipoSolicitud,
          idPregunta,
          { force: true },
        );
        setCurrentRequestQuestion(detail);
        reset(mapRequestQuestionToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la relacion tipo solicitud-pregunta",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/tipos-solicitud-pregunta");
      } finally {
        setDetailLoading(false);
      }
    };

    loadRequestQuestion();
  }, [idPregunta, idTipoSolicitud, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await requestQuestionsApi.updateRequestQuestion(
          idTipoSolicitud,
          idPregunta,
          buildUpdatePayload(values),
        );
      } else {
        await requestQuestionsApi.createRequestQuestion(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Relacion actualizada" : "Relacion creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La relacion tipo solicitud-pregunta fue creada correctamente.",
      });

      navigate("/dashboard/tipos-solicitud-pregunta");
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
          <h1>Tipo solicitud-pregunta</h1>
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
          <p className="dashboard-page__eyebrow">
            {isEditing ? "Editar relacion" : "Nueva relacion"}
          </p>
          <h1>{isEditing ? "Actualizar tipo solicitud-pregunta" : "Crear tipo solicitud-pregunta"}</h1>
          <p className="dashboard-page__lede">
            Define qué pregunta forma parte de un tipo de solicitud y controla el estado de esa
            relacion dentro del formulario.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/tipos-solicitud-pregunta">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Esta tabla compone el formulario base de cada tipo de solicitud. Las respuestas solo se
          pueden capturar si la pregunta sigue activa dentro de esta relacion.
        </div>

        <div className="dashboard-alert">
          Las relaciones nuevas siempre inician activas. Si la relacion ya tiene respuestas activas,
          el backend no permitira desactivarla.
        </div>

        <div className="dashboard-alert">
          Solo se muestran tipos de solicitud y preguntas activas al crear. Al editar se conserva
          la relacion actual aunque alguno de los registros haya quedado inactivo despues.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados, tipos de solicitud y preguntas disponibles para completar este
            formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Tipo de solicitud</span>
                  <select
                    className="form-select"
                    disabled={isEditing}
                    {...register("idTipoSolicitud", {
                      required: "El tipo de solicitud es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un tipo de solicitud</option>
                    {requestTypeOptions.map((requestType) => (
                      <option
                        key={requestType.idTipoSolicitud}
                        value={requestType.idTipoSolicitud}
                      >
                        {buildRequestTypeLabel(requestType)}
                      </option>
                    ))}
                  </select>
                  {errors.idTipoSolicitud ? <small>{errors.idTipoSolicitud.message}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Pregunta</span>
                  <select
                    className="form-select"
                    disabled={isEditing}
                    {...register("idPregunta", {
                      required: "La pregunta es obligatoria",
                    })}
                  >
                    <option value="">Selecciona una pregunta</option>
                    {questionOptions.map((question) => (
                      <option key={question.idPregunta} value={question.idPregunta}>
                        {buildQuestionLabel(question)}
                      </option>
                    ))}
                  </select>
                  {errors.idPregunta ? <small>{errors.idPregunta.message}</small> : null}
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

            {selectedRequestType ? (
              <p className="dashboard-muted">
                Tipo seleccionado: {buildRequestTypeLabel(selectedRequestType)}.
              </p>
            ) : null}

            {selectedQuestion ? (
              <p className="dashboard-muted">
                Pregunta seleccionada: {buildQuestionLabel(selectedQuestion)}
                {selectedQuestion.tipoRespuesta ? ` (${selectedQuestion.tipoRespuesta})` : ""}.
              </p>
            ) : null}

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear relacion"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/tipos-solicitud-pregunta">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default RequestQuestionFormPage;
