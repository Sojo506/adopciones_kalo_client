import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as accountsApi from "../../api/accounts";
import * as catalogsApi from "../../api/catalogs";
import * as usersApi from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  identificacion: "",
  usuario: "",
  password: "",
  idEstado: "",
};

const mapAccountToForm = (account) => ({
  identificacion: String(account?.identificacion ?? ""),
  usuario: account?.usuario ?? "",
  password: "",
  idEstado: String(account?.idEstado ?? ""),
});

const buildPayload = (values, isEditing) => {
  const payload = {
    identificacion: Number(values.identificacion),
    usuario: values.usuario.trim(),
    idEstado: Number(values.idEstado),
  };

  if (!isEditing || values.password.trim()) {
    payload.password = values.password.trim();
  }

  return payload;
};

const AccountFormPage = () => {
  const { idCuenta } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [users, setUsers] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  const isEditing = Boolean(idCuenta);
  const userOptions = useMemo(() => {
    if (isEditing) {
      return users;
    }

    return users.filter((candidate) => !candidate?.cuenta?.idCuenta);
  }, [isEditing, users]);
  const hasRequiredData = states.length > 0 && userOptions.length > 0;
  const protectedAccount =
    isAdmin && isEditing && Number(currentAccount?.identificacion) === Number(user?.identificacion);
  const formDisabled = catalogsLoading || detailLoading || saving || protectedAccount || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar cuenta | Dashboard Kalö" : "Nueva cuenta | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, usersData] = await Promise.all([
          catalogsApi.getStates(),
          usersApi.getUsers({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableUsers = Array.isArray(usersData) ? usersData : [];

        setStates(availableStates);
        setUsers(availableUsers);

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

    const loadAccount = async () => {
      try {
        setDetailLoading(true);
        const detail = await accountsApi.getAccountById(idCuenta, { force: true });
        setCurrentAccount(detail);
        reset(mapAccountToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la cuenta",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/cuentas");
      } finally {
        setDetailLoading(false);
      }
    };

    loadAccount();
  }, [idCuenta, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || protectedAccount || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values, isEditing);

      if (isEditing) {
        await accountsApi.updateAccount(idCuenta, payload);
      } else {
        await accountsApi.createAccount(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Cuenta actualizada" : "Cuenta creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La cuenta fue creada correctamente.",
      });

      navigate("/dashboard/cuentas");
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
          <h1>Cuentas</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar cuenta" : "Nueva cuenta"}</p>
          <h1>{isEditing ? "Actualizar cuenta" : "Crear cuenta"}</h1>
          <p className="dashboard-page__lede">
            {isEditing
              ? "Modifica el nombre de usuario, el estado y la password de la cuenta."
              : "Asocia una nueva cuenta de acceso a un usuario existente."}
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/cuentas">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {protectedAccount ? (
          <div className="dashboard-alert">
            Esta es la cuenta del admin en sesion. Puedes revisarla, pero no modificarla desde aqui.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            {isEditing
              ? "No hay estados o usuarios disponibles para completar este formulario."
              : "Todos los usuarios ya tienen cuenta o faltan catalogos base para crear una nueva."}
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Usuario del sistema</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
                    {...register("identificacion", { required: "El usuario es obligatorio" })}
                  >
                    <option value="">Selecciona un usuario</option>
                    {userOptions.map((candidate) => {
                      const fullName = [
                        candidate.nombre,
                        candidate.apellidoPaterno,
                        candidate.apellidoMaterno,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <option key={candidate.identificacion} value={candidate.identificacion}>
                          {candidate.identificacion} - {fullName || "Usuario sin nombre"}
                        </option>
                      );
                    })}
                  </select>
                  {errors.identificacion ? <small>{errors.identificacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Nombre de usuario</span>
                  <input
                    className="form-control"
                    autoComplete="username"
                    {...register("usuario", {
                      required: "El nombre de usuario es obligatorio",
                      maxLength: {
                        value: 100,
                        message: "El nombre de usuario no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.usuario ? <small>{errors.usuario.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>{isEditing ? "Nueva password" : "Password"}</span>
                  <input
                    className="form-control"
                    placeholder={isEditing ? "Opcional para conservar la actual" : ""}
                    type="password"
                    autoComplete={isEditing ? "new-password" : "new-password"}
                    {...register("password", {
                      validate: (value) => {
                        const trimmedValue = value.trim();

                        if (isEditing && !trimmedValue) {
                          return true;
                        }

                        return trimmedValue.length >= 6
                          ? true
                          : "La password debe tener al menos 6 caracteres";
                      },
                    })}
                  />
                  {errors.password ? <small>{errors.password.message}</small> : null}
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

            {!protectedAccount ? (
              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear cuenta"}
                </button>
                <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/cuentas">
                  Cancelar
                </Link>
              </div>
            ) : null}
          </form>
        )}
      </section>
    </div>
  );
};

export default AccountFormPage;
