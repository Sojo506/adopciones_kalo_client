import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as userTypesApi from "../../api/userTypes";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  idEstado: "",
};

const RESERVED_USER_TYPE_IDS = new Set([1, 2]);
const RESERVED_USER_TYPE_NAMES = new Set(["administrador", "cliente"]);

const mapUserTypeToForm = (userType) => ({
  nombre: userType?.nombre ?? "",
  idEstado: String(userType?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  nombre: values.nombre.trim(),
  idEstado: Number(values.idEstado),
});

const isReservedUserType = (userType) =>
  RESERVED_USER_TYPE_IDS.has(Number(userType?.idTipoUsuario)) ||
  RESERVED_USER_TYPE_NAMES.has(String(userType?.nombre || "").trim().toLowerCase());

const UserTypeFormPage = () => {
  const { idTipoUsuario } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUserType, setCurrentUserType] = useState(null);

  const isEditing = Boolean(idTipoUsuario);
  const hasStates = states.length > 0;
  const protectedUserType = useMemo(
    () => (isEditing ? isReservedUserType(currentUserType) : false),
    [currentUserType, isEditing],
  );
  const formDisabled = catalogsLoading || detailLoading || saving || protectedUserType || !hasStates;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing
      ? "Editar tipo de usuario | Dashboard Kalö"
      : "Nuevo tipo de usuario | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        setCatalogsLoading(true);
        const statesData = await catalogsApi.getStates();
        const availableStates = Array.isArray(statesData) ? statesData : [];

        setStates(availableStates);

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
          title: "No pudimos cargar los estados",
          text: error?.response?.data?.message || "Intenta de nuevo en un momento.",
        });
      } finally {
        setCatalogsLoading(false);
      }
    };

    loadStates();
  }, [isEditing, reset]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadUserType = async () => {
      try {
        setDetailLoading(true);
        const detail = await userTypesApi.getUserTypeById(idTipoUsuario, { force: true });
        setCurrentUserType(detail);
        reset(mapUserTypeToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el tipo de usuario",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/tipos-usuario");
      } finally {
        setDetailLoading(false);
      }
    };

    loadUserType();
  }, [idTipoUsuario, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || protectedUserType || !hasStates) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await userTypesApi.updateUserType(idTipoUsuario, payload);
      } else {
        await userTypesApi.createUserType(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Tipo actualizado" : "Tipo creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El tipo de usuario fue creado correctamente.",
      });

      navigate("/dashboard/tipos-usuario");
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
          <h1>Tipos de usuario</h1>
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
            {isEditing ? "Editar tipo de usuario" : "Nuevo tipo de usuario"}
          </p>
          <h1>{isEditing ? "Actualizar tipo de usuario" : "Crear tipo de usuario"}</h1>
          <p className="dashboard-page__lede">
            Define el nombre del rol y el estado con el que debe quedar disponible en el sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/tipos-usuario">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasStates ? (
          <div className="dashboard-empty-state">
            No hay estados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            {protectedUserType ? (
              <div className="dashboard-alert">
                Este tipo de usuario es estructural para la autenticacion y el registro, por eso
                solo puede consultarse desde aqui.
              </div>
            ) : null}

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

            {!protectedUserType ? (
              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear tipo"}
                </button>
                <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/tipos-usuario">
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

export default UserTypeFormPage;
