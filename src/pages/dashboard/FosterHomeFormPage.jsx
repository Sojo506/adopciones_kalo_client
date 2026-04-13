import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as addressesApi from "../../api/addresses";
import * as catalogsApi from "../../api/catalogs";
import * as fosterHomesApi from "../../api/fosterHomes";
import * as requestsApi from "../../api/requests";
import * as usersApi from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  idDireccion: "",
  identificacion: "",
  idSolicitud: "",
  idEstado: "1",
};

const CASA_CUNA_REQUEST_TYPE_KEY = "casa cuna";

const normalizeCatalogName = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const buildManagerLabel = (user) => {
  const fullName = [user?.nombre, user?.apellidoPaterno, user?.apellidoMaterno]
    .filter(Boolean)
    .join(" ");

  if (!fullName) {
    return String(user?.identificacion || "");
  }

  return `${user.identificacion} - ${fullName}`;
};

const buildAddressLabel = (address) => {
  const hierarchy = [address?.distrito, address?.canton, address?.provincia, address?.pais]
    .filter(Boolean)
    .join(", ");
  const line = [address?.calle, address?.numero].filter(Boolean).join(" ");

  if (line && hierarchy) {
    return `${line} - ${hierarchy}`;
  }

  return line || hierarchy || "Direccion disponible";
};

const buildRequestLabel = (request) => {
  const parts = [`#${request.idSolicitud}`];

  if (request.solicitante) {
    parts.push(request.solicitante);
  }

  if (request.tipoSolicitud) {
    parts.push(request.tipoSolicitud);
  }

  return parts.join(" - ");
};

const mapFosterHomeToForm = (fosterHome) => ({
  nombre: fosterHome?.nombre ?? "",
  idDireccion: String(fosterHome?.idDireccion ?? ""),
  identificacion: String(fosterHome?.identificacion ?? ""),
  idSolicitud: fosterHome?.idSolicitud ? String(fosterHome.idSolicitud) : "",
  idEstado: String(fosterHome?.idEstado ?? "1"),
});

const buildPayload = (values) => ({
  nombre: values.nombre.trim(),
  idDireccion: Number(values.idDireccion),
  identificacion: values.identificacion.trim(),
  idSolicitud: values.idSolicitud ? Number(values.idSolicitud) : null,
  idEstado: Number(values.idEstado),
});

const getSelectableRequests = ({
  requests,
  fosterHomes,
  currentFosterHome,
  selectedIdentification,
}) => {
  const currentRequestId = Number(currentFosterHome?.idSolicitud || 0);
  const usedRequestIds = new Set(
    (Array.isArray(fosterHomes) ? fosterHomes : [])
      .filter((fosterHome) => Number(fosterHome.idCasaCuna) !== Number(currentFosterHome?.idCasaCuna))
      .map((fosterHome) => Number(fosterHome.idSolicitud || 0))
      .filter(Boolean),
  );

  return (Array.isArray(requests) ? requests : []).filter((request) => {
    const isCurrent = Number(request.idSolicitud) === currentRequestId;

    if (isCurrent) {
      return true;
    }

    if (Number(request.idEstado) !== 1) {
      return false;
    }

    const isCasaCunaRequest =
      normalizeCatalogName(request.tipoSolicitud) === CASA_CUNA_REQUEST_TYPE_KEY;

    if (!isCasaCunaRequest) {
      return false;
    }

    if (!selectedIdentification) {
      return false;
    }

    if (
      selectedIdentification &&
      String(request.identificacion) !== String(selectedIdentification)
    ) {
      return false;
    }

    return !usedRequestIds.has(Number(request.idSolicitud));
  });
};

