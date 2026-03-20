import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as campaignsApi from "../../api/campaigns";
import * as catalogsApi from "../../api/catalogs";
import { useAuth } from "../../hooks/useAuth";

const previewStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "28px",
  objectFit: "cover",
  display: "block",
};

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

const CampaignFormPage = () => {
  const { idCampania } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState("");

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
  const watchedName = watch("nombre");

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }

    return currentCampaign?.imageUrl || null;
  }, [currentCampaign?.imageUrl, selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  useEffect(() => {
    document.title = isEditing ? "Editar campaña | Dashboard Kalö" : "Nueva campaña | Dashboard Kalö";
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
        setCurrentCampaign(detail);
        reset(mapCampaignToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la campaña",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/campanias");
      } finally {
        setDetailLoading(false);
      }
    };

    loadCampaign();
  }, [idCampania, isEditing, navigate, reset]);

  const onFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setFileError("");
  };

  const onSubmit = async (values) => {
    if (!isAdmin) {
      return;
    }

    if (!isEditing && !selectedFile) {
      setFileError("La imagen es obligatoria.");
      return;
    }

    if (isEditing && !selectedFile && !currentCampaign?.imageUrl) {
      setFileError("La imagen es obligatoria.");
      return;
    }

    try {
      setSaving(true);
      setFileError("");

      const formData = new FormData();
      formData.append("nombre", values.nombre.trim());
      formData.append("descripcion", values.descripcion.trim());
      formData.append("fechaInicio", values.fechaInicio);
      formData.append("fechaFin", values.fechaFin);
      formData.append("idEstado", isEditing ? String(Number(values.idEstado)) : "1");

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (isEditing) {
        await campaignsApi.updateCampaign(idCampania, formData);
      } else {
        await campaignsApi.createCampaign(formData);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Campaña actualizada" : "Campaña creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La campaña fue creada correctamente.",
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
          <h1>Campañas</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar campaña" : "Nueva campaña"}</p>
          <h1>{isEditing ? "Actualizar campaña" : "Crear campaña"}</h1>
          <p className="dashboard-page__lede">
            Define el nombre, la imagen, la descripcion y el rango de fechas con el que la campaña
            quedara disponible.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/campanias">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          {isEditing
            ? "Si subes una imagen nueva, la enviaremos a Cloudinary y reemplazaremos la URL actual de la campaña."
            : "La imagen se subira a Cloudinary y luego guardaremos la URL resultante en la BD."}
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : isEditing && states.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay estados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              {previewUrl ? (
                <div className="dashboard-alert">
                  <strong>Vista previa:</strong>
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      alt={watchedName ? `Campaña ${watchedName}` : "Vista previa de campaña"}
                      loading="lazy"
                      src={previewUrl}
                      style={previewStyle}
                    />
                  </div>
                </div>
              ) : null}

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
                    <small>Las campañas nuevas siempre se crean activas.</small>
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
                <span>{isEditing ? "Nueva imagen (opcional)" : "Imagen"}</span>
                <input
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  className="form-control"
                  onChange={onFileChange}
                  type="file"
                />
                <small>
                  {isEditing
                    ? "Si no subes una nueva imagen, mantendremos la actual."
                    : "Selecciona la imagen principal de la campaña para subirla a Cloudinary."}
                </small>
                {fileError ? <small>{fileError}</small> : null}
              </label>

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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear campaña"}
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
