import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as emailsApi from "../../api/emails";
import * as usersApi from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  identificacion: "",
  correo: "",
  idEstado: "",
};

const mapEmailToForm = (email) => ({
  identificacion: String(email?.identificacion ?? ""),
  correo: email?.correo ?? "",
  idEstado: String(email?.idEstado ?? ""),
});

const buildCreatePayload = (values) => ({
  identificacion: Number(values.identificacion),
  correo: values.correo.trim(),
  idEstado: Number(values.idEstado),
});

const EmailFormPage = () => {
  const { identificacion, correo } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [users, setUsers] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(identificacion && correo);
  const hasRequiredData = states.length > 0 && users.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar correo | Dashboard Kalö" : "Nuevo correo | Dashboard Kalö";
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

    const loadEmail = async () => {
      try {
        setDetailLoading(true);
        const detail = await emailsApi.getEmailByPk(identificacion, correo, { force: true });
        reset(mapEmailToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el correo",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/correos");
      } finally {
        setDetailLoading(false);
      }
    };

    loadEmail();
  }, [correo, identificacion, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await emailsApi.updateEmail(identificacion, correo, {
          idEstado: Number(values.idEstado),
        });
      } else {
        await emailsApi.createEmail(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Correo actualizado" : "Correo creado",
        text: isEditing
          ? "El estado del correo fue actualizado correctamente."
          : "El correo fue creado correctamente.",
      });

      navigate("/dashboard/correos");
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
          <h1>Correos</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar correo" : "Nuevo correo"}</p>
          <h1>{isEditing ? "Actualizar correo" : "Crear correo"}</h1>
          <p className="dashboard-page__lede">
            {isEditing
              ? "La llave del registro se conserva y desde aqui solo actualizas el estado del correo."
              : "Asocia un correo a un usuario existente y define su estado inicial."}
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/correos">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {isEditing ? (
          <div className="dashboard-alert">
            Si necesitas reemplazar esta direccion, crea un nuevo correo y luego desactiva el actual.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos un usuario y un estado para gestionar correos.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Usuario</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
                    {...register("identificacion", { required: "El usuario es obligatorio" })}
                  >
                    <option value="">Selecciona un usuario</option>
                    {users.map((user) => {
                      const fullName = [
                        user.nombre,
                        user.apellidoPaterno,
                        user.apellidoMaterno,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <option key={user.identificacion} value={user.identificacion}>
                          {user.identificacion} - {fullName || "Usuario sin nombre"}
                        </option>
                      );
                    })}
                  </select>
                  {errors.identificacion ? <small>{errors.identificacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Correo</span>
                  <input
                    className="form-control"
                    disabled={isEditing || formDisabled}
                    type="email"
                    {...register("correo", { required: "El correo es obligatorio" })}
                  />
                  {errors.correo ? <small>{errors.correo.message}</small> : null}
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear correo"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/correos">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default EmailFormPage;