const FosterHomeFormPage = () => {
  const { idCasaCuna } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [fosterHomes, setFosterHomes] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentFosterHome, setCurrentFosterHome] = useState(null);

  const isEditing = Boolean(idCasaCuna);

  const addressOptions = useMemo(() => {
    return addresses.filter(
      (address) =>
        Number(address.idEstado) === 1 ||
        Number(address.idDireccion) === Number(currentFosterHome?.idDireccion),
    );
  }, [addresses, currentFosterHome?.idDireccion]);

  const managerOptions = useMemo(() => {
    return users.filter(
      (user) =>
        Number(user.idEstado) === 1 ||
        String(user.identificacion) === String(currentFosterHome?.identificacion),
    );
  }, [currentFosterHome?.identificacion, users]);

  const hasRequiredData = states.length > 0 && addressOptions.length > 0 && managerOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedAddressId = watch("idDireccion");
  const watchedIdentification = watch("identificacion");
  const watchedRequestId = watch("idSolicitud");

  const requestOptions = useMemo(() => {
    return getSelectableRequests({
      requests,
      fosterHomes,
      currentFosterHome,
      selectedIdentification: watchedIdentification,
    });
  }, [currentFosterHome, fosterHomes, requests, watchedIdentification]);

  const selectedAddress = useMemo(() => {
    return (
      addressOptions.find((address) => Number(address.idDireccion) === Number(watchedAddressId)) ||
      null
    );
  }, [addressOptions, watchedAddressId]);

  const selectedManager = useMemo(() => {
    return (
      managerOptions.find(
        (user) => String(user.identificacion) === String(watchedIdentification),
      ) || null
    );
  }, [managerOptions, watchedIdentification]);

  const selectedRequest = useMemo(() => {
    return (
      requestOptions.find((request) => Number(request.idSolicitud) === Number(watchedRequestId)) ||
      null
    );
  }, [requestOptions, watchedRequestId]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar casa cuna | Dashboard Kalö"
      : "Nueva casa cuna | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, addressesData, usersData, requestsData, fosterHomesData] = await Promise.all([
          catalogsApi.getStates(),
          addressesApi.getAddresses({ force: true }),
          usersApi.getUsers({ force: true }),
          requestsApi.getRequests({ force: true }),
          fosterHomesApi.getFosterHomes({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableAddresses = Array.isArray(addressesData) ? addressesData : [];
        const availableUsers = Array.isArray(usersData) ? usersData : [];
        const availableRequests = Array.isArray(requestsData) ? requestsData : [];
        const existingFosterHomes = Array.isArray(fosterHomesData) ? fosterHomesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeAddress = availableAddresses.find((address) => Number(address.idEstado) === 1);
        const activeManager = availableUsers.find((user) => Number(user.idEstado) === 1);

        setStates(availableStates);
        setAddresses(availableAddresses);
        setUsers(availableUsers);
        setRequests(availableRequests);
        setFosterHomes(existingFosterHomes);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idDireccion: String(activeAddress?.idDireccion ?? ""),
            identificacion: String(activeManager?.identificacion ?? ""),
            idSolicitud: "",
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

    const loadFosterHome = async () => {
      try {
        setDetailLoading(true);
        const detail = await fosterHomesApi.getFosterHomeById(idCasaCuna, { force: true });
        setCurrentFosterHome(detail);
        reset(mapFosterHomeToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la casa cuna",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/casas-cuna");
      } finally {
        setDetailLoading(false);
      }
    };

    loadFosterHome();
  }, [idCasaCuna, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await fosterHomesApi.updateFosterHome(idCasaCuna, payload);
      } else {
        await fosterHomesApi.createFosterHome(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Casa cuna actualizada" : "Casa cuna creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La casa cuna fue creada correctamente.",
      });

      navigate("/dashboard/casas-cuna");
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
          <h1>Casas cuna</h1>
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
            {isEditing ? "Editar casa cuna" : "Nueva casa cuna"}
          </p>
          <h1>{isEditing ? "Actualizar casa cuna" : "Crear casa cuna"}</h1>
          <p className="dashboard-page__lede">
            Define el hogar temporal, su encargado, la direccion operativa y la solicitud de Casa
            Cuna cuando aplique.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/casas-cuna">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          La solicitud es opcional. Si la asignas, solo se muestran solicitudes activas de tipo
          Casa Cuna del mismo encargado y que todavia no esten usadas por otra casa cuna.
        </div>

        <div className="dashboard-alert">
          No se puede dejar activa una casa cuna si su direccion, encargado o solicitud asociada
          quedaron inactivos.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados, direcciones y encargados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Nombre</span>
                  <input
                    className="form-control"
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      maxLength: {
                        value: 100,
                        message: "El nombre no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.nombre ? <small>{errors.nombre.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Direccion</span>
                  <select
                    className="form-select"
                    {...register("idDireccion", {
                      required: "La direccion es obligatoria",
                    })}
                  >
                    <option value="">Selecciona una direccion</option>
                    {addressOptions.map((address) => (
                      <option key={address.idDireccion} value={address.idDireccion}>
                        {buildAddressLabel(address)}
                      </option>
                    ))}
                  </select>
                  {errors.idDireccion ? <small>{errors.idDireccion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Encargado</span>
                  <select
                    className="form-select"
                    {...register("identificacion", {
                      required: "El encargado es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un encargado</option>
                    {managerOptions.map((user) => (
                      <option key={user.identificacion} value={user.identificacion}>
                        {buildManagerLabel(user)}
                      </option>
                    ))}
                  </select>
                  {errors.identificacion ? <small>{errors.identificacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Solicitud</span>
                  <select className="form-select" {...register("idSolicitud")}>
                    <option value="">Sin solicitud asociada</option>
                    {requestOptions.map((request) => (
                      <option key={request.idSolicitud} value={request.idSolicitud}>
                        {buildRequestLabel(request)}
                      </option>
                    ))}
                  </select>
                  {errors.idSolicitud ? <small>{errors.idSolicitud.message}</small> : null}
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

            {selectedManager ? (
              <p className="dashboard-muted">Encargado seleccionado: {buildManagerLabel(selectedManager)}.</p>
            ) : null}

            {selectedAddress ? (
              <p className="dashboard-muted">Direccion seleccionada: {buildAddressLabel(selectedAddress)}.</p>
            ) : null}

            {selectedRequest ? (
              <p className="dashboard-muted">
                Solicitud seleccionada: {buildRequestLabel(selectedRequest)}.
              </p>
            ) : (
              <p className="dashboard-muted">
                Esta casa cuna quedara sin solicitud asociada hasta que selecciones una.
              </p>
            )}

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear casa cuna"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/casas-cuna">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default FosterHomeFormPage;
