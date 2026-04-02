import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as evidencesApi from "../../api/evidences";
import * as followUpsApi from "../../api/followUps";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idSeguimiento: "",
  fechaEvidencia: "",
  comentarios: "",
  idEstado: "1",
  clearImage: false,
};

const previewStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "28px",
  objectFit: "cover",
  display: "block",
};

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

const buildFollowUpLabel = (followUp) => {
  const segments = [];

  if (followUp.tipoSeguimiento) {
    segments.push(followUp.tipoSeguimiento);
  }

  if (followUp.adoptante) {
    segments.push(followUp.adoptante);
  } else if (followUp.identificacion) {
    segments.push(followUp.identificacion);
  }

  if (followUp.nombrePerrito) {
    segments.push(`Perrito: ${followUp.nombrePerrito}`);
  }

  return segments.join(" - ") || "Seguimiento programado";
};

const mapEvidenceToForm = (evidence) => ({
  idSeguimiento: String(evidence?.idSeguimiento ?? ""),
  fechaEvidencia: toDateInputValue(evidence?.fechaEvidencia),
  comentarios: evidence?.comentarios ?? "",
  idEstado: String(evidence?.idEstado ?? "1"),
  clearImage: false,
});

const getSelectableFollowUps = ({ followUps, currentEvidence }) => {
  return (Array.isArray(followUps) ? followUps : [])
    .filter((followUp) => {
      const isCurrent = Number(followUp.idSeguimiento) === Number(currentEvidence?.idSeguimiento);

      if (isCurrent) {
        return true;
      }

      return Number(followUp.idEstado) === 1;
    })
    .sort((left, right) => left.idSeguimiento - right.idSeguimiento);
};

const getClampedEvidenceDate = (followUp) => {
  if (!followUp?.fechaInicio || !followUp?.fechaFin) {
    return toDateInputValue(new Date());
  }

  const start = toDateInputValue(followUp.fechaInicio);
  const end = toDateInputValue(followUp.fechaFin);
  const today = toDateInputValue(new Date());

  if (today < start) {
    return start;
  }

  if (today > end) {
    return end;
  }

  return today;
};

