import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as dogEventsApi from "../../api/dogEvents";
import * as eventDetailsApi from "../../api/eventDetails";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idEvento: "",
  descripcion: "",
  monto: "",
  idEstado: "1",
};

const previewStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "28px",
  objectFit: "cover",
  display: "block",
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(date);
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }

  return amountFormatter.format(Number(value));
};

const buildEventLabel = (dogEvent) => {
  if (!dogEvent) {
    return "";
  }

  const parts = [
    `#${dogEvent.idEvento}`,
    dogEvent.nombrePerrito,
    dogEvent.tipoEvento,
    formatDate(dogEvent.fechaEvento),
  ].filter(Boolean);

  return parts.join(" - ");
};

const mapEventDetailToForm = (eventDetail) => ({
  idEvento: String(eventDetail?.idEvento ?? ""),
  descripcion: eventDetail?.descripcion ?? "",
  monto:
    eventDetail?.monto === null || eventDetail?.monto === undefined
      ? ""
      : String(eventDetail.monto),
  idEstado: String(eventDetail?.idEstado ?? "1"),
});

const EventDetailFormPage = () => {
  const { idDetalleEvento } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [dogEvents, setDogEvents] = useState([]);
  const [currentEventDetail, setCurrentEventDetail] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState("");

  const isEditing = Boolean(idDetalleEvento);

  const eventOptions = useMemo(() => {
    return dogEvents.filter(
      (dogEvent) =>
        Number(dogEvent.idEstado) === 1 ||
        Number(dogEvent.idEvento) === Number(currentEventDetail?.idEvento),
    );
  }, [currentEventDetail?.idEvento, dogEvents]);

  const hasRequiredData = states.length > 0 && eventOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedEventId = watch("idEvento");
  const watchedMonto = watch("monto");

  const selectedEvent = useMemo(() => {
    return eventOptions.find((dogEvent) => String(dogEvent.idEvento) === String(watchedEventId)) || null;
  }, [eventOptions, watchedEventId]);

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }

    return currentEventDetail?.comprobanteUrl || null;
  }, [currentEventDetail?.comprobanteUrl, selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar detalle de evento | Dashboard Kalo"
      : "Nuevo detalle de evento | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, dogEventsData] = await Promise.all([
          catalogsApi.getStates(),
          dogEventsApi.getDogEvents({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableDogEvents = Array.isArray(dogEventsData) ? dogEventsData : [];
        const preferredEventId = searchParams.get("evento");
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeEvent = availableDogEvents.find((dogEvent) => Number(dogEvent.idEstado) === 1);

        setStates(availableStates);
        setDogEvents(availableDogEvents);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idEvento: preferredEventId || String(activeEvent?.idEvento ?? ""),
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
  }, [isEditing, reset, searchParams]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadEventDetail = async () => {
      try {
        setDetailLoading(true);
        const detail = await eventDetailsApi.getEventDetailById(idDetalleEvento, { force: true });
        setCurrentEventDetail(detail);
        reset(mapEventDetailToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el detalle",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/detalle-evento");
      } finally {
        setDetailLoading(false);
      }
    };

    loadEventDetail();
  }, [idDetalleEvento, isEditing, navigate, reset]);

  const onFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setFileError("");
  };

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    if (!isEditing && !selectedFile) {
      setFileError("La imagen del comprobante es obligatoria.");
      return;
    }

    try {
      setSaving(true);
      setFileError("");

      const formData = new FormData();
      formData.append("idEvento", values.idEvento);
      formData.append("descripcion", values.descripcion.trim());
      formData.append("monto", values.monto);

      if (isEditing) {
        formData.append("idEstado", values.idEstado);
      } else {
        formData.append("idEstado", "1");
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const savedEventDetail = isEditing
        ? await eventDetailsApi.updateEventDetail(idDetalleEvento, formData)
        : await eventDetailsApi.createEventDetail(formData);

      Swal.fire({
        icon: "success",
        title: isEditing ? "Detalle actualizado" : "Detalle creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El detalle fue creado correctamente.",
      });

      navigate(
        savedEventDetail?.idEvento
          ? `/dashboard/detalle-evento?evento=${encodeURIComponent(savedEventDetail.idEvento)}`
          : "/dashboard/detalle-evento",
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
          <h1>Detalle de evento</h1>
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
            {isEditing ? "Editar detalle de evento" : "Nuevo detalle de evento"}
          </p>
          <h1>{isEditing ? "Actualizar detalle" : "Crear detalle"}</h1>
          <p className="dashboard-page__lede">
            Registra la imagen del comprobante, la descripcion del gasto y el monto asociado a un
            evento de perrito.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--ghost"
          to={
            watchedEventId
              ? `/dashboard/detalle-evento?evento=${encodeURIComponent(watchedEventId)}`
              : "/dashboard/detalle-evento"
          }
        >
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          {isEditing
            ? "Si subes una imagen nueva, reemplazaremos la URL almacenada para este comprobante."
            : "La imagen del comprobante se subira a Cloudinary y luego se registrara en FIDE_DETALLE_EVENTO_TB."}
        </div>

        <div className="dashboard-alert">
          {isEditing
            ? "Puedes mover el detalle a otro evento y cambiar su estado si el evento destino sigue activo."
            : "Los detalles nuevos siempre inician activos porque el trigger de la base fija ese estado."}
        </div>

        {selectedEvent ? (
          <div className="dashboard-alert">
            <strong>Evento seleccionado:</strong> {buildEventLabel(selectedEvent)}
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados y eventos de perrito disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              {previewUrl ? (
                <div className="dashboard-alert">
                  <strong>Vista previa del comprobante:</strong>
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      alt={
                        selectedEvent
                          ? `Comprobante del evento ${selectedEvent.idEvento}`
                          : "Vista previa del comprobante"
                      }
                      loading="lazy"
                      src={previewUrl}
                      style={previewStyle}
                    />
                  </div>
                </div>
              ) : null}

              <div className="dashboard-form-grid">
                <label className="dashboard-input dashboard-input--full">
                  <span>Evento</span>
                  <select
                    className="form-select"
                    {...register("idEvento", { required: "El evento es obligatorio" })}
                  >
                    <option value="">Selecciona un evento</option>
                    {eventOptions.map((dogEvent) => (
                      <option key={dogEvent.idEvento} value={dogEvent.idEvento}>
                        {buildEventLabel(dogEvent)}
                      </option>
                    ))}
                  </select>
                  {errors.idEvento ? <small>{errors.idEvento.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Monto</span>
                  <input
                    className="form-control"
                    min="0"
                    step="0.01"
                    type="number"
                    {...register("monto", {
                      required: "El monto es obligatorio",
                      min: {
                        value: 0,
                        message: "El monto no puede ser negativo",
                      },
                    })}
                  />
                  {errors.monto ? <small>{errors.monto.message}</small> : null}
                  <small>Monto actual: {formatMoney(watchedMonto)}</small>
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

                <label className="dashboard-input">
                  <span>Perrito asociado</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={
                      selectedEvent
                        ? `#${selectedEvent.idPerrito} - ${selectedEvent.nombrePerrito}`
                        : "Selecciona un evento"
                    }
                  />
                </label>

                <label className="dashboard-input">
                  <span>{isEditing ? "Nueva imagen de comprobante (opcional)" : "Imagen del comprobante"}</span>
                  <input
                    accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                    className="form-control"
                    onChange={onFileChange}
                    type="file"
                  />
                  {fileError ? <small>{fileError}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Descripcion</span>
                  <textarea
                    className="form-control"
                    rows="4"
                    {...register("descripcion", {
                      required: "La descripcion es obligatoria",
                      maxLength: {
                        value: 500,
                        message: "La descripcion no puede superar 500 caracteres",
                      },
                    })}
                  />
                  {errors.descripcion ? <small>{errors.descripcion.message}</small> : null}
                </label>

                {currentEventDetail?.comprobanteUrl ? (
                  <label className="dashboard-input dashboard-input--full">
                    <span>Comprobante actual</span>
                    <div>
                      <a href={currentEventDetail.comprobanteUrl} rel="noreferrer" target="_blank">
                        Abrir imagen actual
                      </a>
                    </div>
                  </label>
                ) : null}
              </div>

              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={formDisabled} type="submit">
                  {saving
                    ? isEditing
                      ? "Guardando..."
                      : "Creando..."
                    : isEditing
                      ? "Guardar cambios"
                      : "Crear detalle"}
                </button>
                <Link
                  className="dashboard-btn dashboard-btn--ghost"
                  to={
                    watchedEventId
                      ? `/dashboard/detalle-evento?evento=${encodeURIComponent(watchedEventId)}`
                      : "/dashboard/detalle-evento"
                  }
                >
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

export default EventDetailFormPage;
