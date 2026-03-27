import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getDogById } from "../../api/dogs";
import { createEvidence, getEvidencesByFollowUp } from "../../api/evidences";
import { getCurrentProfileFollowUps } from "../../api/profile";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  fechaEvidencia: "",
  estadoGeneral: "",
  alimentacionDescanso: "",
  saludComportamiento: "",
  detalleRutina: "",
};

const STATUS_SUGGESTIONS = [
  "Alegre y con buena energia",
  "Tranquilo y adaptandose bien",
  "Un poco sensible, pero estable",
];

const FEEDING_SUGGESTIONS = [
  "Come y descansa con normalidad",
  "Ha tenido cambios leves",
  "Necesita revision o apoyo",
];

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

const getTodayDateValue = () => new Date().toISOString().slice(0, 10);

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) {
    return String(value).trim();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

const getClampedEvidenceDate = (followUp) => {
  const start = toDateInputValue(followUp?.fechaInicio);
  const end = toDateInputValue(followUp?.fechaFin);
  const today = getTodayDateValue();

  if (!start || !end) {
    return today;
  }

  if (today < start) {
    return start;
  }

  if (today > end) {
    return end;
  }

  return today;
};

const buildDisplayName = (user) =>
  [user?.nombre, user?.apellidoPaterno].filter(Boolean).join(" ") || user?.usuario || "tu cuenta";

const buildEvidenceComment = (values) => {
  const estadoGeneral = String(values.estadoGeneral || "").trim();
  const alimentacionDescanso = String(values.alimentacionDescanso || "").trim();
  const saludComportamiento = String(values.saludComportamiento || "").trim();
  const detalleRutina = String(values.detalleRutina || "").trim();

  return [
    estadoGeneral ? `Estado general: ${estadoGeneral}` : null,
    alimentacionDescanso ? `Alimentacion y descanso: ${alimentacionDescanso}` : null,
    saludComportamiento ? `Salud y comportamiento: ${saludComportamiento}` : null,
    detalleRutina ? `Rutina y adaptacion: ${detalleRutina}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

const getFollowUpTone = (followUp) => {
  const today = getTodayDateValue();
  const start = toDateInputValue(followUp?.fechaInicio);
  const end = toDateInputValue(followUp?.fechaFin);
  const hasResponses = Number(followUp?.cantidadEvidencias || 0) > 0;

  if (Number(followUp?.idEstado) !== 1) {
    return {
      label: "Seguimiento no disponible",
      accent: "muted",
      canSubmit: false,
      description: "Este seguimiento ya no admite nuevas respuestas desde el perfil.",
    };
  }

  if (start && today < start) {
    return {
      label: `Disponible desde ${formatDate(start)}`,
      accent: "soft",
      canSubmit: false,
      description: "Podras responder cuando inicie la ventana programada por el equipo.",
    };
  }

  if (end && today > end) {
    return {
      label: hasResponses ? "Ventana cerrada con respuestas" : "Ventana cerrada",
      accent: "warning",
      canSubmit: true,
      description: "Todavia puedes registrar una respuesta tardia usando una fecha dentro del rango.",
    };
  }

  if (hasResponses) {
    return {
      label: "Seguimiento con respuestas",
      accent: "success",
      canSubmit: true,
      description: "Puedes subir una nueva evidencia si quieres ampliar el seguimiento.",
    };
  }

  return {
    label: "Pendiente de responder",
    accent: "pending",
    canSubmit: true,
    description: "Completa el formulario para dejar evidencia de como va la adopcion.",
  };
};

const buildDogCards = ({ followUps, requestedDogId, requestedDogName }) => {
  const dogMap = new Map();

  followUps.forEach((followUp) => {
    const dogId = Number(followUp.idPerrito);

    if (!dogId) {
      return;
    }

    const current = dogMap.get(dogId) || {
      idPerrito: dogId,
      nombrePerrito: followUp.nombrePerrito || `Perrito #${dogId}`,
      followUps: [],
      totalEvidencias: 0,
      latestActivity: null,
    };

    current.followUps.push(followUp);
    current.totalEvidencias += Number(followUp.cantidadEvidencias || 0);

    const latestDate =
      followUp.ultimaFechaEvidencia || followUp.fechaFin || followUp.fechaInicio || null;
    if (!current.latestActivity || String(latestDate || "") > String(current.latestActivity || "")) {
      current.latestActivity = latestDate;
    }

    dogMap.set(dogId, current);
  });

  if (requestedDogId && !dogMap.has(Number(requestedDogId))) {
    dogMap.set(Number(requestedDogId), {
      idPerrito: Number(requestedDogId),
      nombrePerrito: requestedDogName || `Perrito #${requestedDogId}`,
      followUps: [],
      totalEvidencias: 0,
      latestActivity: null,
    });
  }

  return Array.from(dogMap.values()).sort((left, right) => {
    const leftActivity = String(left.latestActivity || "");
    const rightActivity = String(right.latestActivity || "");

    if (leftActivity !== rightActivity) {
      return rightActivity.localeCompare(leftActivity);
    }

    return normalizeText(left.nombrePerrito).localeCompare(normalizeText(right.nombrePerrito));
  });
};

const FollowUpPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState(null);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [dogLoading, setDogLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [evidences, setEvidences] = useState([]);
  const requestedDogId = Number(searchParams.get("perrito") || 0) || null;
  const requestedFollowUpId = Number(searchParams.get("seguimiento") || 0) || null;
  const requestedAdoptionId = Number(searchParams.get("adopcion") || 0) || null;
  const requestedDogName = searchParams.get("nombre") || "";
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedValues = watch();
  const commentPreview = useMemo(() => buildEvidenceComment(watchedValues), [watchedValues]);
  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const dogCards = useMemo(
    () =>
      buildDogCards({
        followUps,
        requestedDogId,
        requestedDogName,
      }),
    [followUps, requestedDogId, requestedDogName],
  );

  const selectedDogFollowUps = useMemo(
    () => followUps.filter((followUp) => Number(followUp.idPerrito) === Number(selectedDogId)),
    [followUps, selectedDogId],
  );

  const selectedFollowUp = useMemo(
    () =>
      selectedDogFollowUps.find(
        (followUp) => Number(followUp.idSeguimiento) === Number(selectedFollowUpId),
      ) || null,
    [selectedDogFollowUps, selectedFollowUpId],
  );

  const selectedDogCard = useMemo(
    () => dogCards.find((dog) => Number(dog.idPerrito) === Number(selectedDogId)) || null,
    [dogCards, selectedDogId],
  );

  const followUpTone = useMemo(() => getFollowUpTone(selectedFollowUp), [selectedFollowUp]);
  const totalAnsweredFollowUps = useMemo(
    () => followUps.filter((followUp) => Number(followUp.cantidadEvidencias || 0) > 0).length,
    [followUps],
  );

  useEffect(() => {
    document.title = "Seguimiento | Adopciones Kalo";
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!selectedFollowUp) {
      reset(EMPTY_FORM);
      return;
    }

    reset({
      ...EMPTY_FORM,
      fechaEvidencia: getClampedEvidenceDate(selectedFollowUp),
    });
    setSelectedFile(null);
  }, [reset, selectedFollowUp]);

  useEffect(() => {
    if (!selectedDogId) {
      setSelectedDog(null);
      return;
    }

    let ignore = false;

    const loadSelectedDog = async () => {
      setDogLoading(true);

      try {
        const dog = await getDogById(selectedDogId, { force: true });

        if (!ignore) {
          setSelectedDog(dog);
        }
      } catch (error) {
        if (!ignore) {
          setSelectedDog(null);
          Swal.fire({
            icon: "warning",
            title: "No pudimos cargar el detalle del perrito",
            text:
              error?.response?.data?.message ||
              "La vista seguira disponible con la informacion del seguimiento.",
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

  useEffect(() => {
    if (!selectedFollowUp?.idSeguimiento) {
      setEvidences([]);
      return;
    }

    let ignore = false;

    const loadEvidences = async () => {
      setHistoryLoading(true);

      try {
        const data = await getEvidencesByFollowUp(selectedFollowUp.idSeguimiento, { force: true });

        if (!ignore) {
          setEvidences(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setEvidences([]);
          Swal.fire({
            icon: "error",
            title: "No pudimos cargar las respuestas previas",
            text:
              error?.response?.data?.message ||
              "Intenta nuevamente para revisar el historial de seguimiento.",
          });
        }
      } finally {
        if (!ignore) {
          setHistoryLoading(false);
        }
      }
    };

    loadEvidences();

    return () => {
      ignore = true;
    };
  }, [selectedFollowUp?.idSeguimiento]);

  useEffect(() => {
    let ignore = false;

    const loadFollowUps = async () => {
      setPageLoading(true);
      setPageError("");

      try {
        const data = await getCurrentProfileFollowUps({ force: true });
        const nextFollowUps = Array.isArray(data) ? data : [];

        if (ignore) {
          return;
        }

        setFollowUps(nextFollowUps);

        const preferredFollowUp =
          nextFollowUps.find(
            (followUp) => Number(followUp.idSeguimiento) === Number(requestedFollowUpId),
          ) ||
          nextFollowUps.find(
            (followUp) =>
              Number(followUp.idAdopcion) === Number(requestedAdoptionId) &&
              Number(followUp.idPerrito) === Number(requestedDogId),
          ) ||
          nextFollowUps.find((followUp) => Number(followUp.idPerrito) === Number(requestedDogId)) ||
          nextFollowUps[0] ||
          null;

        const nextDogId = preferredFollowUp?.idPerrito || requestedDogId || null;
        const nextSelectedFollowUpId =
          preferredFollowUp?.idSeguimiento ||
          nextFollowUps.find((followUp) => Number(followUp.idPerrito) === Number(nextDogId))
            ?.idSeguimiento ||
          null;

        setSelectedDogId(nextDogId);
        setSelectedFollowUpId(nextSelectedFollowUpId);
      } catch (error) {
        if (ignore) {
          return;
        }

        setPageError("No pudimos cargar tus seguimientos de adopcion.");
        Swal.fire({
          icon: "error",
          title: "Seguimiento no disponible",
          text:
            error?.response?.data?.message ||
            "Intenta nuevamente en unos segundos para revisar tus seguimientos.",
        });
      } finally {
        if (!ignore) {
          setPageLoading(false);
        }
      }
    };

    loadFollowUps();

    return () => {
      ignore = true;
    };
  }, [requestedAdoptionId, requestedDogId, requestedFollowUpId]);

  useEffect(() => {
    if (!followUps.length && requestedDogId && !selectedDogId) {
      setSelectedDogId(requestedDogId);
      return;
    }

    if (!selectedDogId && dogCards.length) {
      setSelectedDogId(dogCards[0].idPerrito);
      return;
    }

    if (
      selectedDogId &&
      dogCards.length &&
      !dogCards.some((dog) => Number(dog.idPerrito) === Number(selectedDogId))
    ) {
      setSelectedDogId(dogCards[0].idPerrito);
    }
  }, [dogCards, followUps.length, requestedDogId, selectedDogId]);

  useEffect(() => {
    if (!selectedDogId) {
      setSelectedFollowUpId(null);
      return;
    }

    if (!selectedDogFollowUps.length) {
      setSelectedFollowUpId(null);
      return;
    }

    const hasSelectedFollowUp = selectedDogFollowUps.some(
      (followUp) => Number(followUp.idSeguimiento) === Number(selectedFollowUpId),
    );

    if (!hasSelectedFollowUp) {
      setSelectedFollowUpId(selectedDogFollowUps[0].idSeguimiento);
    }
  }, [selectedDogFollowUps, selectedDogId, selectedFollowUpId]);

  useEffect(() => {
    const nextDogParam = selectedDogId ? String(selectedDogId) : "";
    const nextFollowUpParam = selectedFollowUpId ? String(selectedFollowUpId) : "";
    const nextAdoptionParam = selectedFollowUp?.idAdopcion ? String(selectedFollowUp.idAdopcion) : "";
    const nextNameParam = selectedDog?.nombre || selectedDogCard?.nombrePerrito || "";

    const currentDogParam = searchParams.get("perrito") || "";
    const currentFollowUpParam = searchParams.get("seguimiento") || "";
    const currentAdoptionParam = searchParams.get("adopcion") || "";
    const currentNameParam = searchParams.get("nombre") || "";

    if (
      currentDogParam === nextDogParam &&
      currentFollowUpParam === nextFollowUpParam &&
      currentAdoptionParam === nextAdoptionParam &&
      currentNameParam === nextNameParam
    ) {
      return;
    }

    const nextParams = new URLSearchParams();

    if (nextDogParam) {
      nextParams.set("perrito", nextDogParam);
    }

    if (nextAdoptionParam) {
      nextParams.set("adopcion", nextAdoptionParam);
    }

    if (nextFollowUpParam) {
      nextParams.set("seguimiento", nextFollowUpParam);
    }

    if (nextNameParam) {
      nextParams.set("nombre", nextNameParam);
    }

    setSearchParams(nextParams, { replace: true });
  }, [
    searchParams,
    selectedDog?.nombre,
    selectedDogCard?.nombrePerrito,
    selectedDogId,
    selectedFollowUp?.idAdopcion,
    selectedFollowUpId,
    setSearchParams,
  ]);

  const refreshFollowUpData = async () => {
    const [nextFollowUps, nextEvidences] = await Promise.all([
      getCurrentProfileFollowUps({ force: true }),
      selectedFollowUp?.idSeguimiento
        ? getEvidencesByFollowUp(selectedFollowUp.idSeguimiento, { force: true })
        : Promise.resolve([]),
    ]);

    setFollowUps(Array.isArray(nextFollowUps) ? nextFollowUps : []);
    setEvidences(Array.isArray(nextEvidences) ? nextEvidences : []);
  };

  const handleSelectDog = (dogId) => {
    setSelectedDogId(dogId);
    const firstFollowUp = followUps.find((followUp) => Number(followUp.idPerrito) === Number(dogId));
    setSelectedFollowUpId(firstFollowUp?.idSeguimiento || null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const onSubmit = async (values) => {
    if (!selectedFollowUp?.idSeguimiento) {
      Swal.fire({
        icon: "info",
        title: "Selecciona un seguimiento",
        text: "Primero elige el seguimiento del perrito que quieres responder.",
      });
      return;
    }

    if (!followUpTone.canSubmit) {
      Swal.fire({
        icon: "info",
        title: "Este seguimiento aun no esta disponible",
        text: followUpTone.description,
      });
      return;
    }

    const comments = buildEvidenceComment(values);

    if (!comments) {
      Swal.fire({
        icon: "warning",
        title: "Completa las preguntas",
        text: "Necesitamos al menos tus respuestas del formulario para registrar el seguimiento.",
      });
      return;
    }

    if (comments.length > 500) {
      Swal.fire({
        icon: "warning",
        title: "Tus respuestas son muy largas",
        text: "Resume un poco las respuestas para no superar los 500 caracteres permitidos.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      formData.append("idSeguimiento", String(selectedFollowUp.idSeguimiento));
      formData.append("fechaEvidencia", values.fechaEvidencia);
      formData.append("comentarios", comments);
      formData.append("idEstado", "1");

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await createEvidence(formData);
      await refreshFollowUpData();
      reset({
        ...EMPTY_FORM,
        fechaEvidencia: getClampedEvidenceDate(selectedFollowUp),
      });
      setSelectedFile(null);

      Swal.fire({
        icon: "success",
        title: "Seguimiento registrado",
        text: "Tu respuesta quedo guardada correctamente para este perrito.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar tu respuesta",
        text:
          error?.response?.data?.message ||
          "Revisa los datos del formulario e intenta nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="adoption-page followup-page">
      <div className="container adoption-shell followup-shell">
        <section className="adoption-hero followup-hero">
          <span className="hero-deco" aria-hidden="true">Seguimiento</span>

          <div>
            <span className="adoption-pill">Seguimiento de adopcion</span>
            <h1>
              Acompana la adopcion de{" "}
              <em className="hero-highlight">
                {selectedDog?.nombre || selectedDogCard?.nombrePerrito || "tu perrito"}
              </em>.
            </h1>
            <p>
              Revisa los seguimientos programados para {buildDisplayName(user)} y responde cada
              etapa con informacion clara, fechas correctas y, si quieres, una imagen de apoyo.
            </p>
          </div>

          <div className="adoption-hero__aside">
            <article>
              <strong>{dogCards.length}</strong>
              <span>Perritos con seguimiento</span>
            </article>
            <article>
              <strong>{followUps.length}</strong>
              <span>Seguimientos programados</span>
            </article>
            <article>
              <strong>{totalAnsweredFollowUps}</strong>
              <span>Seguimientos con respuestas</span>
            </article>
          </div>
        </section>

        {pageLoading ? (
          <div className="adoption-empty">Cargando tus seguimientos...</div>
        ) : pageError ? (
          <div className="adoption-empty adoption-empty--error">{pageError}</div>
        ) : (
          <div className="adoption-layout followup-layout">
            <aside className="adoption-panel followup-sidebar">
              <div className="adoption-panel__header">
                <div>
                  <p className="adoption-panel__eyebrow">Tus perritos</p>
                  <h2>Selecciona un companero</h2>
                </div>
                <span className="adoption-counter">{dogCards.length} con seguimiento</span>
              </div>

              {!dogCards.length ? (
                <div className="adoption-empty">
                  Aun no tienes seguimientos activos o historicos registrados para tus adopciones.
                </div>
              ) : (
                <div className="followup-dog-list">
                  {dogCards.map((dog) => (
                    <button
                      key={dog.idPerrito}
                      className={`followup-dog-card${Number(selectedDogId) === Number(dog.idPerrito) ? " is-selected" : ""}`}
                      onClick={() => handleSelectDog(dog.idPerrito)}
                      type="button"
                    >
                      <div className="followup-dog-card__body">
                        <strong>{dog.nombrePerrito || `Perrito #${dog.idPerrito}`}</strong>
                        <span>{dog.followUps.length} seguimientos programados</span>
                        <small>{dog.totalEvidencias} respuestas registradas</small>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="followup-sidebar__footer">
                <Link className="dashboard-btn dashboard-btn--ghost" to="/perfil">
                  Volver a mi perfil
                </Link>
              </div>
            </aside>

            <div className="adoption-main-column">
              <section className="adoption-panel followup-panel">
                <div className="adoption-panel__header">
                  <div>
                    <p className="adoption-panel__eyebrow">Ficha del perrito</p>
                    <h2>
                      {selectedDog?.nombre ||
                        selectedDogCard?.nombrePerrito ||
                        "Selecciona un perrito"}
                    </h2>
                  </div>
                  {dogLoading ? <span className="adoption-counter">Cargando detalle...</span> : null}
                </div>

                {selectedDogId ? (
                  <div className="adoption-dog-detail">
                    <div className="adoption-dog-detail__media">
                      <div
                        className="adoption-dog-detail__hero"
                        style={{
                          backgroundImage: selectedDog?.imageUrl
                            ? `linear-gradient(180deg, rgba(8, 16, 25, 0.08), rgba(8, 16, 25, 0.35)), url("${selectedDog.imageUrl}")`
                            : undefined,
                        }}
                      />
                      {selectedDog?.images?.length ? (
                        <div className="adoption-dog-detail__thumbs">
                          {selectedDog.images.slice(0, 4).map((image) => (
                            <div
                              key={image.idImagen}
                              className="adoption-dog-detail__thumb"
                              style={{
                                backgroundImage: `linear-gradient(180deg, rgba(8, 16, 25, 0.08), rgba(8, 16, 25, 0.24)), url("${image.imageUrl}")`,
                              }}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="adoption-dog-detail__content">
                      <p className="adoption-dog-detail__lead">
                        Cada seguimiento queda asociado a este perrito y a tu cuenta. Puedes
                        responder las preguntas del formulario y revisar tus respuestas previas en
                        una sola vista.
                      </p>

                      <div className="adoption-dog-detail__meta">
                        <article>
                          <span>Raza</span>
                          <strong>{selectedDog?.raza || "Sin dato"}</strong>
                        </article>
                        <article>
                          <span>Sexo</span>
                          <strong>{selectedDog?.sexo || "Sin dato"}</strong>
                        </article>
                        <article>
                          <span>Edad</span>
                          <strong>{formatMetric(selectedDog?.edad, "anos")}</strong>
                        </article>
                        <article>
                          <span>Peso</span>
                          <strong>{formatMetric(selectedDog?.peso, "kg")}</strong>
                        </article>
                        <article>
                          <span>Estatura</span>
                          <strong>{formatMetric(selectedDog?.estatura, "cm")}</strong>
                        </article>
                        <article>
                          <span>Ingreso</span>
                          <strong>{formatDate(selectedDog?.fechaIngreso)}</strong>
                        </article>
                      </div>

                      <div className="followup-subsection">
                        <span className="followup-subsection__title">Seguimientos de este perrito</span>
                        {!selectedDogFollowUps.length ? (
                          <div className="adoption-empty">
                            Todavia no hay seguimientos programados para este perrito. Cuando el
                            equipo cree uno, aparecera aqui automaticamente.
                          </div>
                        ) : (
                          <div className="followup-card-list">
                            {selectedDogFollowUps.map((followUp) => {
                              const tone = getFollowUpTone(followUp);
                              return (
                                <button
                                  key={followUp.idSeguimiento}
                                  className={`followup-card${Number(selectedFollowUpId) === Number(followUp.idSeguimiento) ? " is-selected" : ""}`}
                                  onClick={() => setSelectedFollowUpId(followUp.idSeguimiento)}
                                  type="button"
                                >
                                  <div className="followup-card__header">
                                    <strong>
                                      {followUp.tipoSeguimiento || `Seguimiento #${followUp.idSeguimiento}`}
                                    </strong>
                                    <span className={`followup-badge followup-badge--${tone.accent}`}>
                                      {tone.label}
                                    </span>
                                  </div>
                                  <span>
                                    Ventana: {formatDate(followUp.fechaInicio)} al{" "}
                                    {formatDate(followUp.fechaFin)}
                                  </span>
                                  <small>{followUp.cantidadEvidencias} respuestas registradas</small>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="adoption-empty">
                    Selecciona un perrito para revisar sus seguimientos disponibles.
                  </div>
                )}
              </section>

              <section className="adoption-panel followup-panel">
                <div className="adoption-panel__header">
                  <div>
                    <p className="adoption-panel__eyebrow">Formulario de seguimiento</p>
                    <h2>{selectedFollowUp?.tipoSeguimiento || "Selecciona un seguimiento"}</h2>
                  </div>
                  {selectedFollowUp ? <span className="adoption-counter">#{selectedFollowUp.idSeguimiento}</span> : null}
                </div>

                {!selectedFollowUp ? (
                  <div className="adoption-empty">
                    Cuando elijas un seguimiento podras responder las preguntas y subir tu evidencia.
                  </div>
                ) : (
                  <>
                    <div className={`followup-banner followup-banner--${followUpTone.accent}`}>
                      <strong>{followUpTone.label}</strong>
                      <span>{followUpTone.description}</span>
                    </div>

                    {selectedFollowUp.comentarios ? (
                      <div className="followup-guidance">
                        <strong>Indicaciones del equipo</strong>
                        <p>{selectedFollowUp.comentarios}</p>
                      </div>
                    ) : null}

                    <form className="adoption-form" onSubmit={handleSubmit(onSubmit)}>
                      <fieldset className="followup-form-fieldset" disabled={submitting || !followUpTone.canSubmit}>
                        <label className="followup-date-field">
                          <span>Fecha que deseas registrar</span>
                          <input
                            {...register("fechaEvidencia", {
                              required: "La fecha es obligatoria",
                              validate: (value) => {
                                const minDate = toDateInputValue(selectedFollowUp.fechaInicio);
                                const maxDate = toDateInputValue(selectedFollowUp.fechaFin);

                                if (minDate && value < minDate) {
                                  return "La fecha no puede ser anterior al inicio del seguimiento";
                                }

                                if (maxDate && value > maxDate) {
                                  return "La fecha no puede ser posterior al fin del seguimiento";
                                }

                                return true;
                              },
                            })}
                            className={`form-control ${errors.fechaEvidencia ? "is-invalid" : ""}`}
                            max={toDateInputValue(selectedFollowUp.fechaFin)}
                            min={toDateInputValue(selectedFollowUp.fechaInicio)}
                            type="date"
                          />
                          {errors.fechaEvidencia ? <small className="text-danger">{errors.fechaEvidencia.message}</small> : null}
                        </label>

                        <fieldset className="adoption-question">
                          <legend>Como ha estado tu perrito desde la ultima revision?</legend>
                          <input
                            {...register("estadoGeneral", {
                              required: "Esta respuesta es obligatoria",
                              maxLength: {
                                value: 80,
                                message: "Resume esta respuesta en un maximo de 80 caracteres",
                              },
                            })}
                            className={`form-control ${errors.estadoGeneral ? "is-invalid" : ""}`}
                            placeholder="Ej. Alegre, activo y con buena adaptacion"
                            type="text"
                          />
                          <div className="adoption-suggestion-list">
                            {STATUS_SUGGESTIONS.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                className={`adoption-suggestion${watchedValues.estadoGeneral === suggestion ? " is-selected" : ""}`}
                                onClick={() =>
                                  setValue("estadoGeneral", suggestion, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                }
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                          {errors.estadoGeneral ? <small className="text-danger">{errors.estadoGeneral.message}</small> : null}
                        </fieldset>

                        <fieldset className="adoption-question">
                          <legend>Como han ido su alimentacion y descanso?</legend>
                          <div className="adoption-suggestion-list">
                            {FEEDING_SUGGESTIONS.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                className={`adoption-suggestion${watchedValues.alimentacionDescanso === suggestion ? " is-selected" : ""}`}
                                onClick={() =>
                                  setValue("alimentacionDescanso", suggestion, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                }
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                          <input
                            {...register("alimentacionDescanso", {
                              required: "Selecciona o escribe una respuesta",
                              maxLength: {
                                value: 80,
                                message: "Resume esta respuesta en un maximo de 80 caracteres",
                              },
                            })}
                            className={`form-control ${errors.alimentacionDescanso ? "is-invalid" : ""}`}
                            placeholder="Ej. Come bien y duerme tranquilo"
                            type="text"
                          />
                          {errors.alimentacionDescanso ? <small className="text-danger">{errors.alimentacionDescanso.message}</small> : null}
                        </fieldset>

                        <fieldset className="adoption-question">
                          <legend>Has notado algo sobre su salud o comportamiento que debamos conocer?</legend>
                          <textarea
                            {...register("saludComportamiento", {
                              required: "Esta respuesta es obligatoria",
                              maxLength: {
                                value: 140,
                                message: "Resume esta respuesta en un maximo de 140 caracteres",
                              },
                            })}
                            className={`form-control ${errors.saludComportamiento ? "is-invalid" : ""}`}
                            rows="4"
                          />
                          {errors.saludComportamiento ? <small className="text-danger">{errors.saludComportamiento.message}</small> : null}
                        </fieldset>

                        <fieldset className="adoption-question">
                          <legend>Que cambios o avances notas en su rutina y adaptacion al hogar?</legend>
                          <textarea
                            {...register("detalleRutina", {
                              required: "Esta respuesta es obligatoria",
                              maxLength: {
                                value: 140,
                                message: "Resume esta respuesta en un maximo de 140 caracteres",
                              },
                            })}
                            className={`form-control ${errors.detalleRutina ? "is-invalid" : ""}`}
                            rows="4"
                          />
                          {errors.detalleRutina ? <small className="text-danger">{errors.detalleRutina.message}</small> : null}
                        </fieldset>

                        <label className="followup-upload-field">
                          <span>Imagen opcional de apoyo</span>
                          <input
                            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                            className="form-control"
                            onChange={handleFileChange}
                            type="file"
                          />
                        </label>

                        {previewUrl ? (
                          <div className="followup-preview">
                            <strong>Vista previa</strong>
                            <img alt="Vista previa de la evidencia" src={previewUrl} />
                          </div>
                        ) : null}

                        <div className="followup-comment-preview">
                          <strong>Resumen que se guardara</strong>
                          <pre>{commentPreview || "Tus respuestas apareceran aqui conforme completes el formulario."}</pre>
                          <small>{commentPreview.length} / 500 caracteres</small>
                        </div>

                        <div className="adoption-form__footer">
                          <p>
                            La respuesta se guardara como evidencia del seguimiento actual para{" "}
                            {selectedDog?.nombre || selectedDogCard?.nombrePerrito || "tu perrito"}.
                          </p>
                          <button
                            className="home-btn home-btn--primary"
                            disabled={submitting || !followUpTone.canSubmit}
                            type="submit"
                          >
                            {submitting ? "Guardando seguimiento..." : "Registrar seguimiento"}
                          </button>
                        </div>
                      </fieldset>
                    </form>
                  </>
                )}
              </section>

              <section className="adoption-panel followup-panel">
                <div className="adoption-panel__header">
                  <div>
                    <p className="adoption-panel__eyebrow">Historial</p>
                    <h2>Respuestas previas</h2>
                  </div>
                  {selectedFollowUp ? <span className="adoption-counter">{evidences.length} registradas</span> : null}
                </div>

                {!selectedFollowUp ? (
                  <div className="adoption-empty">
                    Selecciona un seguimiento para revisar el historial de respuestas.
                  </div>
                ) : historyLoading ? (
                  <div className="adoption-empty">Cargando historial del seguimiento...</div>
                ) : !evidences.length ? (
                  <div className="adoption-empty">
                    Aun no has enviado respuestas para este seguimiento.
                  </div>
                ) : (
                  <div className="followup-evidence-list">
                    {evidences.map((evidence) => (
                      <article key={evidence.idEvidencia} className="followup-evidence-card">
                        <div className="followup-evidence-card__header">
                          <div>
                            <span className="followup-evidence-card__eyebrow">
                              Evidencia #{evidence.idEvidencia}
                            </span>
                            <strong>{formatDate(evidence.fechaEvidencia)}</strong>
                          </div>
                          <small>{evidence.imageUrl ? "Incluye imagen" : "Solo comentario"}</small>
                        </div>

                        {evidence.imageUrl ? (
                          <img
                            alt={`Evidencia ${evidence.idEvidencia}`}
                            className="followup-evidence-card__image"
                            loading="lazy"
                            src={evidence.imageUrl}
                          />
                        ) : null}

                        <p className="followup-evidence-card__body">
                          {evidence.comentarios || "Sin comentario registrado."}
                        </p>
                        <small className="followup-evidence-card__date">
                          Registrado el {formatDateTime(evidence.fechaEvidencia)}
                        </small>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FollowUpPage;
