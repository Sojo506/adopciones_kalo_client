import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as adoptionsApi from "../../api/adoptions";
import * as catalogsApi from "../../api/catalogs";
import * as dogsApi from "../../api/dogs";
import * as requestsApi from "../../api/requests";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idSolicitud: "",
  idPerrito: "",
  fechaAdopcion: "",
  idEstado: "1",
};

const ADOPTION_REQUEST_TYPE_KEY = "adopcion";

const normalizeCatalogName = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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

const buildRequestLabel = (request) => {
  const base = `#${request.idSolicitud}`;
  return request.solicitante ? `${base} - ${request.solicitante}` : base;
};

const buildDogLabel = (dog) => {
  const base = `#${dog.idPerrito}`;
  return dog.nombre ? `${base} - ${dog.nombre}` : base;
};

const mapAdoptionToForm = (adoption) => ({
  idSolicitud: String(adoption?.idSolicitud ?? ""),
  idPerrito: String(adoption?.idPerrito ?? ""),
  fechaAdopcion: toDateInputValue(adoption?.fechaAdopcion),
  idEstado: String(adoption?.idEstado ?? "1"),
});

const buildCreatePayload = (values, selectedRequest) => ({
  identificacion: String(selectedRequest?.identificacion || "").trim(),
  idSolicitud: Number(values.idSolicitud),
  idPerrito: Number(values.idPerrito),
  fechaAdopcion: values.fechaAdopcion,
  idEstado: 1,
});

const buildUpdatePayload = (values, selectedRequest) => ({
  identificacion: String(selectedRequest?.identificacion || "").trim(),
  idSolicitud: Number(values.idSolicitud),
  idPerrito: Number(values.idPerrito),
  fechaAdopcion: values.fechaAdopcion,
  idEstado: Number(values.idEstado),
});

const getSelectableRequests = ({ requests, adoptions, currentAdoption }) => {
  const currentRequestId = Number(currentAdoption?.idSolicitud || 0);
  const usedRequestIds = new Set(
    (Array.isArray(adoptions) ? adoptions : [])
      .filter((adoption) => Number(adoption.idAdopcion) !== Number(currentAdoption?.idAdopcion))
      .map((adoption) => Number(adoption.idSolicitud || 0))
      .filter(Boolean),
  );

  return (Array.isArray(requests) ? requests : [])
    .filter((request) => {
      const isCurrent = Number(request.idSolicitud) === currentRequestId;

      if (isCurrent) {
        return true;
      }

      if (Number(request.idEstado) !== 1) {
        return false;
      }

      if (normalizeCatalogName(request.tipoSolicitud) !== ADOPTION_REQUEST_TYPE_KEY) {
        return false;
      }

      return !usedRequestIds.has(Number(request.idSolicitud));
    })
    .sort((left, right) => left.idSolicitud - right.idSolicitud);
};

const getSelectableDogs = ({ dogs, adoptions, currentAdoption }) => {
  const currentAdoptionId = Number(currentAdoption?.idAdopcion || 0);
  const usedDogIds = new Set(
    (Array.isArray(adoptions) ? adoptions : [])
      .filter(
        (adoption) =>
          Number(adoption.idEstado) === 1 &&
          Number(adoption.idAdopcion) !== currentAdoptionId,
      )
      .map((adoption) => Number(adoption.idPerrito || 0))
      .filter(Boolean),
  );

  return (Array.isArray(dogs) ? dogs : [])
    .filter((dog) => {
      const isCurrent = Number(dog.idPerrito) === Number(currentAdoption?.idPerrito);

      if (isCurrent) {
        return true;
      }

      if (Number(dog.idEstado) !== 1) {
        return false;
      }

      return !usedDogIds.has(Number(dog.idPerrito));
    })
    .sort((left, right) => left.idPerrito - right.idPerrito);
};

