import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getDogById } from "../../api/dogs";
import { createEvidence, getEvidencesByFollowUp } from "../../api/evidences";
import { getCurrentProfileFollowUps } from "../../api/profile";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  fechaEvidencia: "",
};

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

const getFollowUpTone = (followUp) => {
  const today = getTodayDateValue();
  const start = toDateInputValue(followUp?.fechaInicio);
  const end = toDateInputValue(followUp?.fechaFin);
  const hasResponses = Number(followUp?.cantidadEvidencias || 0) > 0;

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
      label: hasResponses ? "Ventana cerrada con evidencias" : "Ventana cerrada",
      accent: "warning",
      canSubmit: false,
      description: "La ventana de este seguimiento ya vencio y no admite nuevas cargas.",
    };
  }

  if (hasResponses) {
    return {
      label: "Seguimiento con respuestas",
      accent: "success",
      canSubmit: true,
      description: "Puedes registrar una nueva evidencia si quieres ampliar el seguimiento.",
    };
  }

  return {
    label: "Pendiente de responder",
    accent: "pending",
    canSubmit: true,
    description: "Completa la fecha y sube una imagen para dejar evidencia de como va la adopcion.",
  };
};

const getEvidenceTone = (evidence) => {
  const normalizedState = normalizeText(evidence?.estado);

  if (normalizedState === "aprobado") {
    return {
      accent: "success",
      label: evidence?.estado || "Aprobada",
      visible: true,
    };
  }

  if (normalizedState === "pendiente") {
    return {
      accent: "pending",
      label: evidence?.estado || "Pendiente",
      visible: true,
    };
  }

  return {
    accent: "muted",
    label: evidence?.estado || "Registrada",
    visible: false,
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
      nombrePerrito: followUp.nombrePerrito || "Perrito adoptado",
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
      nombrePerrito: requestedDogName || "Perrito con seguimiento",
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

const buildDogGallery = (dog) => {
  const gallery = [];
  const seenUrls = new Set();

  const addImage = (imageUrl, fallbackId) => {
    const normalizedUrl = String(imageUrl || "").trim();

    if (!normalizedUrl || seenUrls.has(normalizedUrl)) {
      return;
    }

    seenUrls.add(normalizedUrl);
    gallery.push({
      id: fallbackId,
      imageUrl: normalizedUrl,
    });
  };

  addImage(dog?.imageUrl, `dog-${dog?.idPerrito || "main"}`);

  (dog?.images || []).forEach((image, index) => {
    addImage(image?.imageUrl, image?.idImagen || `dog-image-${index}`);
  });

  return gallery;
};

const FollowUpPage = () => {
  const location = useLocation();
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
  const [fileError, setFileError] = useState("");
  const [selectedDogImageUrl, setSelectedDogImageUrl] = useState(null);
  const [evidences, setEvidences] = useState([]);
  const fileInputRef = useRef(null);
  const initialRequestRef = useRef({
    dogId: Number(location.state?.dogId || searchParams.get("perrito") || 0) || null,
    followUpId:
      Number(location.state?.followUpId || searchParams.get("seguimiento") || 0) || null,
    adoptionId:
      Number(location.state?.adoptionId || searchParams.get("adopcion") || 0) || null,
    dogName: location.state?.dogName || searchParams.get("nombre") || "",
  });
  const requestedDogId = initialRequestRef.current.dogId;
  const requestedFollowUpId = initialRequestRef.current.followUpId;
  const requestedAdoptionId = initialRequestRef.current.adoptionId;
  const requestedDogName = initialRequestRef.current.dogName;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });
  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);
  const selectedFileName = selectedFile?.name || "Ningun archivo seleccionado";
  const followUpImageInputId = "followup-evidence-image";

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
  const selectedDogGallery = useMemo(() => buildDogGallery(selectedDog), [selectedDog]);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    reset({
      ...EMPTY_FORM,
      fechaEvidencia: getClampedEvidenceDate(selectedFollowUp),
    });
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [reset, selectedFollowUp]);

  useEffect(() => {
    setSelectedDogImageUrl((currentImageUrl) => {
      if (selectedDogGallery.some((image) => image.imageUrl === currentImageUrl)) {
        return currentImageUrl;
      }

      return selectedDogGallery[0]?.imageUrl || null;
    });
  }, [selectedDogGallery]);

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
            title: "No pudimos cargar las evidencias previas",
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
    const currentParams = searchParams.toString();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("perrito");
    nextParams.delete("seguimiento");
    nextParams.delete("adopcion");

    if (nextParams.toString() === currentParams) {
      return;
    }

    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

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
    setFileError("");
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

    if (!selectedFile) {
      setFileError("La imagen es obligatoria para enviar esta evidencia.");
      Swal.fire({
        icon: "warning",
        title: "Falta la imagen",
        text: "Selecciona una imagen antes de enviar la evidencia.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("idSeguimiento", String(selectedFollowUp.idSeguimiento));
      formData.append("fechaEvidencia", values.fechaEvidencia);
      setFileError("");

      formData.append("image", selectedFile);

      await createEvidence(formData);
      await refreshFollowUpData();
      reset({
        ...EMPTY_FORM,
        fechaEvidencia: getClampedEvidenceDate(selectedFollowUp),
      });
      setSelectedFile(null);
      setFileError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      Swal.fire({
        icon: "success",
        title: "Evidencia registrada",
        text: "La evidencia quedo enviada en estado pendiente para revision del equipo.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar la evidencia",
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
              Revisa los seguimientos programados para {buildDisplayName(user)} y registra cada
              etapa con una fecha correcta y una imagen clara para revision del equipo.
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
                        <strong>{dog.nombrePerrito || "Perrito con seguimiento"}</strong>
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
                      <div className="followup-dog-gallery__hero">
                        {selectedDogImageUrl ? (
                          <>
                            <div
                              aria-hidden="true"
                              className="followup-dog-gallery__hero-backdrop"
                              style={{ backgroundImage: `url("${selectedDogImageUrl}")` }}
                            />
                            <img
                              alt={`Fotografia de ${
                                selectedDog?.nombre || selectedDogCard?.nombrePerrito || "tu perrito"
                              }`}
                              className="followup-dog-gallery__hero-image"
                              loading="lazy"
                              src={selectedDogImageUrl}
                            />
                          </>
                        ) : (
                          <div className="followup-dog-gallery__empty">
                            No hay imagen disponible para este perrito.
                          </div>
                        )}
                      </div>
                      {selectedDogGallery.length > 1 ? (
                        <div className="followup-dog-gallery__thumbs">
                          {selectedDogGallery.slice(0, 4).map((image, index) => (
                            <button
                              key={image.id}
                              aria-label={`Ver foto ${index + 1} de ${
                                selectedDog?.nombre || selectedDogCard?.nombrePerrito || "este perrito"
                              }`}
                              className={`followup-dog-gallery__thumb${
                                image.imageUrl === selectedDogImageUrl ? " is-active" : ""
                              }`}
                              onClick={() => setSelectedDogImageUrl(image.imageUrl)}
                              type="button"
                            >
                              <div
                                aria-hidden="true"
                                className="followup-dog-gallery__thumb-backdrop"
                                style={{ backgroundImage: `url("${image.imageUrl}")` }}
                              />
                              <img
                                alt={`Miniatura ${index + 1} de ${
                                  selectedDog?.nombre || selectedDogCard?.nombrePerrito || "este perrito"
                                }`}
                                className="followup-dog-gallery__thumb-image"
                                loading="lazy"
                                src={image.imageUrl}
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="adoption-dog-detail__content">
                      <p className="adoption-dog-detail__lead">
                        Cada seguimiento queda asociado a este perrito y a tu cuenta. Puedes
                        registrar la evidencia real del seguimiento y revisar tus envios previos
                        en una sola vista.
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
                              return (
                                <button
                                  key={followUp.idSeguimiento}
                                  className={`followup-card${Number(selectedFollowUpId) === Number(followUp.idSeguimiento) ? " is-selected" : ""}`}
                                  onClick={() => setSelectedFollowUpId(followUp.idSeguimiento)}
                                  type="button"
                                >
                                  <div className="followup-card__header">
                                    <strong>
                                      {followUp.tipoSeguimiento || "Seguimiento programado"}
                                    </strong>
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
                    <p className="adoption-panel__eyebrow">Formulario de evidencia</p>
                    <h2>{selectedFollowUp?.tipoSeguimiento || "Selecciona un seguimiento"}</h2>
                  </div>
                </div>

                {!selectedFollowUp ? (
                  <div className="adoption-empty">
                    Cuando elijas un seguimiento podras completar la fecha y subir una imagen.
                  </div>
                ) : (
                  <>
                    <div className={`followup-banner followup-banner--${followUpTone.accent}`}>
                      <span>{followUpTone.description}</span>
                    </div>

                    <form className="adoption-form" onSubmit={handleSubmit(onSubmit)}>
                      <fieldset className="followup-form-fieldset" disabled={submitting || !followUpTone.canSubmit}>
                        <label className="followup-date-field">
                          <span>Fecha evidencia</span>
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

                        <div className="followup-upload-field">
                          <span>Imagen de evidencia</span>
                          <input
                            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                            className="upload-picker__input"
                            id={followUpImageInputId}
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            type="file"
                          />
                          <div className={`upload-picker${selectedFile ? " is-filled" : ""}`}>
                            <div className="upload-picker__row">
                              <label className="upload-picker__button" htmlFor={followUpImageInputId}>
                                Elegir archivo
                              </label>
                              <div className="upload-picker__meta">
                                <strong>{selectedFile ? "Imagen seleccionada" : "Sube una foto desde tu equipo"}</strong>
                                <span>{selectedFileName}</span>
                              </div>
                            </div>
                          </div>
                          <span className="upload-picker__help">
                            La imagen es obligatoria. Formatos permitidos: JPG, PNG, WEBP, AVIF o GIF.
                          </span>
                          {fileError ? <small className="text-danger">{fileError}</small> : null}
                        </div>

                        {previewUrl ? (
                          <div className="followup-preview">
                            <strong>Vista previa de la imagen</strong>
                            <img alt="Vista previa de la evidencia" src={previewUrl} />
                          </div>
                        ) : null}

                        <div className="adoption-form__footer">
                          <p>
                            La evidencia se enviara en estado pendiente para{" "}
                            {selectedDog?.nombre || selectedDogCard?.nombrePerrito || "tu perrito"}.
                          </p>
                          <button
                            className="home-btn home-btn--primary"
                            disabled={submitting || !followUpTone.canSubmit}
                            type="submit"
                          >
                            {submitting ? "Guardando evidencia..." : "Registrar evidencia"}
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
                    <h2>Evidencias previas</h2>
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
                    Aun no has enviado evidencias para este seguimiento.
                  </div>
                ) : (
                  <div className="followup-evidence-list">
                    {evidences.map((evidence) => {
                      const evidenceTone = getEvidenceTone(evidence);

                      return (
                        <article key={evidence.idEvidencia} className="followup-evidence-card">
                          <div className="followup-evidence-card__header">
                            <div>
                              <span className="followup-evidence-card__eyebrow">Evidencia registrada</span>
                              <strong>{formatDate(evidence.fechaEvidencia)}</strong>
                            </div>
                            {evidenceTone.visible ? (
                              <span className={`followup-badge followup-badge--${evidenceTone.accent}`}>
                                {evidenceTone.label}
                              </span>
                            ) : null}
                          </div>

                          {evidence.imageUrl ? (
                            <img
                              alt="Imagen de evidencia"
                              className="followup-evidence-card__image"
                              loading="lazy"
                              src={evidence.imageUrl}
                            />
                          ) : null}
                          <small className="followup-evidence-card__date">
                            Registrado el {formatDateTime(evidence.fechaEvidencia)}
                          </small>
                        </article>
                      );
                    })}
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
