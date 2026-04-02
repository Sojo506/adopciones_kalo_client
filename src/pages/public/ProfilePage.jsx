import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  confirmCurrentEmailChange,
  confirmCurrentPasswordChange,
  getCurrentProfileOverview,
  requestCurrentEmailChange,
  requestCurrentPasswordChange,
  updateCurrentProfile,
} from "../../api/profile";
import { getCantons, getCountries, getDistricts, getProvinces } from "../../api/locations";
import { initializeAuth, logoutUser } from "../../store/authSlice";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9()+\s-]{6,20}$/;
const OTP_PATTERN = /^\d{6}$/;

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
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short" }).format(date);
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
  idPais: profile?.direccion?.idPais ? String(profile.direccion.idPais) : "",
  idProvincia: profile?.direccion?.idProvincia ? String(profile.direccion.idProvincia) : "",
  idCanton: profile?.direccion?.idCanton ? String(profile.direccion.idCanton) : "",
  idDistrito: profile?.direccion?.idDistrito ? String(profile.direccion.idDistrito) : "",
  calle: profile?.direccion?.calle || "",
  numero: profile?.direccion?.numero || "",
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [confirmingEmailChange, setConfirmingEmailChange] = useState(false);
  const [requestingPasswordChange, setRequestingPasswordChange] = useState(false);
  const [confirmingPasswordChange, setConfirmingPasswordChange] = useState(false);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPurchaseInvoice, setSelectedPurchaseInvoice] = useState(null);
  const [emailChange, setEmailChange] = useState({ nuevoCorreo: "", codigo: "" });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    codigo: "",
  });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: mapProfileToFormValues(null) });

  const profile = overview?.profile || null;
  const adoptionRequests = overview?.adoptionRequests || [];
  const purchases = overview?.purchases || [];
  const fosterHomes = overview?.fosterHomes || [];
  const summary = overview?.summary || null;
  const displayName = buildFullName(profile);
  const isEmailVerified = Number(profile?.idEstadoCorreo) === 1;
  const verifyEmailPath = profile?.correo ? `/verify-email?correo=${encodeURIComponent(profile.correo)}` : "/verify-email";
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

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = activeModal ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeModal]);

  useEffect(() => {
    if (!activeModal || typeof window === "undefined") return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeModal]);

  const applyOverview = async (nextOverview) => {
    setOverview(nextOverview);
    reset(mapProfileToFormValues(nextOverview?.profile || null));

    const nextProfile = nextOverview?.profile || null;
    const countryId = nextProfile?.direccion?.idPais;
    const provinceId = nextProfile?.direccion?.idProvincia;
    const cantonId = nextProfile?.direccion?.idCanton;

    setProvinces([]);
    setCantons([]);
    setDistricts([]);

    setLoadingProvinces(Boolean(countryId));
    setLoadingCantons(Boolean(provinceId));
    setLoadingDistricts(Boolean(cantonId));

    try {
      const [nextProvinces, nextCantons, nextDistricts] = await Promise.all([
        countryId ? getProvinces(countryId) : Promise.resolve([]),
        provinceId ? getCantons(provinceId) : Promise.resolve([]),
        cantonId ? getDistricts(cantonId) : Promise.resolve([]),
      ]);

      setProvinces(Array.isArray(nextProvinces) ? nextProvinces : []);
      setCantons(Array.isArray(nextCantons) ? nextCantons : []);
      setDistricts(Array.isArray(nextDistricts) ? nextDistricts : []);
    } finally {
      setLoadingProvinces(false);
      setLoadingCantons(false);
      setLoadingDistricts(false);
    }
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
            text: countriesError?.response?.data?.message || "No pudimos cargar los paises para el formulario.",
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
        if (!ignore) await applyOverview(data);
      } catch (profileError) {
        if (!ignore) {
          setError("No pudimos cargar tu perfil en este momento.");
          Swal.fire({
            icon: "error",
            title: "Perfil no disponible",
            text: profileError?.response?.data?.message || "Intenta nuevamente en unos segundos.",
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

  const handleEmailChangeInput = ({ target }) =>
    setEmailChange((current) => ({ ...current, [target.name]: target.value }));

  const handlePasswordChangeInput = ({ target }) =>
    setPasswordChange((current) => ({ ...current, [target.name]: target.value }));

  const openModal = (modalName) => setActiveModal(modalName);
  const openPurchaseInvoiceModal = (purchase, invoice) => {
    setSelectedPurchaseInvoice({ purchase, invoice });
    setActiveModal("purchaseDetails");
  };
  const closeModal = () => {
    setActiveModal(null);
    setSelectedPurchaseInvoice(null);
  };

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
        text: countryError?.response?.data?.message || "No pudimos cargar las provincias.",
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
        text: provinceError?.response?.data?.message || "No pudimos cargar los cantones.",
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
        text: cantonError?.response?.data?.message || "No pudimos cargar los distritos.",
      });
    } finally {
      setLoadingDistricts(false);
    }
  };

  const validateEmailChange = ({ requireCode = false } = {}) => {
    const nuevoCorreo = emailChange.nuevoCorreo.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(nuevoCorreo)) {
      throw new Error("Ingresa un correo valido.");
    }
    if (requireCode && !OTP_PATTERN.test(emailChange.codigo.trim())) {
      throw new Error("Ingresa el codigo de 6 digitos.");
    }
    return { nuevoCorreo, codigo: emailChange.codigo.trim() };
  };

  const validatePasswordChange = ({ requireCode = false } = {}) => {
    const currentPassword = passwordChange.currentPassword;
    const newPassword = passwordChange.newPassword;
    if (!currentPassword) {
      throw new Error("La contrasena actual es obligatoria.");
    }
    if (newPassword.length < 8) {
      throw new Error("La nueva contrasena debe tener al menos 8 caracteres.");
    }
    if (newPassword !== passwordChange.confirmNewPassword) {
      throw new Error("Las nuevas contrasenas no coinciden.");
    }
    if (requireCode && !OTP_PATTERN.test(passwordChange.codigo.trim())) {
      throw new Error("Ingresa el codigo de 6 digitos.");
    }
    return { currentPassword, newPassword, codigo: passwordChange.codigo.trim() };
  };

  const handleGeneralSubmit = async (values) => {
    try {
      setSavingProfile(true);
      const nextOverview = await updateCurrentProfile({
        usuario: values.usuario.trim(),
        nombre: values.nombre.trim(),
        apellidoPaterno: values.apellidoPaterno.trim(),
        apellidoMaterno: values.apellidoMaterno.trim(),
        telefono: values.telefono.trim(),
        idPais: Number(values.idPais),
        idProvincia: Number(values.idProvincia),
        idCanton: Number(values.idCanton),
        idDistrito: Number(values.idDistrito),
        calle: values.calle.trim(),
        numero: values.numero.trim(),
      });
      await applyOverview(nextOverview);
      await dispatch(initializeAuth());
      closeModal();
      Swal.fire({ icon: "success", title: "Perfil actualizado", text: "Tus datos se guardaron correctamente." });
    } catch (saveError) {
      Swal.fire({
        icon: "error",
        title: "No pudimos guardar tus cambios",
        text: saveError?.response?.data?.message || "Revisa los datos ingresados e intenta nuevamente.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const requestEmailCode = async () => {
    try {
      const { nuevoCorreo } = validateEmailChange();
      setRequestingEmailChange(true);
      await requestCurrentEmailChange({ nuevoCorreo });
      setEmailChange({ nuevoCorreo, codigo: "" });
      Swal.fire({ icon: "success", title: "Codigo enviado", text: "Revisa el nuevo correo para confirmar el cambio." });
    } catch (requestError) {
      Swal.fire({
        icon: "error",
        title: "No pudimos iniciar el cambio de correo",
        text: requestError?.response?.data?.message || requestError.message || "Intenta nuevamente.",
      });
    } finally {
      setRequestingEmailChange(false);
    }
  };

  const confirmEmailCode = async () => {
    try {
      const { nuevoCorreo, codigo } = validateEmailChange({ requireCode: true });
      setConfirmingEmailChange(true);
      const nextOverview = await confirmCurrentEmailChange({ nuevoCorreo, codigo });
      await applyOverview(nextOverview);
      await dispatch(initializeAuth());
      setEmailChange({ nuevoCorreo: "", codigo: "" });
      closeModal();
      Swal.fire({ icon: "success", title: "Correo actualizado", text: "Tu nuevo correo ya quedo activo." });
    } catch (confirmError) {
      Swal.fire({
        icon: "error",
        title: "No pudimos confirmar el cambio de correo",
        text: confirmError?.response?.data?.message || confirmError.message || "Verifica el codigo e intenta de nuevo.",
      });
    } finally {
      setConfirmingEmailChange(false);
    }
  };

  const requestPasswordCode = async () => {
    try {
      const { currentPassword, newPassword } = validatePasswordChange();
      setRequestingPasswordChange(true);
      await requestCurrentPasswordChange({ currentPassword, newPassword });
      setPasswordChange((current) => ({ ...current, codigo: "" }));
      Swal.fire({
        icon: "success",
        title: "Codigo enviado",
        text: "Enviamos un codigo a tu correo para autorizar el cambio de contrasena.",
      });
    } catch (requestError) {
      Swal.fire({
        icon: "error",
        title: "No pudimos iniciar el cambio de contrasena",
        text: requestError?.response?.data?.message || requestError.message || "Intenta nuevamente.",
      });
    } finally {
      setRequestingPasswordChange(false);
    }
  };

  const confirmPasswordCode = async () => {
    try {
      const { currentPassword, newPassword, codigo } = validatePasswordChange({ requireCode: true });
      setConfirmingPasswordChange(true);
      await confirmCurrentPasswordChange({ currentPassword, newPassword, codigo });
      setPasswordChange({ currentPassword: "", newPassword: "", confirmNewPassword: "", codigo: "" });
      await Swal.fire({
        icon: "success",
        title: "Contrasena actualizada",
        text: "Por seguridad cerraremos tu sesion para que ingreses nuevamente.",
      });
      try {
        await dispatch(logoutUser()).unwrap();
      } catch (logoutError) {
        console.warn("Logout after password change failed", logoutError);
      }
      navigate("/login", { replace: true });
    } catch (confirmError) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cambiar tu contrasena",
        text: confirmError?.response?.data?.message || confirmError.message || "Verifica el codigo e intenta de nuevo.",
      });
    } finally {
      setConfirmingPasswordChange(false);
    }
  };

  const renderShell = (content) => (
    <section className="profile-page">
      <div className="container profile-shell">{content}</div>
    </section>
  );

  const renderHero = () => (
    <section className="profile-hero">
      <div>
        <span className="profile-pill">Perfil de usuario</span>
        <h1>
          Todo tu proceso en un solo lugar, <em className="hero-highlight">{displayName}</em>.
        </h1>
        <p>Revisa tu informacion general, compras, solicitudes y casas cuna desde un solo lugar.</p>
      </div>
      <div className="profile-hero__aside">
        <article><strong>{summary?.totalSolicitudesAdopcion ?? adoptionRequests.length}</strong><span>Solicitudes de adopcion</span></article>
        <article><strong>{summary?.totalCompras ?? purchases.length}</strong><span>Compras registradas</span></article>
        <article><strong>{summary?.totalCasasCuna ?? fosterHomes.length}</strong><span>Casas cuna vinculadas</span></article>
        <article><strong>{summary?.totalPerritosAlojados ?? 0}</strong><span>Perritos alojados</span></article>
      </div>
    </section>
  );

  const renderIntroPanel = () => (
    <section className="profile-panel profile-panel--intro">
      <div className="profile-panel__header">
        <div><p className="profile-panel__eyebrow">Resumen general</p><h2>{displayName}</h2></div>
        <span className="profile-panel__note">Informacion visible solo para tu cuenta.</span>
      </div>
      <div className="profile-info-grid">
        <article className="profile-info-card"><span>Identificacion</span><strong>{profile.identificacion}</strong><small>Dato base del expediente.</small></article>
        <article className="profile-info-card"><span>Usuario</span><strong>{profile.usuario || "-"}</strong><small>Acceso visible en tu sesion actual.</small></article>
        <article className="profile-info-card"><span>Correo</span><strong>{profile.correo || "-"}</strong><small>Se cambia mediante verificacion por codigo.</small></article>
        <article className="profile-info-card"><span>Telefono</span><strong>{profile.telefono || "Sin telefono"}</strong><small>Usado para contacto y seguimiento.</small></article>
        <article className="profile-info-card"><span>Direccion</span><strong>{profile.direccion?.ubicacion || "Sin direccion registrada"}</strong><small>{[profile.direccion?.calle, profile.direccion?.numero].filter(Boolean).join(" ") || "Sin detalle adicional"}</small></article>
        <article className="profile-info-card"><span>Registro</span><strong>{formatDate(profile.fechaRegistro)}</strong><small>Fecha de creacion de tu cuenta.</small></article>
      </div>
      {!isEmailVerified && <div className="profile-callout profile-callout--warning"><div><strong>Tu correo aun no esta verificado</strong><span>Verificarlo habilita acciones sensibles dentro de tu cuenta.</span></div><Link className="header-action header-action--warning" to={verifyEmailPath}>Verificar correo</Link></div>}
    </section>
  );

  const renderActionsPanel = () => (
    <section className="profile-panel profile-panel--actions">
      <div className="profile-panel__header">
        <div>
          <p className="profile-panel__eyebrow">Acciones de cuenta</p>
          <h2>Actualiza tus datos desde ventanas emergentes</h2>
        </div>
        <span className="profile-panel__note">Abre solo el modulo que necesites en cada momento.</span>
      </div>
      <div className="profile-action-grid">
        <article className="profile-action-card">
          <span>Datos generales</span>
          <strong>Nombre, usuario, telefono y direccion</strong>
          <p>Abre el formulario completo para editar tu informacion principal sin recargar la vista.</p>
          <button className="home-btn home-btn--primary" onClick={() => openModal("general")} type="button">
            Actualizar datos
          </button>
        </article>
        <article className="profile-action-card">
          <span>Correo</span>
          <strong>Cambio con codigo de verificacion</strong>
          <p>Solicita un codigo al nuevo correo y confirma el cambio desde el mismo popup.</p>
          <button className="home-btn home-btn--primary" onClick={() => openModal("email")} type="button">
            Actualizar correo
          </button>
        </article>
        <article className="profile-action-card">
          <span>Contrasena</span>
          <strong>Protegida por correo verificado</strong>
          <p>Valida tu contrasena actual y confirma el cambio con un codigo enviado a tu correo.</p>
          <button className="home-btn home-btn--primary" onClick={() => openModal("password")} type="button">
            Actualizar contrasena
          </button>
        </article>
      </div>
    </section>
  );

  const renderGeneralPanel = () => (
    <section className="profile-modal-card">
      <div className="profile-panel__header">
        <div><p className="profile-panel__eyebrow">Actualiza tus datos</p><h2>Edita tu informacion general</h2></div>
        <span className="profile-panel__note">Correo y contrasena se actualizan por separado.</span>
      </div>
      <form className="profile-form" onSubmit={handleSubmit(handleGeneralSubmit)}>
        <div className="profile-form-grid">
          <label className="profile-input"><span>Identificacion</span><input {...register("identificacion")} className="form-control" disabled type="text" /></label>
          <label className="profile-input"><span>Correo</span><input {...register("correo")} className="form-control" disabled type="email" /></label>
          <label className="profile-input"><span>Usuario</span><input {...register("usuario", { required: "El usuario es obligatorio" })} className={`form-control ${errors.usuario ? "is-invalid" : ""}`} type="text" />{errors.usuario && <small className="text-danger">{errors.usuario.message}</small>}</label>
          <label className="profile-input"><span>Telefono</span><input {...register("telefono", { required: "El telefono es obligatorio", pattern: { value: PHONE_PATTERN, message: "Ingresa un telefono valido" } })} className={`form-control ${errors.telefono ? "is-invalid" : ""}`} type="text" />{errors.telefono && <small className="text-danger">{errors.telefono.message}</small>}</label>
          <label className="profile-input"><span>Nombre</span><input {...register("nombre", { required: "El nombre es obligatorio" })} className={`form-control ${errors.nombre ? "is-invalid" : ""}`} type="text" />{errors.nombre && <small className="text-danger">{errors.nombre.message}</small>}</label>
          <label className="profile-input"><span>Apellido paterno</span><input {...register("apellidoPaterno", { required: "El apellido paterno es obligatorio" })} className={`form-control ${errors.apellidoPaterno ? "is-invalid" : ""}`} type="text" />{errors.apellidoPaterno && <small className="text-danger">{errors.apellidoPaterno.message}</small>}</label>
          <label className="profile-input"><span>Apellido materno</span><input {...register("apellidoMaterno", { required: "El apellido materno es obligatorio" })} className={`form-control ${errors.apellidoMaterno ? "is-invalid" : ""}`} type="text" />{errors.apellidoMaterno && <small className="text-danger">{errors.apellidoMaterno.message}</small>}</label>
          <label className="profile-input"><span>Pais</span><select {...register("idPais", { required: "El pais es obligatorio", onChange: handleCountryChange })} className={`form-select ${errors.idPais ? "is-invalid" : ""}`} disabled={loadingCountries}><option value="">{loadingCountries ? "Cargando paises..." : "Selecciona un pais"}</option>{countries.map((country) => <option key={country.idPais} value={country.idPais}>{country.nombre}</option>)}</select>{errors.idPais && <small className="text-danger">{errors.idPais.message}</small>}</label>
          <label className="profile-input"><span>Provincia</span><select {...register("idProvincia", { required: "La provincia es obligatoria", onChange: handleProvinceChange })} className={`form-select ${errors.idProvincia ? "is-invalid" : ""}`} disabled={loadingProvinces || !provinces.length}><option value="">{loadingProvinces ? "Cargando provincias..." : "Selecciona una provincia"}</option>{provinces.map((province) => <option key={province.idProvincia} value={province.idProvincia}>{province.nombre}</option>)}</select>{errors.idProvincia && <small className="text-danger">{errors.idProvincia.message}</small>}</label>
          <label className="profile-input"><span>Canton</span><select {...register("idCanton", { required: "El canton es obligatorio", onChange: handleCantonChange })} className={`form-select ${errors.idCanton ? "is-invalid" : ""}`} disabled={loadingCantons || !cantons.length}><option value="">{loadingCantons ? "Cargando cantones..." : "Selecciona un canton"}</option>{cantons.map((canton) => <option key={canton.idCanton} value={canton.idCanton}>{canton.nombre}</option>)}</select>{errors.idCanton && <small className="text-danger">{errors.idCanton.message}</small>}</label>
          <label className="profile-input"><span>Distrito</span><select {...register("idDistrito", { required: "El distrito es obligatorio" })} className={`form-select ${errors.idDistrito ? "is-invalid" : ""}`} disabled={loadingDistricts || !districts.length}><option value="">{loadingDistricts ? "Cargando distritos..." : "Selecciona un distrito"}</option>{districts.map((district) => <option key={district.idDistrito} value={district.idDistrito}>{district.nombre}</option>)}</select>{errors.idDistrito && <small className="text-danger">{errors.idDistrito.message}</small>}</label>
          <label className="profile-input"><span>Calle o detalle</span><input {...register("calle")} className="form-control" type="text" /></label>
          <label className="profile-input"><span>Numero o referencia</span><input {...register("numero")} className="form-control" type="text" /></label>
        </div>
        <div className="profile-form__actions"><p>Puedes actualizar aqui solo tus datos generales. Los cambios sensibles requieren verificacion.</p><button className="home-btn home-btn--primary" disabled={savingProfile} type="submit">{savingProfile ? "Guardando cambios..." : "Guardar cambios"}</button></div>
      </form>
    </section>
  );

  const renderEmailPanel = () => (
    <section className="profile-modal-card">
      <div className="profile-panel__header"><div><p className="profile-panel__eyebrow">Seguridad</p><h2>Cambiar correo</h2></div><span className="profile-panel__note">Solicita un codigo y luego confirma el cambio.</span></div>
      <div className="profile-security-step"><strong>Verificacion del nuevo correo</strong><p className="profile-security-hint">El nuevo correo solo se activa cuando confirmas el codigo enviado a esa direccion.</p></div>
      <div className="profile-form-grid">
        <label className="profile-input"><span>Correo actual</span><input className="form-control" disabled type="email" value={profile.correo || ""} /></label>
        <label className="profile-input"><span>Nuevo correo</span><input className="form-control" name="nuevoCorreo" onChange={handleEmailChangeInput} placeholder="nuevo@correo.com" type="email" value={emailChange.nuevoCorreo} /></label>
        <label className="profile-input profile-input--full"><span>Codigo de verificacion</span><input className="form-control" inputMode="numeric" name="codigo" onChange={handleEmailChangeInput} placeholder="123456" type="text" value={emailChange.codigo} /></label>
      </div>
      <div className="profile-security-actions">
        <button className="home-btn home-btn--primary" disabled={requestingEmailChange || confirmingEmailChange} onClick={requestEmailCode} type="button">{requestingEmailChange ? "Enviando codigo..." : "Enviar codigo al nuevo correo"}</button>
        <button className="home-btn home-btn--primary" disabled={requestingEmailChange || confirmingEmailChange} onClick={confirmEmailCode} type="button">{confirmingEmailChange ? "Confirmando correo..." : "Confirmar cambio de correo"}</button>
      </div>
      <p className="profile-security-hint">Si solicitas otro codigo, el anterior dejara de ser valido.</p>
    </section>
  );

  const renderPasswordPanel = () => (
    <section className="profile-modal-card">
      <div className="profile-panel__header"><div><p className="profile-panel__eyebrow">Seguridad</p><h2>Cambiar contrasena</h2></div><span className="profile-panel__note">Requiere contrasena actual y un codigo por correo.</span></div>
      {!isEmailVerified && <div className="profile-callout profile-callout--warning"><div><strong>Necesitas verificar tu correo actual</strong><span>Solo las cuentas con correo verificado pueden cambiar la contrasena.</span></div><Link className="header-action header-action--warning" to={verifyEmailPath}>Verificar correo</Link></div>}
      <fieldset className="profile-security-fieldset" disabled={!isEmailVerified || requestingPasswordChange || confirmingPasswordChange}>
        <div className="profile-form-grid">
          <label className="profile-input"><span>Contrasena actual</span><input className="form-control" name="currentPassword" onChange={handlePasswordChangeInput} type="password" value={passwordChange.currentPassword} /></label>
          <label className="profile-input"><span>Nueva contrasena</span><input className="form-control" name="newPassword" onChange={handlePasswordChangeInput} type="password" value={passwordChange.newPassword} /></label>
          <label className="profile-input"><span>Confirmar nueva contrasena</span><input className="form-control" name="confirmNewPassword" onChange={handlePasswordChangeInput} type="password" value={passwordChange.confirmNewPassword} /></label>
          <label className="profile-input"><span>Codigo de verificacion</span><input className="form-control" inputMode="numeric" name="codigo" onChange={handlePasswordChangeInput} placeholder="123456" type="text" value={passwordChange.codigo} /></label>
        </div>
        <div className="profile-security-actions">
          <button className="home-btn home-btn--primary" onClick={requestPasswordCode} type="button">{requestingPasswordChange ? "Enviando codigo..." : "Enviar codigo al correo actual"}</button>
          <button className="home-btn home-btn--primary" onClick={confirmPasswordCode} type="button">{confirmingPasswordChange ? "Confirmando contrasena..." : "Confirmar cambio de contrasena"}</button>
        </div>
      </fieldset>
      <p className="profile-security-hint">Al confirmar la nueva contrasena cerraremos tu sesion actual por seguridad.</p>
    </section>
  );

  const renderPurchaseDetailPanel = () => {
    const selectedPurchase = selectedPurchaseInvoice?.purchase || null;
    const selectedInvoice = selectedPurchaseInvoice?.invoice || null;

    if (!selectedPurchase || !selectedInvoice) return null;

    return (
      <section className="profile-modal-card profile-modal-card--wide">
        <div className="profile-panel__header">
          <div>
            <p className="profile-panel__eyebrow">Detalle de factura</p>
            <h2>Detalle de factura</h2>
          </div>
          <span className="profile-panel__note">Productos asociados a esta compra.</span>
        </div>
        <div className="profile-detail-grid">
          <article>
            <span>Compra relacionada</span>
            <strong>Compra registrada</strong>
          </article>
          <article>
            <span>Total facturado</span>
            <strong>{formatMoney(selectedInvoice.totalFactura, selectedInvoice.simbolo)}</strong>
          </article>
          <article>
            <span>Total de compra</span>
            <strong>{formatMoney(selectedPurchase.totalVenta, selectedInvoice.simbolo)}</strong>
          </article>
          <article>
            <span>Fecha de factura</span>
            <strong>{formatDateTime(selectedInvoice.fechaFactura)}</strong>
          </article>
        </div>
        <div className="profile-subsection">
          <span className="profile-subsection__title">Productos de la venta</span>
          {selectedPurchase.items.length ? (
            <div className="profile-inline-grid">
              {selectedPurchase.items.map((item) => (
                <article key={`${selectedPurchase.idVenta}-${item.idProducto}`} className="profile-inline-card">
                  <strong>{item.producto || "Producto registrado"}</strong>
                  <span>{item.cantidad} x {formatMoney(item.precioUnitario, selectedInvoice.simbolo)}</span>
                  <small>Total: {formatMoney(item.total, selectedInvoice.simbolo)}</small>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty-state profile-empty-state--compact">No encontramos productos asociados a esta venta.</div>
          )}
        </div>
      </section>
    );
  };

  const renderActiveModal = () => {
    if (!activeModal) return null;

    const titleByModal = {
      general: "Actualizar datos generales",
      email: "Actualizar correo",
      password: "Actualizar contrasena",
      purchaseDetails: "Detalle de factura",
    };

    const modalContentByType = {
      general: renderGeneralPanel(),
      email: renderEmailPanel(),
      password: renderPasswordPanel(),
      purchaseDetails: renderPurchaseDetailPanel(),
    };

    return (
      <div aria-modal="true" className="profile-modal" onClick={closeModal} role="dialog">
        <div className="profile-modal__stage">
          <div className="profile-modal__frame">
            <span className="profile-modal__slash profile-modal__slash--one" />
            <span className="profile-modal__slash profile-modal__slash--two" />
            <div className="profile-modal__card-shell" onClick={(event) => event.stopPropagation()}>
              <button
                aria-label="Cerrar ventana"
                className="profile-modal__close"
                onClick={closeModal}
                type="button"
              >
                Cerrar
              </button>
              <div className="profile-modal__meta">
                <span>Modulo activo</span>
                <strong>{titleByModal[activeModal]}</strong>
              </div>
              {modalContentByType[activeModal]}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdoptions = () => (
    <section className="profile-panel">
      <div className="profile-panel__header">
        <div>
          <p className="profile-panel__eyebrow">Adopciones</p>
          <h2>Solicitudes enviadas</h2>
        </div>
        <span className="profile-panel__note">{adoptionRequests.length} registradas</span>
      </div>

      {!adoptionRequests.length ? (
        <div className="profile-empty-state">Aun no tienes solicitudes de adopcion registradas.</div>
      ) : (
        <div className="profile-stack">
          {adoptionRequests.map((request) => {
            const followUpState =
              request.idAdopcion && request.idPerrito
                ? {
                    dogId: request.idPerrito,
                    adoptionId: request.idAdopcion,
                    dogName: request.nombrePerrito || "",
                  }
                : null;

            return (
              <article key={request.idSolicitud} className="profile-collection-card">
                <div className="profile-collection-card__header">
                  <div>
                    <span className="profile-collection-card__eyebrow">Solicitud enviada</span>
                    <h3>{request.nombrePerrito || "Perrito pendiente de asociar"}</h3>
                  </div>
                  <div className="profile-chip-list">
                    <span className="profile-status-chip profile-status-chip--soft">
                      Solicitud: {request.estadoSolicitud || "Sin estado"}
                    </span>
                    <span className={`profile-status-chip${request.estadoProceso ? " profile-status-chip--success" : ""}`}>
                      {request.estadoProceso ? `Proceso: ${request.estadoProceso}` : "En revision"}
                    </span>
                  </div>
                </div>

                <div className="profile-detail-grid">
                  <article>
                    <span>Perrito</span>
                    <strong>
                      {request.nombrePerrito || "Sin perrito asociado"}
                    </strong>
                  </article>
                  <article>
                    <span>Tipo</span>
                    <strong>{request.tipoSolicitud || "Adopcion"}</strong>
                  </article>
                  <article>
                    <span>Adopcion</span>
                    <strong>{request.idAdopcion ? "Adopcion registrada" : "Pendiente"}</strong>
                  </article>
                  <article>
                    <span>Fecha de proceso</span>
                    <strong>{formatDate(request.fechaAdopcion)}</strong>
                  </article>
                </div>

                {followUpState ? (
                  <div className="profile-collection-card__actions">
                    <Link className="home-btn home-btn--primary profile-followup-link" state={followUpState} to="/seguimiento">
                      Ir a seguimiento
                    </Link>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderPurchases = () => (
    <section className="profile-panel">
      <div className="profile-panel__header"><div><p className="profile-panel__eyebrow">Compras</p><h2>Resumen de compras realizadas</h2></div><span className="profile-panel__note">{purchases.length} compras, {totalItemsPurchased} articulos</span></div>
      {!purchases.length ? <div className="profile-empty-state">No hay compras registradas para esta cuenta todavia.</div> : <div className="profile-stack">{purchases.map((purchase) => { const invoiceSymbol = purchase.facturas[0]?.simbolo || null; return <article key={purchase.idVenta} className="profile-collection-card"><div className="profile-collection-card__header"><div><span className="profile-collection-card__eyebrow">Compra registrada</span><h3>{formatMoney(purchase.totalVenta, invoiceSymbol)}</h3></div><span className="profile-panel__note">{formatDateTime(purchase.fechaVenta)}</span></div><div className="profile-detail-grid"><article><span>Total de compra</span><strong>{formatMoney(purchase.totalVenta, invoiceSymbol)}</strong></article><article><span>Facturas relacionadas</span><strong>{purchase.facturas.length || 0}</strong></article><article><span>Productos en la venta</span><strong>{purchase.items.length || 0}</strong></article><article><span>Fecha</span><strong>{formatDateTime(purchase.fechaVenta)}</strong></article></div>{purchase.facturas.length ? <div className="profile-subsection"><span className="profile-subsection__title">Facturas asociadas</span><div className="profile-inline-grid">{purchase.facturas.map((invoice) => <button key={`${purchase.idVenta}-${invoice.idFactura}`} className="profile-inline-card profile-inline-card--interactive" onClick={() => openPurchaseInvoiceModal(purchase, invoice)} type="button"><strong>{invoice.idFactura}</strong><span>{formatMoney(invoice.totalFactura, invoice.simbolo)}</span><small>{formatDateTime(invoice.fechaFactura)}</small></button>)}</div></div> : <div className="profile-empty-state profile-empty-state--compact">Esta venta no tiene facturas relacionadas todavia.</div>}</article>; })}</div>}
    </section>
  );

  const renderFosterHomes = () => (
    <section className="profile-panel">
      <div className="profile-panel__header"><div><p className="profile-panel__eyebrow">Casas cuna</p><h2>Casas cuna y perritos alojados</h2></div><span className="profile-panel__note">{fosterHomes.length} registradas</span></div>
      {!fosterHomes.length ? <div className="profile-empty-state">Esta cuenta no tiene casas cuna registradas actualmente.</div> : <div className="profile-stack">{fosterHomes.map((fosterHome) => <article key={fosterHome.idCasaCuna} className="profile-collection-card"><div className="profile-collection-card__header"><div><span className="profile-collection-card__eyebrow">Casa cuna asignada</span><h3>{fosterHome.nombre || "Casa cuna sin nombre"}</h3></div><span className="profile-panel__note">{fosterHome.perrosAlojados.length} perritos alojados</span></div><div className="profile-detail-grid"><article><span>Ubicacion</span><strong>{fosterHome.ubicacion || "Sin ubicacion"}</strong></article><article><span>Detalle</span><strong>{[fosterHome.calle, fosterHome.numero].filter(Boolean).join(" ") || "Sin detalle adicional"}</strong></article><article><span>Solicitud vinculada</span><strong>{fosterHome.tipoSolicitud || "Solicitud asociada"}</strong></article><article><span>Total reportado</span><strong>{fosterHome.totalPerritos}</strong></article></div><div className="profile-subsection"><span className="profile-subsection__title">Perritos alojados</span>{fosterHome.perrosAlojados.length ? <div className="profile-inline-grid">{fosterHome.perrosAlojados.map((dog) => <article key={`${fosterHome.idCasaCuna}-${dog.idPerrito}`} className="profile-inline-card"><strong>{dog.nombrePerrito || "Perrito alojado"}</strong><span>Alojado actualmente</span></article>)}</div> : <div className="profile-empty-state profile-empty-state--compact">No hay perritos alojados en esta casa cuna.</div>}</div></article>)}</div>}
    </section>
  );

  return renderShell(
    <>
      {renderHero()}
      {loading ? <div className="profile-empty">Cargando tu perfil...</div> : error ? <div className="profile-empty profile-empty--error">{error}</div> : !profile ? <div className="profile-empty">No encontramos informacion para esta cuenta.</div> : <div className="profile-layout">{renderIntroPanel()}{renderActionsPanel()}{renderAdoptions()}{renderPurchases()}{renderFosterHomes()}</div>}
      {renderActiveModal()}
    </>,
  );
};

export default ProfilePage;