const EvidenceFormPage = () => {
  const { idEvidencia } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [currentEvidence, setCurrentEvidence] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contentError, setContentError] = useState("");
  const fileInputRef = useRef(null);

  const isEditing = Boolean(idEvidencia);

  const followUpOptions = useMemo(() => {
    return getSelectableFollowUps({
      followUps,
      currentEvidence,
    });
  }, [currentEvidence, followUps]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedFollowUpId = watch("idSeguimiento");
  const watchedEvidenceDate = watch("fechaEvidencia");
  const watchedComments = watch("comentarios");
  const watchedClearImage = watch("clearImage");

  const selectedFollowUp = useMemo(() => {
    return (
      followUpOptions.find(
        (followUp) => Number(followUp.idSeguimiento) === Number(watchedFollowUpId),
      ) || null
    );
  }, [followUpOptions, watchedFollowUpId]);

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }

    if (watchedClearImage) {
      return null;
    }

    return currentEvidence?.imageUrl || null;
  }, [currentEvidence?.imageUrl, selectedFile, watchedClearImage]);

  const selectedFileName =
    selectedFile?.name ||
    (currentEvidence?.imageUrl && !watchedClearImage
      ? "Usando la imagen actual"
      : "Ningun archivo seleccionado");

  const dashboardEvidenceImageInputId = isEditing
    ? "dashboard-evidence-image-edit"
    : "dashboard-evidence-image-create";

  const hasRequiredData = states.length > 0 && followUpOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  useEffect(() => {
    return () => {
      if (selectedFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar evidencia | Dashboard KalÃ¶"
      : "Nueva evidencia | Dashboard KalÃ¶";
  }, [isEditing]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar evidencia | Dashboard Kalo"
      : "Nueva evidencia | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, followUpsData] = await Promise.all([
          catalogsApi.getStates(),
          followUpsApi.getFollowUps({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableFollowUps = Array.isArray(followUpsData) ? followUpsData : [];
        const preferredFollowUpId = searchParams.get("seguimiento");
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const defaultFollowUp =
          getSelectableFollowUps({
            followUps: availableFollowUps,
            currentEvidence: null,
          }).find((followUp) => String(followUp.idSeguimiento) === String(preferredFollowUpId)) ||
          getSelectableFollowUps({
            followUps: availableFollowUps,
            currentEvidence: null,
          })[0];

        setStates(availableStates);
        setFollowUps(availableFollowUps);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idSeguimiento: String(defaultFollowUp?.idSeguimiento ?? ""),
            fechaEvidencia: getClampedEvidenceDate(defaultFollowUp),
            idEstado: String(activeState?.idEstado ?? 1),
            clearImage: false,
          });
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
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
  }, [isEditing, reset, searchParams]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadEvidence = async () => {
      try {
        setDetailLoading(true);
        const detail = await evidencesApi.getEvidenceById(idEvidencia, { force: true });
        setCurrentEvidence(detail);
        reset(mapEvidenceToForm(detail));
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la evidencia",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/evidencias");
      } finally {
        setDetailLoading(false);
      }
    };

    loadEvidence();
  }, [idEvidencia, isEditing, navigate, reset]);

  useEffect(() => {
    if (catalogsLoading || detailLoading) {
      return;
    }

    if (!followUpOptions.length) {
      setValue("idSeguimiento", "", { shouldDirty: false });
      return;
    }

    const hasSelectedFollowUp = followUpOptions.some(
      (followUp) => Number(followUp.idSeguimiento) === Number(watchedFollowUpId),
    );

    if (!hasSelectedFollowUp) {
      const nextFollowUp = followUpOptions[0];
      setValue("idSeguimiento", String(nextFollowUp.idSeguimiento), {
        shouldDirty: false,
      });
      setValue("fechaEvidencia", getClampedEvidenceDate(nextFollowUp), {
        shouldDirty: false,
      });
    }
  }, [
    catalogsLoading,
    detailLoading,
    followUpOptions,
    setValue,
    watchedFollowUpId,
  ]);

  useEffect(() => {
    if (!selectedFollowUp?.fechaInicio || !selectedFollowUp?.fechaFin) {
      return;
    }

    const minDate = toDateInputValue(selectedFollowUp.fechaInicio);
    const maxDate = toDateInputValue(selectedFollowUp.fechaFin);

    if (!watchedEvidenceDate || watchedEvidenceDate < minDate || watchedEvidenceDate > maxDate) {
      setValue("fechaEvidencia", getClampedEvidenceDate(selectedFollowUp), {
        shouldDirty: Boolean(watchedEvidenceDate),
      });
    }
  }, [selectedFollowUp, setValue, watchedEvidenceDate]);

  useEffect(() => {
    if (!contentError) {
      return;
    }

    const hasCurrentImage = Boolean(currentEvidence?.imageUrl) && !watchedClearImage;
    const hasNewImage = Boolean(selectedFile);
    const hasComments = Boolean(String(watchedComments || "").trim());

    if (hasCurrentImage || hasNewImage || hasComments) {
      setContentError("");
    }
  }, [contentError, currentEvidence?.imageUrl, selectedFile, watchedClearImage, watchedComments]);

  const onFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setContentError("");

    if (nextFile) {
      setValue("clearImage", false, { shouldDirty: true });
    }
  };

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    const hasCurrentImage = Boolean(currentEvidence?.imageUrl) && !values.clearImage;
    const hasNewImage = Boolean(selectedFile);
    const comentarios = String(values.comentarios || "").trim();

    if (!hasCurrentImage && !hasNewImage && !comentarios) {
      setContentError("Debes agregar una imagen o un comentario para guardar la evidencia.");
      return;
    }

    try {
      setSaving(true);
      setContentError("");

      const formData = new FormData();
      formData.append("idSeguimiento", values.idSeguimiento);
      formData.append("fechaEvidencia", values.fechaEvidencia);
      formData.append("comentarios", comentarios);

      if (isEditing) {
        formData.append("idEstado", values.idEstado);
        formData.append("clearImage", values.clearImage ? "true" : "false");
      } else {
        formData.append("idEstado", "1");
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const savedEvidence = isEditing
        ? await evidencesApi.updateEvidence(idEvidencia, formData)
        : await evidencesApi.createEvidence(formData);

      Swal.fire({
        icon: "success",
        title: isEditing ? "Evidencia actualizada" : "Evidencia creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La evidencia fue registrada correctamente.",
      });

      navigate(
        `/dashboard/evidencias?seguimiento=${encodeURIComponent(
          savedEvidence?.idSeguimiento || values.idSeguimiento,
        )}`,
      );
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
          <h1>Evidencias</h1>
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
            {isEditing ? "Editar evidencia" : "Nueva evidencia"}
          </p>
          <h1>{isEditing ? "Actualizar evidencia" : "Crear evidencia"}</h1>
          <p className="dashboard-page__lede">
            Registra una imagen y los comentarios que documentan el cumplimiento de un seguimiento.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/evidencias">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          La evidencia debe pertenecer a un <Link to="/dashboard/seguimientos">seguimiento</Link>{" "}
          y su fecha debe caer entre el inicio y el fin programados.
        </div>

        <div className="dashboard-alert">
          Puedes guardar evidencia con imagen, con comentario o con ambos. Si editas una evidencia
          existente tambien puedes quitar la imagen actual.
        </div>

        {selectedFollowUp ? (
          <div className="dashboard-alert">
            Seguimiento seleccionado. Ventana valida del{" "}
            {toDateInputValue(selectedFollowUp.fechaInicio)} al{" "}
            {toDateInputValue(selectedFollowUp.fechaFin)}.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas seguimientos y estados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              {previewUrl ? (
                <div className="dashboard-alert">
                  <strong>Vista previa:</strong>
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      alt="Vista previa de la evidencia"
                      loading="lazy"
                      src={previewUrl}
                      style={previewStyle}
                    />
                  </div>
                </div>
              ) : null}

              <div className="dashboard-form-grid">
                <label className="dashboard-input dashboard-input--full">
                  <span>Seguimiento</span>
                  <select
                    className="form-select"
                    {...register("idSeguimiento", {
                      required: "El seguimiento es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un seguimiento</option>
                    {followUpOptions.map((followUp) => (
                      <option key={followUp.idSeguimiento} value={followUp.idSeguimiento}>
                        {buildFollowUpLabel(followUp)}
                        {Number(followUp.idEstado) !== 1
                          ? ` - ${followUp.estado || "Inactivo"}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {errors.idSeguimiento ? <small>{errors.idSeguimiento.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de evidencia</span>
                  <input
                    className="form-control"
                    max={selectedFollowUp ? toDateInputValue(selectedFollowUp.fechaFin) : undefined}
                    min={selectedFollowUp ? toDateInputValue(selectedFollowUp.fechaInicio) : undefined}
                    type="date"
                    {...register("fechaEvidencia", {
                      required: "La fecha es obligatoria",
                      validate: (value) => {
                        if (!value || !selectedFollowUp) {
                          return true;
                        }

                        const minDate = toDateInputValue(selectedFollowUp.fechaInicio);
                        const maxDate = toDateInputValue(selectedFollowUp.fechaFin);

                        if (value < minDate) {
                          return "La fecha no puede ser anterior al inicio del seguimiento";
                        }

                        if (value > maxDate) {
                          return "La fecha no puede ser posterior al fin del seguimiento";
                        }

                        return true;
                      },
                    })}
                  />
                  {errors.fechaEvidencia ? <small>{errors.fechaEvidencia.message}</small> : null}
                </label>

                {isEditing ? (
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
                ) : (
                  <label className="dashboard-input">
                    <span>Estado inicial</span>
                    <input className="form-control" readOnly type="text" value="Activo" />
                  </label>
                )}

                <div className="dashboard-input dashboard-input--full">
                  <span>{isEditing ? "Nueva imagen (opcional)" : "Imagen (opcional)"}</span>
                  <input
                    accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                    className="upload-picker__input"
                    id={dashboardEvidenceImageInputId}
                    onChange={onFileChange}
                    ref={fileInputRef}
                    type="file"
                  />
                  <div
                    className={`upload-picker${
                      selectedFile
                        ? " is-filled"
                        : currentEvidence?.imageUrl && !watchedClearImage
                          ? " is-existing"
                          : ""
                    }`}
                  >
                    <div className="upload-picker__row">
                      <label className="upload-picker__button" htmlFor={dashboardEvidenceImageInputId}>
                        Elegir archivo
                      </label>
                      <div className="upload-picker__meta">
                        <strong>
                          {selectedFile
                            ? "Nueva imagen lista para subir"
                            : currentEvidence?.imageUrl && !watchedClearImage
                              ? "Se mantendra la imagen actual"
                              : "Selecciona una imagen desde tu equipo"}
                        </strong>
                        <span>{selectedFileName}</span>
                      </div>
                    </div>
                  </div>
                  <span className="upload-picker__help">
                    Formatos permitidos: JPG, PNG, WEBP, AVIF o GIF.
                  </span>
                </div>

                <label className="dashboard-input dashboard-input--full">
                  <span>Comentarios</span>
                  <textarea
                    className="form-control"
                    rows={4}
                    {...register("comentarios", {
                      maxLength: {
                        value: 500,
                        message: "Los comentarios no pueden superar 500 caracteres",
                      },
                    })}
                  />
                  {errors.comentarios ? <small>{errors.comentarios.message}</small> : null}
                </label>
              </div>

              {isEditing && currentEvidence?.imageUrl ? (
                <div className="dashboard-input" style={{ maxWidth: "360px" }}>
                  <span>Imagen actual</span>
                  <label className="dashboard-checkbox" style={{ display: "flex", gap: "0.75rem" }}>
                    <input disabled={Boolean(selectedFile)} type="checkbox" {...register("clearImage")} />
                    <span>Quitar imagen actual al guardar</span>
                  </label>
                </div>
              ) : null}

              {contentError ? <small>{contentError}</small> : null}

              {selectedFollowUp ? (
                <div className="dashboard-alert">
                  Adoptante: {selectedFollowUp.adoptante || selectedFollowUp.identificacion || "-"}
                  . Perrito:{" "}
                  {selectedFollowUp.nombrePerrito || "Perrito asociado"}. Tipo:{" "}
                  {selectedFollowUp.tipoSeguimiento || "-"}.
                </div>
              ) : null}

              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear evidencia"}
                </button>
                <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/evidencias">
                  Cancelar
                </Link>
              </div>
            </fieldset>
          </form>
        )}
      </section>
    </div>
  );
};

export default EvidenceFormPage;
