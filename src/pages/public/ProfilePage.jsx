import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getCurrentProfileOverview, updateCurrentProfile } from "../../api/profile";
import { getCantons, getCountries, getDistricts, getProvinces } from "../../api/locations";
import { initializeAuth } from "../../store/authSlice";

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

const formatMoney = (amount, symbol) => {
  const formattedAmount = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
  return symbol ? `${symbol} ${formattedAmount}` : formattedAmount;
};

const buildFullName = (profile) =>
  [profile?.nombre, profile?.apellidoPaterno, profile?.apellidoMaterno].filter(Boolean).join(" ") ||
  profile?.usuario ||
  "Usuario";

const mapProfileToFormValues = (profile) => ({
  identificacion: profile?.identificacion || "",
  usuario: profile?.usuario || "",
  nombre: profile?.nombre || "",
  apellidoPaterno: profile?.apellidoPaterno || "",
  apellidoMaterno: profile?.apellidoMaterno || "",
  correo: profile?.correo || "",
  telefono: profile?.telefono || "",
  password: "",
  idPais: profile?.direccion?.idPais ? String(profile.direccion.idPais) : "",
  idProvincia: profile?.direccion?.idProvincia ? String(profile.direccion.idProvincia) : "",
  idCanton: profile?.direccion?.idCanton ? String(profile.direccion.idCanton) : "",
  idDistrito: profile?.direccion?.idDistrito ? String(profile.direccion.idDistrito) : "",
  calle: profile?.direccion?.calle || "",
  numero: profile?.direccion?.numero || "",
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identificacion: "",
      usuario: "",
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      correo: "",
      telefono: "",
      password: "",
      idPais: "",
      idProvincia: "",
      idCanton: "",
      idDistrito: "",
      calle: "",
      numero: "",
    },
  });

  const profile = overview?.profile || null;
  const adoptionRequests = overview?.adoptionRequests || [];
  const purchases = overview?.purchases || [];
  const fosterHomes = overview?.fosterHomes || [];
  const summary = overview?.summary || null;
  const displayName = buildFullName(profile);
  const verifyEmailPath = profile?.correo
    ? `/verify-email?correo=${encodeURIComponent(profile.correo)}`
    : "/verify-email";

  const totalItemsPurchased = useMemo(
    () =>
      purchases.reduce(
        (accumulator, purchase) =>
          accumulator +
          purchase.items.reduce((itemAccumulator, item) => itemAccumulator + Number(item.cantidad || 0), 0),
        0,
      ),
    [purchases],
  );

  useEffect(() => {
    document.title = "Mi perfil | Adopciones Kalo";
  }, []);

  const hydrateLocationOptions = async (nextProfile) => {
    const countryId = nextProfile?.direccion?.idPais;
    const provinceId = nextProfile?.direccion?.idProvincia;
    const cantonId = nextProfile?.direccion?.idCanton;

    setProvinces([]);
    setCantons([]);
    setDistricts([]);

    if (!countryId) return;

    setLoadingProvinces(true);
    try {
      const nextProvinces = await getProvinces(countryId);
      setProvinces(Array.isArray(nextProvinces) ? nextProvinces : []);
    } finally {
      setLoadingProvinces(false);
    }

    if (!provinceId) return;

    setLoadingCantons(true);
    try {
      const nextCantons = await getCantons(provinceId);
      setCantons(Array.isArray(nextCantons) ? nextCantons : []);
    } finally {
      setLoadingCantons(false);
    }

    if (!cantonId) return;

    setLoadingDistricts(true);
    try {
      const nextDistricts = await getDistricts(cantonId);
      setDistricts(Array.isArray(nextDistricts) ? nextDistricts : []);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const applyOverview = async (nextOverview) => {
    setOverview(nextOverview);
    reset(mapProfileToFormValues(nextOverview?.profile || null));
    await hydrateLocationOptions(nextOverview?.profile || null);
  };

  useEffect(() => {
    let ignore = false;

    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await getCountries();
        if (!ignore) setCountries(Array.isArray(data) ? data : []);
      } catch (countriesError) {
        if (!ignore) {
          Swal.fire({
            icon: "error",
            title: "Ubicaciones no disponibles",
            text:
              countriesError?.response?.data?.message ||
              "No pudimos cargar los paises para el formulario.",
          });
        }
      } finally {
        if (!ignore) setLoadingCountries(false);
      }
    };

    loadCountries();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCurrentProfileOverview({ force: true });
        if (!ignore) {
          await applyOverview(data);
        }
      } catch (profileError) {
        if (!ignore) {
          setError("No pudimos cargar tu perfil en este momento.");
          Swal.fire({
            icon: "error",
            title: "Perfil no disponible",
            text:
              profileError?.response?.data?.message ||
              "Intenta nuevamente en unos segundos para revisar tu informacion.",
          });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      ignore = true;
    };
  }, [reset]);

  const handleCountryChange = async (event) => {
    const selectedCountryId = event.target.value;
    setValue("idProvincia", "");
    setValue("idCanton", "");
    setValue("idDistrito", "");
    setProvinces([]);
    setCantons([]);
    setDistricts([]);
    if (!selectedCountryId) return;
    setLoadingProvinces(true);
    try {
      const data = await getProvinces(selectedCountryId);
      setProvinces(Array.isArray(data) ? data : []);
    } catch (countryError) {
      Swal.fire({
        icon: "error",
        title: "Provincias no disponibles",
        text:
          countryError?.response?.data?.message ||
          "No pudimos cargar las provincias para el pais seleccionado.",
      });
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (event) => {
    const selectedProvinceId = event.target.value;
    setValue("idCanton", "");
    setValue("idDistrito", "");
    setCantons([]);
    setDistricts([]);
    if (!selectedProvinceId) return;
    setLoadingCantons(true);
    try {
      const data = await getCantons(selectedProvinceId);
      setCantons(Array.isArray(data) ? data : []);
    } catch (provinceError) {
      Swal.fire({
        icon: "error",
        title: "Cantones no disponibles",
        text:
          provinceError?.response?.data?.message ||
          "No pudimos cargar los cantones para la provincia seleccionada.",
      });
    } finally {
      setLoadingCantons(false);
    }
  };

  const handleCantonChange = async (event) => {
    const selectedCantonId = event.target.value;
    setValue("idDistrito", "");
    setDistricts([]);
    if (!selectedCantonId) return;
    setLoadingDistricts(true);
    try {
      const data = await getDistricts(selectedCantonId);
      setDistricts(Array.isArray(data) ? data : []);
    } catch (cantonError) {
      Swal.fire({
        icon: "error",
        title: "Distritos no disponibles",
        text:
          cantonError?.response?.data?.message ||
          "No pudimos cargar los distritos para el canton seleccionado.",
      });
    } finally {
      setLoadingDistricts(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      setSaving(true);
      const nextOverview = await updateCurrentProfile({
        usuario: values.usuario.trim(),
        nombre: values.nombre.trim(),
        apellidoPaterno: values.apellidoPaterno.trim(),
        apellidoMaterno: values.apellidoMaterno.trim(),
        telefono: values.telefono.trim(),
        password: values.password.trim(),
        idPais: Number(values.idPais),
        idProvincia: Number(values.idProvincia),
        idCanton: Number(values.idCanton),
        idDistrito: Number(values.idDistrito),
        calle: values.calle.trim(),
        numero: values.numero.trim(),
      });
      await applyOverview(nextOverview);
      await dispatch(initializeAuth());
      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Tus datos se guardaron correctamente.",
      });
    } catch (saveError) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar tus cambios",
        text:
          saveError?.response?.data?.message ||
          "Revisa los datos ingresados e intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="container profile-shell">
        <section className="profile-hero">
          <div>
            <span className="profile-pill">Perfil de usuario</span>
            <h1>
              Todo tu proceso en un solo lugar, <em className="hero-highlight">{displayName}</em>.
            </h1>
            <p>
              Revisa tu informacion general, ajusta tus datos de contacto, consulta el estado de tus
              solicitudes de adopcion, tu historial de compras y las casas cuna asociadas a tu cuenta.
            </p>
          </div>

          <div className="profile-hero__aside">
            <article>
              <strong>{summary?.totalSolicitudesAdopcion ?? adoptionRequests.length}</strong>
              <span>Solicitudes de adopcion</span>
            </article>
            <article>
              <strong>{summary?.totalCompras ?? purchases.length}</strong>
              <span>Compras registradas</span>
            </article>
            <article>
              <strong>{summary?.totalCasasCuna ?? fosterHomes.length}</strong>
              <span>Casas cuna vinculadas</span>
            </article>
            <article>
              <strong>{summary?.totalPerritosAlojados ?? 0}</strong>
              <span>Perritos alojados</span>
            </article>
          </div>
        </section>

        {loading ? (
          <div className="profile-empty">Cargando tu perfil...</div>
        ) : error ? (
          <div className="profile-empty profile-empty--error">{error}</div>
        ) : !profile ? (
          <div className="profile-empty">No encontramos informacion para esta cuenta.</div>
        ) : (
          <div className="profile-layout">
            <section className="profile-panel profile-panel--intro">
              <div className="profile-panel__header">
                <div>
                  <p className="profile-panel__eyebrow">Resumen general</p>
                  <h2>{displayName}</h2>
                </div>
                <div className="profile-chip-list">
                  <span className="profile-status-chip">{profile.estadoUsuario || "Estado usuario"}</span>
                  <span className="profile-status-chip profile-status-chip--soft">
                    Cuenta: {profile.estadoCuenta || "Sin estado"}
                  </span>
                  <span
                    className={`profile-status-chip${
                      Number(profile.idEstadoCorreo) === 1
                        ? " profile-status-chip--success"
                        : " profile-status-chip--warning"
                    }`}
                  >
                    Correo: {profile.estadoCorreo || "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="profile-info-grid">
                <article className="profile-info-card">
                  <span>Identificacion</span>
                  <strong>{profile.identificacion}</strong>
                  <small>Dato base del expediente.</small>
                </article>
                <article className="profile-info-card">
                  <span>Usuario</span>
                  <strong>{profile.usuario || "-"}</strong>
                  <small>Acceso visible en tu sesion actual.</small>
                </article>
                <article className="profile-info-card">
                  <span>Correo</span>
                  <strong>{profile.correo || "-"}</strong>
                  <small>Se muestra solo como referencia y no puede editarse aqui.</small>
                </article>
                <article className="profile-info-card">
                  <span>Telefono</span>
                  <strong>{profile.telefono || "Sin telefono"}</strong>
                  <small>Usado para contacto y seguimiento.</small>
                </article>
                <article className="profile-info-card">
                  <span>Direccion</span>
                  <strong>{profile.direccion?.ubicacion || "Sin direccion registrada"}</strong>
                  <small>
                    {[profile.direccion?.calle, profile.direccion?.numero].filter(Boolean).join(" ") ||
                      "Sin detalle adicional"}
                  </small>
                </article>
                <article className="profile-info-card">
                  <span>Registro</span>
                  <strong>{formatDate(profile.fechaRegistro)}</strong>
                  <small>Cuenta actual: {profile.estadoCuenta || "Sin estado"}.</small>
                </article>
              </div>

              {Number(profile.idEstadoCorreo) !== 1 && (
                <div className="profile-callout profile-callout--warning">
                  <div>
                    <strong>Tu correo aun no esta verificado</strong>
                    <span>
                      Verificarlo ayuda a mantener habilitadas futuras acciones dentro de tu cuenta.
                    </span>
                  </div>
                  <Link className="header-action header-action--warning" to={verifyEmailPath}>
                    Verificar correo
                  </Link>
                </div>
              )}
            </section>

            <section className="profile-panel profile-panel--form">
              <div className="profile-panel__header">
                <div>
                  <p className="profile-panel__eyebrow">Actualiza tus datos</p>
                  <h2>Edita tu informacion</h2>
                </div>
                <span className="profile-panel__note">El correo permanece bloqueado por seguridad.</span>
              </div>

              <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="profile-form-grid">
                  <label className="profile-input">
                    <span>Identificacion</span>
                    <input {...register("identificacion")} className="form-control" disabled type="text" />
                  </label>

                  <label className="profile-input">
                    <span>Correo</span>
                    <input {...register("correo")} className="form-control" disabled type="email" />
                  </label>

                  <label className="profile-input">
                    <span>Usuario</span>
                    <input
                      {...register("usuario", { required: "El usuario es obligatorio" })}
                      className={`form-control ${errors.usuario ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.usuario ? <small className="text-danger">{errors.usuario.message}</small> : null}
                  </label>

                  <label className="profile-input">
                    <span>Telefono</span>
                    <input
                      {...register("telefono", {
                        required: "El telefono es obligatorio",
                        pattern: {
                          value: /^[0-9()+\s-]{6,20}$/,
                          message: "Ingresa un telefono valido",
                        },
                      })}
                      className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.telefono ? <small className="text-danger">{errors.telefono.message}</small> : null}
                  </label>

                  <label className="profile-input">
                    <span>Nombre</span>
                    <input
                      {...register("nombre", { required: "El nombre es obligatorio" })}
                      className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.nombre ? <small className="text-danger">{errors.nombre.message}</small> : null}
                  </label>

                  <label className="profile-input">
                    <span>Apellido paterno</span>
                    <input
                      {...register("apellidoPaterno", { required: "El apellido paterno es obligatorio" })}
                      className={`form-control ${errors.apellidoPaterno ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.apellidoPaterno ? (
                      <small className="text-danger">{errors.apellidoPaterno.message}</small>
                    ) : null}
                  </label>

                  <label className="profile-input">
                    <span>Apellido materno</span>
                    <input
                      {...register("apellidoMaterno", { required: "El apellido materno es obligatorio" })}
                      className={`form-control ${errors.apellidoMaterno ? "is-invalid" : ""}`}
                      type="text"
                    />
                    {errors.apellidoMaterno ? (
                      <small className="text-danger">{errors.apellidoMaterno.message}</small>
                    ) : null}
                  </label>

                  <label className="profile-input">
                    <span>Nueva contrasena</span>
                    <input
                      {...register("password", {
                        minLength: { value: 6, message: "Minimo 6 caracteres" },
                      })}
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      type="password"
                      placeholder="Deja vacio para conservar la actual"
                    />
                    {errors.password ? <small className="text-danger">{errors.password.message}</small> : null}
                  </label>

                  <label className="profile-input">
                    <span>Pais</span>
                    <select
                      {...register("idPais", {
                        required: "El pais es obligatorio",
                        onChange: handleCountryChange,
                      })}
                      className={`form-select ${errors.idPais ? "is-invalid" : ""}`}
                      disabled={loadingCountries}
                    >
                      <option value="">{loadingCountries ? "Cargando paises..." : "Selecciona un pais"}</option>
                      {countries.map((country) => (
                        <option key={country.idPais} value={country.idPais}>
                          {country.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idPais ? <small className="text-danger">{errors.idPais.message}</small> : null}
                  </label>

                  <label className="profile-input">
                    <span>Provincia</span>
                    <select
                      {...register("idProvincia", {
                        required: "La provincia es obligatoria",
                        onChange: handleProvinceChange,
                      })}
                      className={`form-select ${errors.idProvincia ? "is-invalid" : ""}`}
                      disabled={loadingProvinces || !provinces.length}
                    >
                      <option value="">
                        {loadingProvinces ? "Cargando provincias..." : "Selecciona una provincia"}
                      </option>
                      {provinces.map((province) => (
                        <option key={province.idProvincia} value={province.idProvincia}>
                          {province.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idProvincia ? (
                      <small className="text-danger">{errors.idProvincia.message}</small>
                    ) : null}
                  </label>

                  <label className="profile-input">
                    <span>Canton</span>
                    <select
                      {...register("idCanton", {
                        required: "El canton es obligatorio",
                        onChange: handleCantonChange,
                      })}
                      className={`form-select ${errors.idCanton ? "is-invalid" : ""}`}
                      disabled={loadingCantons || !cantons.length}
                    >
                      <option value="">
                        {loadingCantons ? "Cargando cantones..." : "Selecciona un canton"}
                      </option>
                      {cantons.map((canton) => (
                        <option key={canton.idCanton} value={canton.idCanton}>
                          {canton.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idCanton ? <small className="text-danger">{errors.idCanton.message}</small> : null}
                  </label>

                  <label className="profile-input">
                    <span>Distrito</span>
                    <select
                      {...register("idDistrito", {
                        required: "El distrito es obligatorio",
                      })}
                      className={`form-select ${errors.idDistrito ? "is-invalid" : ""}`}
                      disabled={loadingDistricts || !districts.length}
                    >
                      <option value="">
                        {loadingDistricts ? "Cargando distritos..." : "Selecciona un distrito"}
                      </option>
                      {districts.map((district) => (
                        <option key={district.idDistrito} value={district.idDistrito}>
                          {district.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idDistrito ? <small className="text-danger">{errors.idDistrito.message}</small> : null}
                  </label>

                  <label className="profile-input">
                    <span>Calle o detalle</span>
                    <input {...register("calle")} className="form-control" type="text" />
                  </label>

                  <label className="profile-input">
                    <span>Numero o referencia</span>
                    <input {...register("numero")} className="form-control" type="text" />
                  </label>
                </div>

                <div className="profile-form__actions">
                  <p>
                    Puedes actualizar tus datos personales y de ubicacion desde aqui. El correo
                    permanece visible solo como referencia.
                  </p>
                  <button className="home-btn home-btn--primary" disabled={saving} type="submit">
                    {saving ? "Guardando cambios..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </section>

            <section className="profile-panel">
              <div className="profile-panel__header">
                <div>
                  <p className="profile-panel__eyebrow">Adopciones</p>
                  <h2>Solicitudes enviadas</h2>
                </div>
                <span className="profile-panel__note">{adoptionRequests.length} registradas</span>
              </div>

              {!adoptionRequests.length ? (
                <div className="profile-empty-state">
                  Aun no tienes solicitudes de adopcion registradas.
                </div>
              ) : (
                <div className="profile-stack">
                  {adoptionRequests.map((request) => (
                    <article key={request.idSolicitud} className="profile-collection-card">
                      <div className="profile-collection-card__header">
                        <div>
                          <span className="profile-collection-card__eyebrow">
                            Solicitud #{request.idSolicitud}
                          </span>
                          <h3>{request.nombrePerrito || "Perrito pendiente de asociar"}</h3>
                        </div>
                        <div className="profile-chip-list">
                          <span className="profile-status-chip profile-status-chip--soft">
                            Solicitud: {request.estadoSolicitud || "Sin estado"}
                          </span>
                          <span
                            className={`profile-status-chip${
                              request.estadoProceso ? " profile-status-chip--success" : ""
                            }`}
                          >
                            {request.estadoProceso ? `Proceso: ${request.estadoProceso}` : "En revision"}
                          </span>
                        </div>
                      </div>

                      <div className="profile-detail-grid">
                        <article>
                          <span>Perrito</span>
                          <strong>
                            {request.idPerrito
                              ? `#${request.idPerrito}${request.nombrePerrito ? ` - ${request.nombrePerrito}` : ""}`
                              : "Sin perrito asociado"}
                          </strong>
                        </article>
                        <article>
                          <span>Tipo</span>
                          <strong>{request.tipoSolicitud || "Adopcion"}</strong>
                        </article>
                        <article>
                          <span>Adopcion</span>
                          <strong>{request.idAdopcion ? `#${request.idAdopcion}` : "Pendiente"}</strong>
                        </article>
                        <article>
                          <span>Fecha de proceso</span>
                          <strong>{formatDate(request.fechaAdopcion)}</strong>
                        </article>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="profile-panel">
              <div className="profile-panel__header">
                <div>
                  <p className="profile-panel__eyebrow">Compras</p>
                  <h2>Resumen de compras realizadas</h2>
                </div>
                <span className="profile-panel__note">
                  {purchases.length} compras, {totalItemsPurchased} articulos
                </span>
              </div>

              {!purchases.length ? (
                <div className="profile-empty-state">
                  No hay compras registradas para esta cuenta todavia.
                </div>
              ) : (
                <div className="profile-stack">
                  {purchases.map((purchase) => {
                    const invoiceSymbol = purchase.facturas[0]?.simbolo || null;

                    return (
                      <article key={purchase.idVenta} className="profile-collection-card">
                        <div className="profile-collection-card__header">
                          <div>
                            <span className="profile-collection-card__eyebrow">Venta #{purchase.idVenta}</span>
                            <h3>{formatMoney(purchase.totalVenta, invoiceSymbol)}</h3>
                          </div>
                          <div className="profile-chip-list">
                            <span className="profile-status-chip">{purchase.estado || "Sin estado"}</span>
                            <span className="profile-status-chip profile-status-chip--soft">
                              {formatDateTime(purchase.fechaVenta)}
                            </span>
                          </div>
                        </div>

                        <div className="profile-detail-grid">
                          <article>
                            <span>Total de compra</span>
                            <strong>{formatMoney(purchase.totalVenta, invoiceSymbol)}</strong>
                          </article>
                          <article>
                            <span>Facturas relacionadas</span>
                            <strong>{purchase.facturas.length || 0}</strong>
                          </article>
                          <article>
                            <span>Productos</span>
                            <strong>{purchase.items.length || 0}</strong>
                          </article>
                          <article>
                            <span>Fecha</span>
                            <strong>{formatDateTime(purchase.fechaVenta)}</strong>
                          </article>
                        </div>

                        {purchase.items.length ? (
                          <div className="profile-subsection">
                            <span className="profile-subsection__title">Productos</span>
                            <div className="profile-inline-grid">
                              {purchase.items.map((item) => (
                                <article key={`${purchase.idVenta}-${item.idProducto}`} className="profile-inline-card">
                                  <strong>{item.producto || `Producto #${item.idProducto}`}</strong>
                                  <span>
                                    {item.cantidad} x {formatMoney(item.precioUnitario, invoiceSymbol)}
                                  </span>
                                  <small>Total: {formatMoney(item.total, invoiceSymbol)}</small>
                                </article>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {purchase.facturas.length ? (
                          <div className="profile-subsection">
                            <span className="profile-subsection__title">Facturas asociadas</span>
                            <div className="profile-inline-grid">
                              {purchase.facturas.map((invoice) => (
                                <article
                                  key={`${purchase.idVenta}-${invoice.idFactura}`}
                                  className="profile-inline-card"
                                >
                                  <strong>Factura {invoice.idFactura}</strong>
                                  <span>{invoice.estado || "Sin estado"}</span>
                                  <small>
                                    {formatMoney(invoice.totalFactura, invoice.simbolo)} -{" "}
                                    {formatDateTime(invoice.fechaFactura)}
                                  </small>
                                </article>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="profile-panel">
              <div className="profile-panel__header">
                <div>
                  <p className="profile-panel__eyebrow">Casas cuna</p>
                  <h2>Casas cuna y perritos alojados</h2>
                </div>
                <span className="profile-panel__note">{fosterHomes.length} registradas</span>
              </div>

              {!fosterHomes.length ? (
                <div className="profile-empty-state">
                  Esta cuenta no tiene casas cuna registradas actualmente.
                </div>
              ) : (
                <div className="profile-stack">
                  {fosterHomes.map((fosterHome) => (
                    <article key={fosterHome.idCasaCuna} className="profile-collection-card">
                      <div className="profile-collection-card__header">
                        <div>
                          <span className="profile-collection-card__eyebrow">
                            Casa cuna #{fosterHome.idCasaCuna}
                          </span>
                          <h3>{fosterHome.nombre || "Casa cuna sin nombre"}</h3>
                        </div>
                        <div className="profile-chip-list">
                          <span className="profile-status-chip">{fosterHome.estado || "Sin estado"}</span>
                          <span className="profile-status-chip profile-status-chip--soft">
                            {fosterHome.perrosAlojados.length} perritos alojados
                          </span>
                        </div>
                      </div>

                      <div className="profile-detail-grid">
                        <article>
                          <span>Ubicacion</span>
                          <strong>{fosterHome.ubicacion || "Sin ubicacion"}</strong>
                        </article>
                        <article>
                          <span>Detalle</span>
                          <strong>
                            {[fosterHome.calle, fosterHome.numero].filter(Boolean).join(" ") || "Sin detalle adicional"}
                          </strong>
                        </article>
                        <article>
                          <span>Solicitud vinculada</span>
                          <strong>
                            {fosterHome.idSolicitud
                              ? `#${fosterHome.idSolicitud}${fosterHome.tipoSolicitud ? ` - ${fosterHome.tipoSolicitud}` : ""}`
                              : "Sin solicitud asociada"}
                          </strong>
                        </article>
                        <article>
                          <span>Total reportado</span>
                          <strong>{fosterHome.totalPerritos}</strong>
                        </article>
                      </div>

                      <div className="profile-subsection">
                        <span className="profile-subsection__title">Perritos alojados</span>
                        {fosterHome.perrosAlojados.length ? (
                          <div className="profile-inline-grid">
                            {fosterHome.perrosAlojados.map((dog) => (
                              <article
                                key={`${fosterHome.idCasaCuna}-${dog.idPerrito}`}
                                className="profile-inline-card"
                              >
                                <strong>{dog.nombrePerrito || `Perrito #${dog.idPerrito}`}</strong>
                                <span>Expediente #{dog.idPerrito}</span>
                                <small>{dog.estado || "Activo"}</small>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="profile-empty-state profile-empty-state--compact">
                            No hay perritos activos alojados en esta casa cuna.
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
