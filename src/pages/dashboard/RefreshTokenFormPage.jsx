import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as accountsApi from "../../api/accounts";
import * as catalogsApi from "../../api/catalogs";
import * as refreshTokensApi from "../../api/refreshTokens";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idCuenta: "",
  tokenHash: "",
  jti: "",
  ipAddress: "",
  userAgent: "",
  fechaExpiracion: "",
  fechaRevocacion: "",
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

const mapRefreshTokenToForm = (refreshToken) => ({
  idCuenta: String(refreshToken?.idCuenta ?? ""),
  tokenHash: refreshToken?.tokenHash ?? "",
  jti: refreshToken?.jti ?? "",
  ipAddress: refreshToken?.ipAddress ?? "",
  userAgent: refreshToken?.userAgent ?? "",
  fechaExpiracion: toDatetimeLocalValue(refreshToken?.fechaExpiracion),
  fechaRevocacion: toDatetimeLocalValue(refreshToken?.fechaRevocacion),
  idEstado: String(refreshToken?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  idCuenta: Number(values.idCuenta),
  tokenHash: values.tokenHash.trim(),
  jti: values.jti.trim() || null,
  ipAddress: values.ipAddress.trim() || null,
  userAgent: values.userAgent.trim() || null,
  fechaExpiracion: values.fechaExpiracion,
  fechaRevocacion: values.fechaRevocacion || null,
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

const RefreshTokenFormPage = () => {
  const { idRefreshToken } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idRefreshToken);
  const hasRequiredData = states.length > 0 && accounts.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing
      ? "Editar refresh token | Dashboard Kalö"
      : "Nuevo refresh token | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, accountsData] = await Promise.all([
          catalogsApi.getStates(),
          accountsApi.getAccounts({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableAccounts = Array.isArray(accountsData) ? accountsData : [];

        setStates(availableStates);
        setAccounts(availableAccounts);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          reset({
            ...EMPTY_FORM,
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

    const loadRefreshToken = async () => {
      try {
        setDetailLoading(true);
        const detail = await refreshTokensApi.getRefreshTokenById(idRefreshToken, { force: true });
        reset(mapRefreshTokenToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el refresh token",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/refresh-tokens");
      } finally {
        setDetailLoading(false);
      }
    };

    loadRefreshToken();
  }, [idRefreshToken, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await refreshTokensApi.updateRefreshToken(idRefreshToken, payload);
      } else {
        await refreshTokensApi.createRefreshToken(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Refresh token actualizado" : "Refresh token creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El refresh token fue creado correctamente.",
      });

      navigate("/dashboard/refresh-tokens");
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
          <h1>Refresh tokens</h1>
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
            {isEditing ? "Editar refresh token" : "Nuevo refresh token"}
          </p>
          <h1>{isEditing ? "Actualizar refresh token" : "Crear refresh token"}</h1>
          <p className="dashboard-page__lede">
            Configura la cuenta, el hash, metadatos del cliente, expiracion y revocacion del token.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/refresh-tokens">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El campo <strong>token hash</strong> guarda el hash persistido en la base de datos.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos una cuenta y un estado para gestionar este modulo.
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
                  <span>JTI</span>
                  <input
                    className="form-control"
                    {...register("jti", {
                      maxLength: {
                        value: 100,
                        message: "El JTI no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.jti ? <small>{errors.jti.message}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Token hash</span>
                  <textarea
                    className="form-control"
                    rows="4"
                    {...register("tokenHash", {
                      required: "El token hash es obligatorio",
                      maxLength: {
                        value: 500,
                        message: "El token hash no puede superar 500 caracteres",
                      },
                    })}
                  />
                  {errors.tokenHash ? <small>{errors.tokenHash.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>IP address</span>
                  <input
                    className="form-control"
                    {...register("ipAddress", {
                      maxLength: {
                        value: 100,
                        message: "La IP no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.ipAddress ? <small>{errors.ipAddress.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>User agent</span>
                  <input
                    className="form-control"
                    {...register("userAgent", {
                      maxLength: {
                        value: 300,
                        message: "El user agent no puede superar 300 caracteres",
                      },
                    })}
                  />
                  {errors.userAgent ? <small>{errors.userAgent.message}</small> : null}
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
                  <span>Fecha de revocacion</span>
                  <input className="form-control" type="datetime-local" {...register("fechaRevocacion")} />
                  {errors.fechaRevocacion ? <small>{errors.fechaRevocacion.message}</small> : null}
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear refresh token"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/refresh-tokens">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default RefreshTokenFormPage;
