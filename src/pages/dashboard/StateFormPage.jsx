import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as statesApi from "../../api/states";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombreEstado: "",
};

const RESERVED_STATE_IDS = new Set([1, 2, 3]);
const RESERVED_STATE_NAMES = new Set(["activo", "inactivo", "pendiente"]);

const mapStateToForm = (state) => ({
  nombreEstado: state?.nombreEstado ?? "",
});

const buildPayload = (values) => ({
  nombreEstado: values.nombreEstado.trim(),
});

const isReservedState = (state) =>
  RESERVED_STATE_IDS.has(Number(state?.idEstado)) ||
  RESERVED_STATE_NAMES.has(String(state?.nombreEstado || "").trim().toLowerCase());

const StateFormPage = () => {
  const { idEstado } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentState, setCurrentState] = useState(null);

  const isEditing = Boolean(idEstado);
  const protectedState = useMemo(
    () => (isEditing ? isReservedState(currentState) : false),
    [currentState, isEditing],
  );
  const formDisabled = detailLoading || saving || protectedState;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar estado | Dashboard Kalö" : "Nuevo estado | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      reset(EMPTY_FORM);
      return;
    }

    const loadState = async () => {
      try {
        setDetailLoading(true);
        const detail = await statesApi.getStateById(idEstado, { force: true });
        setCurrentState(detail);
        reset(mapStateToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el estado",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/estados");
      } finally {
        setDetailLoading(false);
      }
    };

    loadState();
  }, [idEstado, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || protectedState) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await statesApi.updateState(idEstado, payload);
      } else {
        await statesApi.createState(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Estado actualizado" : "Estado creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El estado fue creado correctamente.",
      });

      navigate("/dashboard/estados");
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
          <h1>Estados</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar estado" : "Nuevo estado"}</p>
          <h1>{isEditing ? "Actualizar estado" : "Crear estado"}</h1>
          <p className="dashboard-page__lede">
            Define el nombre del estado reusable que estara disponible en el resto del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/estados">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            {protectedState ? (
              <div className="dashboard-alert">
                Este estado es estructural para flujos base del sistema y no puede renombrarse
                desde el dashboard.
              </div>
            ) : null}

            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Nombre del estado</span>
                  <input
                    className="form-control"
                    {...register("nombreEstado", {
                      required: "El nombre es obligatorio",
                      maxLength: {
                        value: 100,
                        message: "El nombre no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.nombreEstado ? <small>{errors.nombreEstado.message}</small> : null}
                </label>
              </div>
            </fieldset>

            {!protectedState ? (
              <div className="dashboard-form__actions">
                <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear estado"}
                </button>
                <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/estados">
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

export default StateFormPage;
