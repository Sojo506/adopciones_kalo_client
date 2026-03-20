import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as campaignsApi from "../../api/campaigns";
import * as catalogsApi from "../../api/catalogs";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  idEstado: "1",
};

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

const mapCampaignToForm = (campaign) => ({
  nombre: campaign?.nombre ?? "",
  descripcion: campaign?.descripcion ?? "",
  fechaInicio: toDateInputValue(campaign?.fechaInicio),
  fechaFin: toDateInputValue(campaign?.fechaFin),
  idEstado: String(campaign?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  nombre: values.nombre.trim(),
  descripcion: values.descripcion.trim(),
  fechaInicio: values.fechaInicio,
  fechaFin: values.fechaFin,
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  nombre: values.nombre.trim(),
  descripcion: values.descripcion.trim(),
  fechaInicio: values.fechaInicio,
  fechaFin: values.fechaFin,
  idEstado: Number(values.idEstado),
});

const CampaignFormPage = () => {
  const { idCampania } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idCampania);

  const activeStateLabel = useMemo(() => {
    return states.find((state) => Number(state.idEstado) === 1)?.nombre || "Activo";
  }, [states]);

  const formDisabled = catalogsLoading || detailLoading || saving || (isEditing && states.length === 0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedStartDate = watch("fechaInicio");

  useEffect(() => {
    document.title = isEditing ? "Editar campania | Dashboard Kalö" : "Nueva campania | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        setCatalogsLoading(true);
        const statesData = await catalogsApi.getStates();
        const availableStates = Array.isArray(statesData) ? statesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);

        setStates(availableStates);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idEstado: String(activeState?.idEstado ?? 1),
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

    const loadCampaign = async () => {
      try {
        setDetailLoading(true);
        const detail = await campaignsApi.getCampaignById(idCampania, { force: true });
        reset(mapCampaignToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la campania",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/campanias");
      } finally {
        setDetailLoading(false);
      }
    };

    loadCampaign();
  }, [idCampania, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin) {
      return;
    }

    try {
      setSaving(true);
      const payload = isEditing ? buildUpdatePayload(values) : buildCreatePayload(values);

      if (isEditing) {
        await campaignsApi.updateCampaign(idCampania, payload);
      } else {
        await campaignsApi.createCampaign(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Campania actualizada" : "Campania creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La campania fue creada correctamente.",
      });

      navigate("/dashboard/campanias");
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
          <h1>Campanias</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar campania" : "Nueva campania"}</p>
          <h1>{isEditing ? "Actualizar campania" : "Crear campania"}</h1>
          <p className="dashboard-page__lede">
            Define el nombre, descripcion y rango de fechas con el que la campania quedara disponible.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/campanias">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : isEditing && states.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay estados disponibles para completar este formulario.
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

                {isEditing ? (
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
                ) : (
                  <label className="dashboard-input">
                    <span>Estado inicial</span>
                    <input className="form-control" disabled readOnly value={activeStateLabel} />
                    <small>Las campanias nuevas siempre se crean activas.</small>
                  </label>
                )}

                <label className="dashboard-input">
                  <span>Fecha de inicio</span>
                  <input
                    className="form-control"
                    type="date"
                    {...register("fechaInicio", {
                      required: "La fecha de inicio es obligatoria",
                    })}
                  />
                  {errors.fechaInicio ? <small>{errors.fechaInicio.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de fin</span>
                  <input
                    className="form-control"
                    min={watchedStartDate || undefined}
                    type="date"
                    {...register("fechaFin", {
                      required: "La fecha de fin es obligatoria",
                      validate: (value) => {
                        if (!watchedStartDate || !value) {
                          return true;
                        }

                        return value >= watchedStartDate || "La fecha de fin no puede ser anterior al inicio";
                      },
                    })}
                  />
                  {errors.fechaFin ? <small>{errors.fechaFin.message}</small> : null}
                </label>
              </div>

              <label className="dashboard-input">
                <span>Descripcion</span>
                <textarea
                  className="form-control"
                  rows={5}
                  {...register("descripcion", {
                    maxLength: {
                      value: 500,
                      message: "La descripcion no puede superar 500 caracteres",
                    },
                  })}
                />
                {errors.descripcion ? <small>{errors.descripcion.message}</small> : null}
              </label>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear campania"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/campanias">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default CampaignFormPage;

