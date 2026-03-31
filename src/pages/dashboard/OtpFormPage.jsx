import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as accountsApi from "../../api/accounts";
import * as catalogsApi from "../../api/catalogs";
import * as otpsApi from "../../api/otps";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idCuenta: "",
  idTipoOtp: "",
  codigoHash: "",
  fechaExpiracion: "",
  fechaUso: "",
  intentos: "0",
  fechaCreacion: "",
  idEstado: "",
};

const toDatetimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const getDefaultDateTimeLocal = (offsetMinutes = 0) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return toDatetimeLocalValue(date);
};

const mapOtpToForm = (otp) => ({
  idCuenta: String(otp?.idCuenta ?? ""),
  idTipoOtp: String(otp?.idTipoOtp ?? ""),
  codigoHash: otp?.codigoHash ?? "",
  fechaExpiracion: toDatetimeLocalValue(otp?.fechaExpiracion),
  fechaUso: toDatetimeLocalValue(otp?.fechaUso),
  intentos: String(otp?.intentos ?? 0),
  fechaCreacion: toDatetimeLocalValue(otp?.fechaCreacion),
  idEstado: String(otp?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  idCuenta: Number(values.idCuenta),
  idTipoOtp: Number(values.idTipoOtp),
  codigoHash: values.codigoHash.trim(),
  fechaExpiracion: values.fechaExpiracion,
  fechaUso: values.fechaUso || null,
  intentos: Number(values.intentos),
  fechaCreacion: values.fechaCreacion,
  idEstado: Number(values.idEstado),
});

const buildAccountLabel = (account) => {
  const segments = [
    account.usuarioNombre,
    account.usuario,
    account.identificacion,
    account.correo,
  ].filter(Boolean);
  return segments.join(" - ");
};

const OtpFormPage = () => {
  const { idCodigoOtp } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [otpTypes, setOtpTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentOtp, setCurrentOtp] = useState(null);

  const isEditing = Boolean(idCodigoOtp);
  const otpTypeOptions = useMemo(() => {
    if (!isEditing || !currentOtp?.idTipoOtp) {
      return otpTypes;
    }

    const alreadyIncluded = otpTypes.some((otpType) => Number(otpType.idTipoOtp) === Number(currentOtp.idTipoOtp));
    if (alreadyIncluded) {
      return otpTypes;
    }

    return [
      ...otpTypes,
      {
        idTipoOtp: currentOtp.idTipoOtp,
        nombre: currentOtp.tipoOtp || "Tipo OTP registrado",
      },
    ];
  }, [currentOtp, isEditing, otpTypes]);
  const hasRequiredData = states.length > 0 && otpTypeOptions.length > 0 && accounts.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar codigo OTP | Dashboard Kalö" : "Nuevo codigo OTP | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, otpTypesData, accountsData] = await Promise.all([
          catalogsApi.getStates(),
          catalogsApi.getOtpTypes(),
          accountsApi.getAccounts({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableOtpTypes = Array.isArray(otpTypesData) ? otpTypesData : [];
        const availableAccounts = Array.isArray(accountsData) ? accountsData : [];

        setStates(availableStates);
        setOtpTypes(availableOtpTypes);
        setAccounts(availableAccounts);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          reset({
            ...EMPTY_FORM,
            intentos: "0",
            fechaCreacion: getDefaultDateTimeLocal(),
            fechaExpiracion: getDefaultDateTimeLocal(15),
            idEstado: String(activeState?.idEstado ?? availableStates?.[0]?.idEstado ?? ""),
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

    const loadOtp = async () => {
      try {
        setDetailLoading(true);
        const detail = await otpsApi.getOtpById(idCodigoOtp, { force: true });
        setCurrentOtp(detail);
        reset(mapOtpToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el codigo OTP",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/codigos-otp");
      } finally {
        setDetailLoading(false);
      }
    };

    loadOtp();
  }, [idCodigoOtp, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await otpsApi.updateOtp(idCodigoOtp, payload);
      } else {
        await otpsApi.createOtp(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Codigo OTP actualizado" : "Codigo OTP creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El codigo OTP fue creado correctamente.",
      });

      navigate("/dashboard/codigos-otp");
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
          <h1>Codigos OTP</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar codigo OTP" : "Nuevo codigo OTP"}</p>
          <h1>{isEditing ? "Actualizar codigo OTP" : "Crear codigo OTP"}</h1>
          <p className="dashboard-page__lede">
            Configura cuenta, tipo OTP, hash, intentos y fechas tal como se almacenan en la tabla.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/codigos-otp">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El campo <strong>codigo hash</strong> guarda el hash persistido en la base de datos.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos una cuenta, un tipo OTP y un estado para gestionar este modulo.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Cuenta</span>
                  <select
                    className="form-select"
                    {...register("idCuenta", { required: "La cuenta es obligatoria" })}
                  >
                    <option value="">Selecciona una cuenta</option>
                    {accounts.map((account) => (
                      <option key={account.idCuenta} value={account.idCuenta}>
                        {buildAccountLabel(account)}
                      </option>
                    ))}
                  </select>
                  {errors.idCuenta ? <small>{errors.idCuenta.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Tipo OTP</span>
                  <select
                    className="form-select"
                    {...register("idTipoOtp", { required: "El tipo OTP es obligatorio" })}
                  >
                    <option value="">Selecciona un tipo OTP</option>
                    {otpTypeOptions.map((otpType) => (
                      <option key={otpType.idTipoOtp} value={otpType.idTipoOtp}>
                        {otpType.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.idTipoOtp ? <small>{errors.idTipoOtp.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Intentos</span>
                  <input
                    className="form-control"
                    min="0"
                    step="1"
                    type="number"
                    {...register("intentos", {
                      required: "Los intentos son obligatorios",
                      min: {
                        value: 0,
                        message: "Los intentos no pueden ser negativos",
                      },
                    })}
                  />
                  {errors.intentos ? <small>{errors.intentos.message}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Codigo hash</span>
                  <textarea
                    className="form-control"
                    rows="4"
                    {...register("codigoHash", {
                      required: "El codigo hash es obligatorio",
                      maxLength: {
                        value: 200,
                        message: "El codigo hash no puede superar 200 caracteres",
                      },
                    })}
                  />
                  {errors.codigoHash ? <small>{errors.codigoHash.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de creacion</span>
                  <input
                    className="form-control"
                    type="datetime-local"
                    {...register("fechaCreacion", { required: "La fecha de creacion es obligatoria" })}
                  />
                  {errors.fechaCreacion ? <small>{errors.fechaCreacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de expiracion</span>
                  <input
                    className="form-control"
                    type="datetime-local"
                    {...register("fechaExpiracion", { required: "La fecha de expiracion es obligatoria" })}
                  />
                  {errors.fechaExpiracion ? <small>{errors.fechaExpiracion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de uso</span>
                  <input className="form-control" type="datetime-local" {...register("fechaUso")} />
                  {errors.fechaUso ? <small>{errors.fechaUso.message}</small> : null}
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

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear codigo OTP"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/codigos-otp">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default OtpFormPage;
