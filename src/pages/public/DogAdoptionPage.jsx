import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { submitAdoptionRequest } from "../../api/adoptionRequests";
import { getRequestTypes } from "../../api/catalogs";
import { getAvailableDogs, getDogById } from "../../api/dogs";
import { getActiveQuestionsByRequestType } from "../../api/requestQuestions";
import { useAuth } from "../../hooks/useAuth";

const ADOPTION_REQUEST_TYPE_NAME = "Adopcion";

const formatDate = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  try {
    return new Intl.DateTimeFormat("es-CR", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return "Sin fecha";
  }
};

const formatMetric = (value, suffix) => {
  if (value === undefined || value === null || value === "") {
    return "Sin dato";
  }

  return `${value} ${suffix}`;
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const buildEmptyAnswers = (questions) => ({
  answers: questions.reduce((accumulator, question) => {
    accumulator[question.idPregunta] = "";
    return accumulator;
  }, {}),
});

const getMultipleChoiceSuggestions = (question) => {
  const normalizedQuestion = normalizeText(question.pregunta);

  if (normalizedQuestion.includes("tipo de vivienda")) {
    return ["Casa", "Apartamento", "Finca"];
  }

  if (normalizedQuestion.includes("frecuencia") && normalizedQuestion.includes("paseos")) {
    return ["1 vez al dia", "2 veces al dia", "3 o mas veces al dia"];
  }

  if (normalizedQuestion.includes("dormira dentro o fuera")) {
    return ["Dentro de la casa", "Fuera de la casa"];
  }

  return [];
};

const getQuestionError = (errors, idPregunta) =>
  errors.answers?.[idPregunta]?.message ||
  errors.answers?.[String(idPregunta)]?.message ||
  "";

const findAdoptionRequestType = (requestTypes) => {
  const normalizedTarget = normalizeText(ADOPTION_REQUEST_TYPE_NAME);

  return (
    (Array.isArray(requestTypes) ? requestTypes : []).find(
      (requestType) => normalizeText(requestType.nombre) === normalizedTarget,
    ) ||
    (Array.isArray(requestTypes) ? requestTypes : []).find(
      (requestType) => Number(requestType.idTipoSolicitud) === 1,
    ) ||
    null
  );
};

const DogAdoptionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dogs, setDogs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [dogLoading, setDogLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      answers: {},
    },
  });

  const currentDogParam = searchParams.get("perrito");
  const initialDogParamRef = useRef(currentDogParam);

  useEffect(() => {
    document.title = "Formulario de adopcion | Adopciones Kalo";
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadPage = async () => {
      setPageLoading(true);
      setPageError("");

      try {
        const [nextDogs, nextRequestTypes] = await Promise.all([
          getAvailableDogs(),
          getRequestTypes(),
        ]);
        const adoptionRequestType = findAdoptionRequestType(nextRequestTypes);

        if (!adoptionRequestType) {
          throw new Error("No existe un tipo de solicitud de adopcion configurado.");
        }

        const nextQuestions = await getActiveQuestionsByRequestType(
          adoptionRequestType.idTipoSolicitud,
          { force: true },
        );

        if (ignore) {
          return;
        }

        setDogs(nextDogs);
        setQuestions(nextQuestions);
        reset(buildEmptyAnswers(nextQuestions));

        if (!nextDogs.length) {
          setSelectedDogId(null);
          setSelectedDog(null);
          return;
        }

        const requestedDogId = Number(initialDogParamRef.current);
        const requestedDog = nextDogs.find((dog) => Number(dog.idPerrito) === requestedDogId);
        setSelectedDogId((requestedDog || nextDogs[0]).idPerrito);
      } catch (error) {
        if (ignore) {
          return;
        }

        setPageError("No pudimos cargar los perritos y preguntas del formulario.");
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el formulario",
          text:
            error?.response?.data?.message ||
            "Intenta nuevamente en unos segundos para continuar con tu solicitud.",
        });
      } finally {
        if (!ignore) {
          setPageLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      ignore = true;
    };
  }, [reset]);

  useEffect(() => {
    if (!selectedDogId) {
      return;
    }

    if (currentDogParam === String(selectedDogId)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("perrito", String(selectedDogId));
    setSearchParams(nextParams, { replace: true });
  }, [currentDogParam, searchParams, selectedDogId, setSearchParams]);

  useEffect(() => {
    if (!selectedDogId) {
      setSelectedDog(null);
      return;
    }

    let ignore = false;

    const loadSelectedDog = async () => {
      setDogLoading(true);

      try {
        const dog = await getDogById(selectedDogId);

        if (!ignore) {
          setSelectedDog(dog);
        }
      } catch (error) {
        if (!ignore) {
          setSelectedDog(null);
          Swal.fire({
            icon: "error",
            title: "No pudimos cargar este perrito",
            text:
              error?.response?.data?.message ||
              "Selecciona otro perrito para continuar con el formulario.",
          });
        }
      } finally {
        if (!ignore) {
          setDogLoading(false);
        }
      }
    };

    loadSelectedDog();

    return () => {
      ignore = true;
    };
  }, [selectedDogId]);

  const onSubmit = async (values) => {
    if (!selectedDogId) {
      Swal.fire({
        icon: "info",
        title: "Selecciona un perrito",
        text: "Elige el perrito para el que quieres completar la solicitud.",
      });
      return;
    }

    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Necesitas iniciar sesion",
        text: "La solicitud se asocia a tu cuenta, asi que primero debes iniciar sesion o registrarte.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        idPerrito: selectedDogId,
        respuestas: questions.map((question) => ({
          idPregunta: question.idPregunta,
          respuesta: values.answers?.[question.idPregunta] ?? "",
        })),
      };

      const result = await submitAdoptionRequest(payload);

      reset(buildEmptyAnswers(questions));
      Swal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text: result?.estado
          ? `Tu solicitud para ${result.nombrePerrito} quedo en estado ${result.estado}.`
          : "Tu solicitud fue enviada correctamente y ya esta lista para revision.",
      });
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 401) {
        Swal.fire({
          icon: "info",
          title: "Tu sesion es necesaria",
          text: "Inicia sesion nuevamente para enviar la solicitud de adopcion.",
        });
      } else {
        Swal.fire({
          icon: statusCode === 409 ? "warning" : "error",
          title: "No pudimos enviar la solicitud",
          text:
            error?.response?.data?.message ||
            "Revisa tus respuestas e intenta nuevamente.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="adoption-page">
      <div className="container adoption-shell">
        <section className="adoption-hero">
          <div>
            <span className="adoption-pill">Formulario publico de adopcion</span>
            <h1>Elige un perrito, responde con calma y deja tu solicitud lista para revision.</h1>
            <p>
              Esta vista esta abierta para cualquier persona que use la app. La informacion del
              formulario se conecta con perritos, solicitudes, preguntas y respuestas del modulo de
              adopciones.
            </p>
          </div>

          <div className="adoption-hero__aside">
            <article>
              <strong>{dogs.length}</strong>
              <span>Perritos disponibles</span>
            </article>
            <article>
              <strong>{questions.length}</strong>
              <span>Preguntas activas</span>
            </article>
            <article>
              <strong>{isAuthenticated ? "Activa" : "Pendiente"}</strong>
              <span>{isAuthenticated ? "Sesion lista para enviar" : "Necesitas iniciar sesion para enviar"}</span>
            </article>
          </div>
        </section>

        {pageLoading ? (
          <div className="adoption-empty">Cargando formulario de adopcion...</div>
        ) : pageError ? (
          <div className="adoption-empty adoption-empty--error">{pageError}</div>
        ) : !dogs.length ? (
          <div className="adoption-empty">
            No hay perritos disponibles para adopcion en este momento.
          </div>
        ) : (
          <div className="adoption-layout">
            <aside className="adoption-panel adoption-panel--catalog">
              <div className="adoption-panel__header">
                <div>
                  <p className="adoption-panel__eyebrow">Perritos</p>
                  <h2>Selecciona un companero</h2>
                </div>
                <span className="adoption-counter">{dogs.length} opciones</span>
              </div>

              <div className="adoption-dog-grid">
                {dogs.map((dog) => (
                  <button
                    key={dog.idPerrito}
                    className={`adoption-dog-card${Number(selectedDogId) === Number(dog.idPerrito) ? " is-selected" : ""}`}
                    onClick={() => setSelectedDogId(dog.idPerrito)}
                    type="button"
                  >
                    <div
                      className="adoption-dog-card__image"
                      style={{
                        backgroundImage: dog.imageUrl
                          ? `linear-gradient(180deg, rgba(9, 18, 29, 0.12), rgba(9, 18, 29, 0.42)), url("${dog.imageUrl}")`
                          : undefined,
                      }}
                    />
                    <div className="adoption-dog-card__body">
                      <strong>{dog.nombre}</strong>
                      <span>{dog.raza || "Raza sin registrar"}</span>
                      <small>
                        {dog.sexo || "Sexo sin registrar"} - {dog.edad ?? "?"} anos
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <div className="adoption-main-column">
              <section className="adoption-panel adoption-panel--dog">
                <div className="adoption-panel__header">
                  <div>
                    <p className="adoption-panel__eyebrow">Ficha</p>
                    <h2>{selectedDog?.nombre || "Perrito seleccionado"}</h2>
                  </div>
                  {dogLoading && <span className="adoption-counter">Cargando detalle...</span>}
                </div>

                {selectedDog ? (
                  <div className="adoption-dog-detail">
                    <div className="adoption-dog-detail__media">
                      <div
                        className="adoption-dog-detail__hero"
                        style={{
                          backgroundImage: selectedDog.imageUrl
                            ? `linear-gradient(180deg, rgba(8, 16, 25, 0.05), rgba(8, 16, 25, 0.36)), url("${selectedDog.imageUrl}")`
                            : undefined,
                        }}
                      />
                      {selectedDog.images?.length ? (
                        <div className="adoption-dog-detail__thumbs">
                          {selectedDog.images.slice(0, 4).map((image) => (
                            <div
                              key={image.idImagen}
                              className="adoption-dog-detail__thumb"
                              style={{
                                backgroundImage: `linear-gradient(180deg, rgba(8, 16, 25, 0.08), rgba(8, 16, 25, 0.28)), url("${image.imageUrl}")`,
                              }}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="adoption-dog-detail__content">
                      <p className="adoption-dog-detail__lead">
                        Completa el formulario pensando especificamente en {selectedDog.nombre}. La
                        solicitud quedara vinculada a este perrito y a tu cuenta.
                      </p>

                      <div className="adoption-dog-detail__meta">
                        <article>
                          <span>Raza</span>
                          <strong>{selectedDog.raza || "Sin dato"}</strong>
                        </article>
                        <article>
                          <span>Sexo</span>
                          <strong>{selectedDog.sexo || "Sin dato"}</strong>
                        </article>
                        <article>
                          <span>Edad</span>
                          <strong>{formatMetric(selectedDog.edad, "anos")}</strong>
                        </article>
                        <article>
                          <span>Peso</span>
                          <strong>{formatMetric(selectedDog.peso, "kg")}</strong>
                        </article>
                        <article>
                          <span>Estatura</span>
                          <strong>{formatMetric(selectedDog.estatura, "cm")}</strong>
                        </article>
                        <article>
                          <span>Ingreso</span>
                          <strong>{formatDate(selectedDog.fechaIngreso)}</strong>
                        </article>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="adoption-empty">Selecciona un perrito para ver su detalle.</div>
                )}
              </section>

              <section className="adoption-panel adoption-panel--form">
                <div className="adoption-panel__header">
                  <div>
                    <p className="adoption-panel__eyebrow">Solicitud</p>
                    <h2>Formulario de adopcion</h2>
                  </div>
                  <span className="adoption-counter">{questions.length} respuestas</span>
                </div>

                {authLoading ? (
                  <div className="adoption-empty">Verificando tu sesion...</div>
                ) : isAuthenticated ? (
                  <div className="adoption-user-banner adoption-user-banner--ready">
                    <strong>{[user?.nombre, user?.apellidoPaterno].filter(Boolean).join(" ") || user?.usuario}</strong>
                    <span>
                      La solicitud se enviara con la cuenta {user?.correo || user?.usuario || "actual"}.
                    </span>
                  </div>
                ) : (
                  <div className="adoption-user-banner">
                    <strong>Necesitas una cuenta para enviar la solicitud</strong>
                    <span>
                      Puedes revisar el formulario completo ahora mismo y, cuando estes listo,
                      iniciar sesion o registrarte para enviarlo.
                    </span>
                    <div className="adoption-user-banner__actions">
                      <Link className="home-btn home-btn--primary" to="/login">
                        Iniciar sesion
                      </Link>
                      <Link className="dashboard-btn dashboard-btn--ghost" to="/signup">
                        Crear cuenta
                      </Link>
                    </div>
                  </div>
                )}

                <form className="adoption-form" onSubmit={handleSubmit(onSubmit)}>
                  {questions.map((question) => {
                    const fieldName = `answers.${question.idPregunta}`;
                    const normalizedType = normalizeText(question.tipoRespuesta);
                    const questionError = getQuestionError(errors, question.idPregunta);
                    const suggestions =
                      normalizedType === "opcion multiple"
                        ? getMultipleChoiceSuggestions(question)
                        : [];
                    const currentValue = watch(fieldName);

                    return (
                      <fieldset key={question.idPregunta} className="adoption-question">
                        <legend>
                          {question.pregunta}
                        </legend>

                        {normalizedType === "boolean" ? (
                          <div className="adoption-choice-list">
                            <label className="adoption-choice">
                              <input
                                {...register(fieldName, {
                                  required: "Esta pregunta es obligatoria",
                                })}
                                type="radio"
                                value="Si"
                              />
                              <span>Si</span>
                            </label>

                            <label className="adoption-choice">
                              <input
                                {...register(fieldName, {
                                  required: "Esta pregunta es obligatoria",
                                })}
                                type="radio"
                                value="No"
                              />
                              <span>No</span>
                            </label>
                          </div>
                        ) : normalizedType === "number" ? (
                          <input
                            {...register(fieldName, {
                              required: "Esta pregunta es obligatoria",
                              validate: (value) =>
                                Number.isFinite(Number(value)) || "Ingresa un valor numerico valido",
                            })}
                            className="form-control"
                            type="number"
                            inputMode="number"
                            min="0"
                            step="1"
                          />
                        ) : normalizedType === "text" ? (
                          <textarea
                            {...register(fieldName, {
                              required: "Esta pregunta es obligatoria",
                              maxLength: {
                                value: 500,
                                message: "La respuesta no puede superar los 500 caracteres",
                              },
                            })}
                            className="form-control"
                            rows="4"
                          />
                        ) : normalizedType === "opcion multiple" ? (
                          <>
                            <input
                              {...register(fieldName, {
                                required: "Esta pregunta es obligatoria",
                                maxLength: {
                                  value: 500,
                                  message: "La respuesta no puede superar los 500 caracteres",
                                },
                              })}
                              className="form-control"
                              type="text"
                              placeholder="Selecciona o escribe una opcion"
                            />

                            {suggestions.length ? (
                              <div className="adoption-suggestion-list">
                                {suggestions.map((suggestion) => (
                                  <button
                                    key={suggestion}
                                    type="button"
                                    className={`adoption-suggestion${currentValue === suggestion ? " is-selected" : ""}`}
                                    onClick={() =>
                                      setValue(fieldName, suggestion, {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      })
                                    }
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <input
                            {...register(fieldName, {
                              required: "Esta pregunta es obligatoria",
                              maxLength: {
                                value: 500,
                                message: "La respuesta no puede superar los 500 caracteres",
                              },
                            })}
                            className="form-control"
                            type="text"
                          />
                        )}

                        {questionError ? <small className="text-danger">{questionError}</small> : null}
                      </fieldset>
                    );
                  })}

                  <div className="adoption-form__footer">
                    <p>
                      Al enviar, tu solicitud quedara asociada al perrito seleccionado y a tu cuenta
                      actual para que el equipo pueda darle seguimiento.
                    </p>
                    <button
                      className="home-btn home-btn--primary"
                      disabled={submitting || !questions.length || !isAuthenticated || authLoading}
                      type="submit"
                    >
                      {submitting
                        ? "Enviando solicitud..."
                        : !isAuthenticated
                          ? "Inicia sesion para enviar"
                          : "Enviar solicitud"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DogAdoptionPage;
