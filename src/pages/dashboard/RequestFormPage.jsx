import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as requestTypesApi from "../../api/requestTypes";
import * as requestsApi from "../../api/requests";
import * as usersApi from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  identificacion: "",
  idTipoSolicitud: "",
  idEstado: "1",
};

const buildUserLabel = (user) => {
  const fullName = [user?.nombre, user?.apellidoPaterno, user?.apellidoMaterno]
    .filter(Boolean)
    .join(" ");

  if (!fullName) {
    return String(user?.identificacion || "");
  }

  return `${user.identificacion} - ${fullName}`;
};

const mapRequestToForm = (request) => ({
  identificacion: String(request?.identificacion ?? ""),
  idTipoSolicitud: String(request?.idTipoSolicitud ?? ""),
  idEstado: String(request?.idEstado ?? "1"),
});

const buildPayload = (values) => ({
  identificacion: values.identificacion.trim(),
  idTipoSolicitud: Number(values.idTipoSolicitud),
  idEstado: Number(values.idEstado),
});

const RequestFormPage = () => {
  const { idSolicitud } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [users, setUsers] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  const isEditing = Boolean(idSolicitud);

  const userOptions = useMemo(() => {
    return users.filter(
      (user) =>
        Number(user.idEstado) === 1 ||
        String(user.identificacion) === String(currentRequest?.identificacion),
    );
  }, [currentRequest?.identificacion, users]);

  const requestTypeOptions = useMemo(() => {
    return requestTypes.filter(
      (requestType) =>
        Number(requestType.idEstado) === 1 ||
        Number(requestType.idTipoSolicitud) === Number(currentRequest?.idTipoSolicitud),
    );
  }, [currentRequest?.idTipoSolicitud, requestTypes]);

  const hasRequiredData =
    states.length > 0 && userOptions.length > 0 && requestTypeOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedIdentification = watch("identificacion");
  const selectedUser = useMemo(() => {
    return (
      userOptions.find((user) => String(user.identificacion) === String(watchedIdentification)) ||
      null
    );
  }, [userOptions, watchedIdentification]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar solicitud | Dashboard Kalö"
      : "Nueva solicitud | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, usersData, requestTypesData] = await Promise.all([
          catalogsApi.getStates(),
          usersApi.getUsers({ force: true }),
          requestTypesApi.getRequestTypes({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableUsers = Array.isArray(usersData) ? usersData : [];
        const availableRequestTypes = Array.isArray(requestTypesData) ? requestTypesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeUser = availableUsers.find((user) => Number(user.idEstado) === 1);
        const activeRequestType = availableRequestTypes.find(
          (requestType) => Number(requestType.idEstado) === 1,
        );

        setStates(availableStates);
        setUsers(availableUsers);
        setRequestTypes(availableRequestTypes);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            identificacion: String(activeUser?.identificacion ?? ""),
            idTipoSolicitud: String(activeRequestType?.idTipoSolicitud ?? ""),
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

    const loadRequest = async () => {
      try {
        setDetailLoading(true);
        const detail = await requestsApi.getRequestById(idSolicitud, { force: true });
        setCurrentRequest(detail);
        reset(mapRequestToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la solicitud",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/solicitudes");
      } finally {
        setDetailLoading(false);
      }
    };

    loadRequest();
  }, [idSolicitud, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await requestsApi.updateRequest(idSolicitud, payload);
      } else {
        await requestsApi.createRequest(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Solicitud actualizada" : "Solicitud creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La solicitud fue creada correctamente.",
      });

      navigate("/dashboard/solicitudes");
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
          <h1>Solicitudes</h1>
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
            {isEditing ? "Editar solicitud" : "Nueva solicitud"}
          </p>
          <h1>{isEditing ? "Actualizar solicitud" : "Crear solicitud"}</h1>
          <p className="dashboard-page__lede">
            Define el solicitante, el tipo de solicitud y el estado con que quedara registrado el
            formulario base.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/solicitudes">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Esta pantalla administra solo la solicitud base. Las preguntas se asignan desde{" "}
          <Link to="/dashboard/tipos-solicitud-pregunta">Tipo solicitud-pregunta</Link> y el
          perrito se define despues desde <Link to="/dashboard/adopciones">Adopciones</Link>.
        </div>

        <div className="dashboard-alert">
          Si la solicitud ya tiene respuestas, adopciones o casas cuna activas, el backend no
          permitira desactivarla.
        </div>

        <div className="dashboard-alert">
          Solo se muestran solicitantes y tipos activos al crear. Al editar se conserva la relacion
          actual aunque luego se haya desactivado.
        </div>

        {isEditing && currentRequest?.idPerrito ? (
          <div className="dashboard-alert">
            Esta solicitud ya aparece ligada al perrito #{currentRequest.idPerrito}
            {currentRequest.nombrePerrito ? ` (${currentRequest.nombrePerrito})` : ""} por medio de
            una adopcion asociada.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados, usuarios y tipos de solicitud disponibles para completar este
            formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Solicitante</span>
                  <select
                    className="form-select"
                    {...register("identificacion", {
                      required: "El solicitante es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un solicitante</option>
                    {userOptions.map((user) => (
                      <option key={user.identificacion} value={user.identificacion}>
                        {buildUserLabel(user)}
                      </option>
                    ))}
                  </select>
                  {errors.identificacion ? <small>{errors.identificacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Tipo de solicitud</span>
                  <select
                    className="form-select"
                    {...register("idTipoSolicitud", {
                      required: "El tipo de solicitud es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un tipo de solicitud</option>
                    {requestTypeOptions.map((requestType) => (
                      <option key={requestType.idTipoSolicitud} value={requestType.idTipoSolicitud}>
                        {requestType.nombre}
                        {Number(requestType.idEstado) !== 1
                          ? ` (${requestType.estado || "Inactivo"})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {errors.idTipoSolicitud ? <small>{errors.idTipoSolicitud.message}</small> : null}
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

            {selectedUser ? (
              <p className="dashboard-muted">
                Solicitante seleccionado: {buildUserLabel(selectedUser)}
                {selectedUser.estado ? ` (${selectedUser.estado})` : ""}.
              </p>
            ) : null}

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear solicitud"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/solicitudes">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default RequestFormPage;