const AdoptionFormPage = () => {
  const { idAdopcion } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentAdoption, setCurrentAdoption] = useState(null);

  const isEditing = Boolean(idAdopcion);

  const requestOptions = useMemo(() => {
    return getSelectableRequests({
      requests,
      adoptions,
      currentAdoption,
    });
  }, [adoptions, currentAdoption, requests]);

  const dogOptions = useMemo(() => {
    return getSelectableDogs({
      dogs,
      adoptions,
      currentAdoption,
    });
  }, [adoptions, currentAdoption, dogs]);

  const hasRequiredData = states.length > 0 && requestOptions.length > 0 && dogOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedRequestId = watch("idSolicitud");
  const watchedDogId = watch("idPerrito");

  const selectedRequest = useMemo(() => {
    return (
      requestOptions.find((request) => Number(request.idSolicitud) === Number(watchedRequestId)) ||
      null
    );
  }, [requestOptions, watchedRequestId]);

  const selectedDog = useMemo(() => {
    return dogOptions.find((dog) => Number(dog.idPerrito) === Number(watchedDogId)) || null;
  }, [dogOptions, watchedDogId]);

  useEffect(() => {
    document.title = isEditing ? "Editar adopcion | Dashboard Kalö" : "Nueva adopcion | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, requestsData, dogsData, adoptionsData] = await Promise.all([
          catalogsApi.getStates(),
          requestsApi.getRequests({ force: true }),
          dogsApi.getDogs({ force: true }),
          adoptionsApi.getAdoptions({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableRequests = Array.isArray(requestsData) ? requestsData : [];
        const availableDogs = Array.isArray(dogsData) ? dogsData : [];
        const existingAdoptions = Array.isArray(adoptionsData) ? adoptionsData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const defaultRequest = getSelectableRequests({
          requests: availableRequests,
          adoptions: existingAdoptions,
          currentAdoption: null,
        })[0];
        const defaultDog = getSelectableDogs({
          dogs: availableDogs,
          adoptions: existingAdoptions,
          currentAdoption: null,
        })[0];

        setStates(availableStates);
        setRequests(availableRequests);
        setDogs(availableDogs);
        setAdoptions(existingAdoptions);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idSolicitud: String(defaultRequest?.idSolicitud ?? ""),
            idPerrito: String(defaultDog?.idPerrito ?? ""),
            fechaAdopcion: toDateInputValue(new Date()),
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

    const loadAdoption = async () => {
      try {
        setDetailLoading(true);
        const detail = await adoptionsApi.getAdoptionById(idAdopcion, { force: true });
        setCurrentAdoption(detail);
        reset(mapAdoptionToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la adopcion",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/adopciones");
      } finally {
        setDetailLoading(false);
      }
    };

    loadAdoption();
  }, [idAdopcion, isEditing, navigate, reset]);

  useEffect(() => {
    if (catalogsLoading || detailLoading) {
      return;
    }

    if (!requestOptions.length) {
      setValue("idSolicitud", "", { shouldDirty: false });
    } else {
      const hasSelectedRequest = requestOptions.some(
        (request) => Number(request.idSolicitud) === Number(watchedRequestId),
      );

      if (!hasSelectedRequest) {
        setValue("idSolicitud", String(requestOptions[0].idSolicitud), {
          shouldDirty: false,
        });
      }
    }

    if (!dogOptions.length) {
      setValue("idPerrito", "", { shouldDirty: false });
      return;
    }

    const hasSelectedDog = dogOptions.some((dog) => Number(dog.idPerrito) === Number(watchedDogId));

    if (!hasSelectedDog) {
      setValue("idPerrito", String(dogOptions[0].idPerrito), {
        shouldDirty: false,
      });
    }
  }, [
    catalogsLoading,
    detailLoading,
    dogOptions,
    requestOptions,
    setValue,
    watchedDogId,
    watchedRequestId,
  ]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    if (!selectedRequest?.identificacion) {
      Swal.fire({
        icon: "error",
        title: "Solicitud incompleta",
        text: "Debes seleccionar una solicitud valida antes de guardar.",
      });
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await adoptionsApi.updateAdoption(idAdopcion, buildUpdatePayload(values, selectedRequest));
      } else {
        await adoptionsApi.createAdoption(buildCreatePayload(values, selectedRequest));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Adopcion actualizada" : "Adopcion creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La adopcion fue creada correctamente.",
      });

      navigate("/dashboard/adopciones");
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
          <h1>Adopciones</h1>
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
            {isEditing ? "Editar adopcion" : "Nueva adopcion"}
          </p>
          <h1>{isEditing ? "Actualizar adopcion" : "Crear adopcion"}</h1>
          <p className="dashboard-page__lede">
            Selecciona la solicitud aprobada, el perrito asignado y la fecha del cierre formal del
            proceso de adopcion.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/adopciones">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          La solicitud define al adoptante. Por eso el adoptante se completa automaticamente al
          elegir la solicitud.
        </div>

        <div className="dashboard-alert">
          Solo se muestran solicitudes activas de tipo adopcion que no esten usadas por otra
          adopcion. Al editar se conserva la relacion actual aunque luego se haya desactivado.
        </div>

        <div className="dashboard-alert">
          Un perrito solo puede tener una adopcion activa a la vez. Si el backend detecta otra
          activa, no permitira guardar el cambio.
        </div>

        <div className="dashboard-alert">
          No se puede dejar activa una adopcion si la solicitud, el adoptante o el perrito quedaron
          inactivos. Tampoco se puede desactivar si tiene seguimientos activos.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados, solicitudes y perritos disponibles para completar este formulario.
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
                    {requestOptions.map((request) => (
                      <option key={request.idSolicitud} value={request.idSolicitud}>
                        {buildRequestLabel(request)}
                        {Number(request.idEstado) !== 1 ? ` (${request.estado || "Inactiva"})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.idSolicitud ? <small>{errors.idSolicitud.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Adoptante</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={
                      selectedRequest
                        ? `${selectedRequest.identificacion}${
                            selectedRequest.solicitante ? ` - ${selectedRequest.solicitante}` : ""
                          }`
                        : ""
                    }
                  />
                </label>

                <label className="dashboard-input">
                  <span>Perrito</span>
                  <select
                    className="form-select"
                    {...register("idPerrito", { required: "El perrito es obligatorio" })}
                  >
                    <option value="">Selecciona un perrito</option>
                    {dogOptions.map((dog) => (
                      <option key={dog.idPerrito} value={dog.idPerrito}>
                        {buildDogLabel(dog)}
                        {Number(dog.idEstado) !== 1 ? ` (${dog.estado || "Inactivo"})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.idPerrito ? <small>{errors.idPerrito.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de adopcion</span>
                  <input
                    className="form-control"
                    type="date"
                    {...register("fechaAdopcion", {
                      required: "La fecha de adopcion es obligatoria",
                    })}
                  />
                  {errors.fechaAdopcion ? <small>{errors.fechaAdopcion.message}</small> : null}
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
                    value={selectedDog ? buildDogLabel(selectedDog) : ""}
                  />
                </label>
              </div>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={formDisabled} type="submit">
                {saving
                  ? isEditing
                    ? "Guardando..."
                    : "Creando..."
                  : isEditing
                    ? "Guardar cambios"
                    : "Crear adopcion"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/adopciones">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default AdoptionFormPage;
