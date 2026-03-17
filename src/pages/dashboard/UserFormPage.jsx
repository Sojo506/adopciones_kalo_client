import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as usersApi from "../../api/users";
import * as catalogsApi from "../../api/catalogs";
import * as locationsApi from "../../api/locations";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  identificacion: "",
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  correo: "",
  password: "",
  idTipoUsuario: "",
  idEstado: "",
  idPais: "",
  idProvincia: "",
  idCanton: "",
  idDistrito: "",
  calle: "",
  numero: "",
};

const mapUserToForm = (user) => ({
  identificacion: String(user.identificacion ?? ""),
  nombre: user.nombre ?? "",
  apellidoPaterno: user.apellidoPaterno ?? "",
  apellidoMaterno: user.apellidoMaterno ?? "",
  correo: user.cuenta?.correo ?? "",
  password: "",
  idTipoUsuario: String(user.idTipoUsuario ?? ""),
  idEstado: String(user.idEstado ?? ""),
  idPais: String(user.direccion?.idPais ?? ""),
  idProvincia: String(user.direccion?.idProvincia ?? ""),
  idCanton: String(user.direccion?.idCanton ?? ""),
  idDistrito: String(user.direccion?.idDistrito ?? ""),
  calle: user.direccion?.calle ?? "",
  numero: user.direccion?.numero ?? "",
});

const buildPayload = (values, isEditing) => {
  const payload = {
    identificacion: Number(values.identificacion),
    nombre: values.nombre.trim(),
    apellidoPaterno: values.apellidoPaterno.trim(),
    apellidoMaterno: values.apellidoMaterno.trim(),
    correo: values.correo.trim(),
    idTipoUsuario: Number(values.idTipoUsuario),
    idEstado: Number(values.idEstado),
    idPais: Number(values.idPais),
    idProvincia: Number(values.idProvincia),
    idCanton: Number(values.idCanton),
    idDistrito: Number(values.idDistrito),
    calle: values.calle.trim(),
    numero: values.numero.trim(),
  };

  if (!isEditing || values.password.trim()) {
    payload.password = values.password.trim();
  }

  return payload;
};

