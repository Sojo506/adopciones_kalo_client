import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as dogEventsApi from "../../api/dogEvents";
import * as dogsApi from "../../api/dogs";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idPerrito: "",
  idTipoEvento: "",
  fechaEvento: "",
  detalle: "",
  totalGasto: "",
  idEstado: "1",
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

const formatMoney = (amount) => {
  if (amount === null || amount === undefined || amount === "") {
    return "0.00";
  }

  return amountFormatter.format(Number(amount));
};

const mapDogEventToForm = (dogEvent) => ({
  idPerrito: String(dogEvent?.idPerrito ?? ""),
  idTipoEvento: String(dogEvent?.idTipoEvento ?? ""),
  fechaEvento: toDateInputValue(dogEvent?.fechaEvento),
  detalle: dogEvent?.detalle ?? "",
  totalGasto:
    dogEvent?.totalGasto === null || dogEvent?.totalGasto === undefined
      ? ""
      : String(dogEvent.totalGasto),
  idEstado: String(dogEvent?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  idPerrito: Number(values.idPerrito),
  idTipoEvento: Number(values.idTipoEvento),
  fechaEvento: values.fechaEvento,
  detalle: values.detalle.trim(),
  totalGasto: Number(values.totalGasto),
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  idPerrito: Number(values.idPerrito),
  idTipoEvento: Number(values.idTipoEvento),
  fechaEvento: values.fechaEvento,
  detalle: values.detalle.trim(),
  totalGasto: Number(values.totalGasto),
  idEstado: Number(values.idEstado),
});

const DogEventFormPage = () => {
  const { idEvento } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDogEvent, setCurrentDogEvent] = useState(null);

  const isEditing = Boolean(idEvento);

  const dogOptions = useMemo(() => {
    return dogs.filter(
      (dog) =>
        Number(dog.idEstado) === 1 ||
        Number(dog.idPerrito) === Number(currentDogEvent?.idPerrito),
    );
  }, [currentDogEvent?.idPerrito, dogs]);

  const eventTypeOptions = useMemo(() => {
    return eventTypes.filter(
      (eventType) =>
        Number(eventType.idEstado) === 1 ||
        Number(eventType.idTipoEvento) === Number(currentDogEvent?.idTipoEvento),
    );
  }, [currentDogEvent?.idTipoEvento, eventTypes]);

  const hasRequiredData = states.length > 0 && dogOptions.length > 0 && eventTypeOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedDogId = watch("idPerrito");
  const watchedTotalGasto = watch("totalGasto");

  const selectedDog = useMemo(() => {
    return dogOptions.find((dog) => String(dog.idPerrito) === String(watchedDogId)) || null;
  }, [dogOptions, watchedDogId]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar evento de perrito | Dashboard Kalo"
      : "Nuevo evento de perrito | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, dogsData, eventTypesData] = await Promise.all([
          catalogsApi.getStates(),
          dogsApi.getDogs({ force: true }),
          catalogsApi.getEventTypes({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableDogs = Array.isArray(dogsData) ? dogsData : [];
        const availableEventTypes = Array.isArray(eventTypesData) ? eventTypesData : [];
        const preferredDogId = searchParams.get("perrito");
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeDog = availableDogs.find((dog) => Number(dog.idEstado) === 1);
        const activeEventType = availableEventTypes.find(
          (eventType) => Number(eventType.idEstado) === 1,
        );

        setStates(availableStates);
        setDogs(availableDogs);
        setEventTypes(availableEventTypes);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idPerrito: preferredDogId || String(activeDog?.idPerrito ?? ""),
            idTipoEvento: String(activeEventType?.idTipoEvento ?? ""),
            fechaEvento: toDateInputValue(new Date()),
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

    const loadDogEvent = async () => {
      try {
        setDetailLoading(true);
        const detail = await dogEventsApi.getDogEventById(idEvento, { force: true });
        setCurrentDogEvent(detail);
        reset(mapDogEventToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el evento",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/eventos-perrito");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDogEvent();
  }, [idEvento, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await dogEventsApi.updateDogEvent(idEvento, buildUpdatePayload(values));
      } else {
        await dogEventsApi.createDogEvent(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Evento actualizado" : "Evento creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El evento fue creado correctamente.",
      });

      navigate(
        watchedDogId
          ? `/dashboard/eventos-perrito?perrito=${encodeURIComponent(watchedDogId)}`
          : "/dashboard/eventos-perrito",
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
          <h1>Eventos de perrito</h1>
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
            {isEditing ? "Editar evento de perrito" : "Nuevo evento de perrito"}
          </p>
          <h1>{isEditing ? "Actualizar evento" : "Crear evento"}</h1>
          <p className="dashboard-page__lede">
            Registra el perrito, el tipo de evento, la fecha, el detalle y el gasto total del
            evento medico u operativo.
          </p>
        </div>
        <Link
          className="dashboard-btn dashboard-btn--ghost"
          to={
            watchedDogId
              ? `/dashboard/eventos-perrito?perrito=${encodeURIComponent(watchedDogId)}`
              : "/dashboard/eventos-perrito"
          }
        >
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Los eventos nuevos siempre inician activos porque el trigger de la base fija ese estado.
          Solo se muestran perritos y tipos de evento activos al crear; al editar se conserva la
          relacion actual aunque luego se haya desactivado.
        </div>

        <div className="dashboard-alert">
          Si el evento ya tiene detalles activos asociados, no podras desactivarlo ni eliminarlo.
        </div>

        {isEditing ? (
          <div className="dashboard-alert">
            Los comprobantes y desglose financiero de este evento se administran desde{" "}
            <Link to={`/dashboard/detalle-evento?evento=${encodeURIComponent(idEvento)}`}>
              Detalle de evento
            </Link>
            .
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados, perritos y tipos de evento disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Perrito</span>
                  <select
                    className="form-select"
                    {...register("idPerrito", { required: "El perrito es obligatorio" })}
                  >
                    <option value="">Selecciona un perrito</option>
                    {dogOptions.map((dog) => (
                      <option key={dog.idPerrito} value={dog.idPerrito}>
                        #{dog.idPerrito} - {dog.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idPerrito ? <small>{errors.idPerrito.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Tipo de evento</span>
                  <select
                    className="form-select"
                    {...register("idTipoEvento", {
                      required: "El tipo de evento es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un tipo de evento</option>
                    {eventTypeOptions.map((eventType) => (
                      <option key={eventType.idTipoEvento} value={eventType.idTipoEvento}>
                        {eventType.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idTipoEvento ? <small>{errors.idTipoEvento.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha del evento</span>
                  <input
                    className="form-control"
                    type="date"
                    {...register("fechaEvento", {
                      required: "La fecha del evento es obligatoria",
                    })}
                  />
                  {errors.fechaEvento ? <small>{errors.fechaEvento.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Total de gasto</span>
                  <input
                    className="form-control"
                    min="0"
                    step="0.01"
                    type="number"
                    {...register("totalGasto", {
                      required: "El total de gasto es obligatorio",
                      min: {
                        value: 0,
                        message: "El total de gasto no puede ser negativo",
                      },
                    })}
                  />
                  {errors.totalGasto ? <small>{errors.totalGasto.message}</small> : null}
                  <small>Total actual: {formatMoney(watchedTotalGasto)}</small>
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Detalle</span>
                  <textarea
                    className="form-control"
                    rows="4"
                    {...register("detalle", {
                      required: "El detalle es obligatorio",
                      maxLength: {
                        value: 500,
                        message: "El detalle no puede superar 500 caracteres",
                      },
                    })}
                  />
                  {errors.detalle ? <small>{errors.detalle.message}</small> : null}
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
                  <span>Perrito seleccionado</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={
                      selectedDog
                        ? `#${selectedDog.idPerrito} - ${selectedDog.nombre}`
                        : "Selecciona un perrito"
                    }
                  />
                </label>
              </div>

              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={formDisabled} type="submit">
                  {saving
                    ? isEditing
                      ? "Guardando..."
                      : "Creando..."
                    : isEditing
                      ? "Guardar cambios"
                      : "Crear evento"}
                </button>
                <Link
                  className="dashboard-btn dashboard-btn--ghost"
                  to={
                    watchedDogId
                      ? `/dashboard/eventos-perrito?perrito=${encodeURIComponent(watchedDogId)}`
                      : "/dashboard/eventos-perrito"
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

export default DogEventFormPage;