const UserFormPage = () => {
  const { identificacion } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);

  const isEditing = Boolean(identificacion);
  const isProtectedUser =
    isAdmin && isEditing && Number(identificacion) === Number(user?.identificacion);
  const formDisabled = catalogsLoading || detailLoading || saving || isProtectedUser;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedCountry = watch("idPais");
  const watchedProvince = watch("idProvincia");
  const watchedCanton = watch("idCanton");

  useEffect(() => {
    document.title = isEditing ? "Editar usuario | Dashboard Kalö" : "Nuevo usuario | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [userTypesData, statesData, countriesData] = await Promise.all([
          catalogsApi.getUserTypes(),
          catalogsApi.getStates(),
          locationsApi.getCountries(),
        ]);

        setUserTypes(Array.isArray(userTypesData) ? userTypesData : []);
        setStates(Array.isArray(statesData) ? statesData : []);
        setCountries(Array.isArray(countriesData) ? countriesData : []);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idTipoUsuario: String(userTypesData?.[0]?.idTipoUsuario ?? ""),
            idEstado: String(statesData?.[0]?.idEstado ?? ""),
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar catalogos",
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

    const loadUser = async () => {
      try {
        setDetailLoading(true);
        const detail = await usersApi.getUserByIdentification(identificacion);
        reset(mapUserToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el usuario",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/usuarios");
      } finally {
        setDetailLoading(false);
      }
    };

    loadUser();
  }, [identificacion, isEditing, navigate, reset]);

  useEffect(() => {
    if (!watchedCountry) {
      setProvinces([]);
      setCantons([]);
      setDistricts([]);
      return;
    }

    const loadProvinces = async () => {
      const data = await locationsApi.getProvinces(Number(watchedCountry));
      setProvinces(Array.isArray(data) ? data : []);
    };

    loadProvinces().catch((error) => console.error("Provinces error", error));
  }, [watchedCountry]);

  useEffect(() => {
    if (!watchedProvince) {
      setCantons([]);
      setDistricts([]);
      return;
    }

    const loadCantons = async () => {
      const data = await locationsApi.getCantons(Number(watchedProvince));
      setCantons(Array.isArray(data) ? data : []);
    };

    loadCantons().catch((error) => console.error("Cantons error", error));
  }, [watchedProvince]);

  useEffect(() => {
    if (!watchedCanton) {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      const data = await locationsApi.getDistricts(Number(watchedCanton));
      setDistricts(Array.isArray(data) ? data : []);
    };

    loadDistricts().catch((error) => console.error("Districts error", error));
  }, [watchedCanton]);

  const handleCountryChange = (event) => {
    setValue("idPais", event.target.value);
    setValue("idProvincia", "");
    setValue("idCanton", "");
    setValue("idDistrito", "");
  };

  const handleProvinceChange = (event) => {
    setValue("idProvincia", event.target.value);
    setValue("idCanton", "");
    setValue("idDistrito", "");
  };

  const handleCantonChange = (event) => {
    setValue("idCanton", event.target.value);
    setValue("idDistrito", "");
  };

  const onSubmit = async (values) => {
    if (isProtectedUser) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values, isEditing);

      if (isEditing) {
        await usersApi.updateUser(identificacion, payload);
      } else {
        await usersApi.createUser(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Usuario actualizado" : "Usuario creado",
        text: isEditing ? "Los cambios quedaron guardados." : "El usuario fue creado correctamente.",
      });

      navigate("/dashboard/usuarios");
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar usuario" : "Nuevo usuario"}</p>
          <h1>{isEditing ? "Actualizar usuario" : "Crear usuario"}</h1>
          <p className="dashboard-page__lede">
            {isEditing
              ? "Modifica perfil, cuenta y direccion desde una sola pantalla."
              : "Completa la informacion del perfil, la cuenta y la ubicacion del nuevo usuario."}
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/usuarios">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            {isProtectedUser ? (
              <div className="dashboard-alert">
                Este admin en sesion esta protegido. Puedes revisar su informacion, pero no
                modificarla desde aqui.
              </div>
            ) : null}

            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Identificacion</span>
                  <input
                    className="form-control"
                    disabled={isEditing || formDisabled}
                    type="number"
                    {...register("identificacion", { required: "La identificacion es obligatoria" })}
                  />
                  {errors.identificacion ? <small>{errors.identificacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Correo</span>
                  <input
                    className="form-control"
                    type="email"
                    {...register("correo", { required: "El correo es obligatorio" })}
                  />
                  {errors.correo ? <small>{errors.correo.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Nombre</span>
                  <input className="form-control" {...register("nombre", { required: "Requerido" })} />
                  {errors.nombre ? <small>{errors.nombre.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Apellido paterno</span>
                  <input
                    className="form-control"
                    {...register("apellidoPaterno", { required: "Requerido" })}
                  />
                  {errors.apellidoPaterno ? <small>{errors.apellidoPaterno.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Apellido materno</span>
                  <input
                    className="form-control"
                    {...register("apellidoMaterno", { required: "Requerido" })}
                  />
                  {errors.apellidoMaterno ? <small>{errors.apellidoMaterno.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>{isEditing ? "Nueva password" : "Password"}</span>
                  <input
                    className="form-control"
                    placeholder={isEditing ? "Opcional para conservar la actual" : ""}
                    type="password"
                    {...register("password", {
                      validate: (value) =>
                        isEditing || value.trim().length >= 6
                          ? true
                          : "La password debe tener al menos 6 caracteres",
                    })}
                  />
                  {errors.password ? <small>{errors.password.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Tipo de usuario</span>
                  <select className="form-select" {...register("idTipoUsuario", { required: true })}>
                    <option value="">Selecciona una opcion</option>
                    {userTypes.map((option) => (
                      <option key={option.idTipoUsuario} value={option.idTipoUsuario}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dashboard-input">
                  <span>Estado</span>
                  <select className="form-select" {...register("idEstado", { required: true })}>
                    <option value="">Selecciona una opcion</option>
                    {states.map((option) => (
                      <option key={option.idEstado} value={option.idEstado}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dashboard-input">
                  <span>Pais</span>
                  <select
                    className="form-select"
                    {...register("idPais", { required: true })}
                    onChange={handleCountryChange}
                  >
                    <option value="">Selecciona un pais</option>
                    {countries.map((option) => (
                      <option key={option.idPais} value={option.idPais}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dashboard-input">
                  <span>Provincia</span>
                  <select
                    className="form-select"
                    {...register("idProvincia", { required: true })}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Selecciona una provincia</option>
                    {provinces.map((option) => (
                      <option key={option.idProvincia} value={option.idProvincia}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dashboard-input">
                  <span>Canton</span>
                  <select
                    className="form-select"
                    {...register("idCanton", { required: true })}
                    onChange={handleCantonChange}
                  >
                    <option value="">Selecciona un canton</option>
                    {cantons.map((option) => (
                      <option key={option.idCanton} value={option.idCanton}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dashboard-input">
                  <span>Distrito</span>
                  <select className="form-select" {...register("idDistrito", { required: true })}>
                    <option value="">Selecciona un distrito</option>
                    {districts.map((option) => (
                      <option key={option.idDistrito} value={option.idDistrito}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dashboard-input">
                  <span>Calle</span>
                  <input className="form-control" {...register("calle")} />
                </label>

                <label className="dashboard-input">
                  <span>Numero</span>
                  <input className="form-control" {...register("numero")} />
                </label>
              </div>

              <div className="dashboard-form__actions">
                <button
                  className="dashboard-btn dashboard-btn--primary"
                  disabled={formDisabled}
                  type="submit"
                >
                  {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}
                </button>
                <Link
                  aria-disabled={saving}
                  className={`dashboard-btn dashboard-btn--ghost${saving ? " is-disabled" : ""}`}
                  onClick={(event) => {
                    if (saving) {
                      event.preventDefault();
                    }
                  }}
                  to="/dashboard/usuarios"
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

export default UserFormPage;
