import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as adoptionsApi from "../../api/adoptions";
import * as catalogsApi from "../../api/catalogs";
import * as followUpsApi from "../../api/followUps";
import * as trackingTypesApi from "../../api/trackingTypes";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idAdopcion: "",
  idTipoSeguimiento: "",
  fechaInicio: "",
  fechaFin: "",
  comentarios: "",
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

const buildAdoptionLabel = (adoption) => {
  const segments = [`#${adoption.idAdopcion}`];

  if (adoption.adoptante) {
    segments.push(adoption.adoptante);
  } else if (adoption.identificacion) {
    segments.push(adoption.identificacion);
  }

  if (adoption.nombrePerrito) {
    segments.push(`Perrito: ${adoption.nombrePerrito}`);
  } else if (adoption.idPerrito) {
    segments.push(`Perrito #${adoption.idPerrito}`);
  }

  return segments.join(" - ");
};

const buildTrackingTypeLabel = (trackingType) => {
  return `#${trackingType.idTipoSeguimiento} - ${trackingType.nombre}`;
};

const mapFollowUpToForm = (followUp) => ({
  idAdopcion: String(followUp?.idAdopcion ?? ""),
  idTipoSeguimiento: String(followUp?.idTipoSeguimiento ?? ""),
  fechaInicio: toDateInputValue(followUp?.fechaInicio),
  fechaFin: toDateInputValue(followUp?.fechaFin),
  comentarios: followUp?.comentarios ?? "",
  idEstado: String(followUp?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  idAdopcion: Number(values.idAdopcion),
  idTipoSeguimiento: Number(values.idTipoSeguimiento),
  fechaInicio: values.fechaInicio,
  fechaFin: values.fechaFin,
  comentarios: values.comentarios.trim(),
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  idAdopcion: Number(values.idAdopcion),
  idTipoSeguimiento: Number(values.idTipoSeguimiento),
  fechaInicio: values.fechaInicio,
  fechaFin: values.fechaFin,
  comentarios: values.comentarios.trim(),
  idEstado: Number(values.idEstado),
});

const getSelectableAdoptions = ({ adoptions, currentFollowUp }) => {
  return (Array.isArray(adoptions) ? adoptions : [])
    .filter((adoption) => {
      const isCurrent = Number(adoption.idAdopcion) === Number(currentFollowUp?.idAdopcion);

      if (isCurrent) {
        return true;
      }

      return Number(adoption.idEstado) === 1;
    })
    .sort((left, right) => left.idAdopcion - right.idAdopcion);
};

const getSelectableTrackingTypes = ({ trackingTypes, currentFollowUp }) => {
  return (Array.isArray(trackingTypes) ? trackingTypes : [])
    .filter((trackingType) => {
      const isCurrent =
        Number(trackingType.idTipoSeguimiento) === Number(currentFollowUp?.idTipoSeguimiento);

      if (isCurrent) {
        return true;
      }

      return Number(trackingType.idEstado) === 1;
    })
    .sort((left, right) => left.idTipoSeguimiento - right.idTipoSeguimiento);
};

const FollowUpFormPage = () => {
  const { idSeguimiento } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [trackingTypes, setTrackingTypes] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState(null);

  const isEditing = Boolean(idSeguimiento);

  const adoptionOptions = useMemo(() => {
    return getSelectableAdoptions({
      adoptions,
      currentFollowUp,
    });
  }, [adoptions, currentFollowUp]);

  const trackingTypeOptions = useMemo(() => {
    return getSelectableTrackingTypes({
      trackingTypes,
      currentFollowUp,
    });
  }, [currentFollowUp, trackingTypes]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedAdoptionId = watch("idAdopcion");
  const watchedTrackingTypeId = watch("idTipoSeguimiento");
  const watchedStartDate = watch("fechaInicio");
  const watchedEndDate = watch("fechaFin");

  const selectedAdoption = useMemo(() => {
    return adoptionOptions.find((adoption) => Number(adoption.idAdopcion) === Number(watchedAdoptionId)) || null;
  }, [adoptionOptions, watchedAdoptionId]);

  const selectedTrackingType = useMemo(() => {
    return (
      trackingTypeOptions.find(
        (trackingType) =>
          Number(trackingType.idTipoSeguimiento) === Number(watchedTrackingTypeId),
      ) || null
    );
  }, [trackingTypeOptions, watchedTrackingTypeId]);

  const selectedAdoptionDate = useMemo(() => {
    return toDateInputValue(selectedAdoption?.fechaAdopcion);
  }, [selectedAdoption]);

  const hasRequiredData =
    states.length > 0 && adoptionOptions.length > 0 && trackingTypeOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  useEffect(() => {
    document.title = isEditing
      ? "Editar seguimiento | Dashboard Kalö"
      : "Nuevo seguimiento | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, adoptionsData, trackingTypesData] = await Promise.all([
          catalogsApi.getStates(),
          adoptionsApi.getAdoptions({ force: true }),
          trackingTypesApi.getTrackingTypes({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableAdoptions = Array.isArray(adoptionsData) ? adoptionsData : [];
        const availableTrackingTypes = Array.isArray(trackingTypesData) ? trackingTypesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const defaultAdoption = getSelectableAdoptions({
          adoptions: availableAdoptions,
          currentFollowUp: null,
        })[0];
        const defaultTrackingType = getSelectableTrackingTypes({
          trackingTypes: availableTrackingTypes,
          currentFollowUp: null,
        })[0];
        const defaultDate = toDateInputValue(defaultAdoption?.fechaAdopcion) || toDateInputValue(new Date());

        setStates(availableStates);
        setAdoptions(availableAdoptions);
        setTrackingTypes(availableTrackingTypes);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idAdopcion: String(defaultAdoption?.idAdopcion ?? ""),
            idTipoSeguimiento: String(defaultTrackingType?.idTipoSeguimiento ?? ""),
            fechaInicio: defaultDate,
            fechaFin: defaultDate,
            idEstado: String(activeState?.idEstado ?? 1),
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

    const loadFollowUp = async () => {
      try {
        setDetailLoading(true);
        const detail = await followUpsApi.getFollowUpById(idSeguimiento, { force: true });
        setCurrentFollowUp(detail);
        reset(mapFollowUpToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el seguimiento",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/seguimientos");
      } finally {
        setDetailLoading(false);
      }
    };

    loadFollowUp();
  }, [idSeguimiento, isEditing, navigate, reset]);

  useEffect(() => {
    if (catalogsLoading || detailLoading) {
      return;
    }

    if (!adoptionOptions.length) {
      setValue("idAdopcion", "", { shouldDirty: false });
    } else {
      const hasSelectedAdoption = adoptionOptions.some(
        (adoption) => Number(adoption.idAdopcion) === Number(watchedAdoptionId),
      );

      if (!hasSelectedAdoption) {
        setValue("idAdopcion", String(adoptionOptions[0].idAdopcion), {
          shouldDirty: false,
        });
      }
    }

    if (!trackingTypeOptions.length) {
      setValue("idTipoSeguimiento", "", { shouldDirty: false });
      return;
    }

    const hasSelectedTrackingType = trackingTypeOptions.some(
      (trackingType) =>
        Number(trackingType.idTipoSeguimiento) === Number(watchedTrackingTypeId),
    );

    if (!hasSelectedTrackingType) {
      setValue("idTipoSeguimiento", String(trackingTypeOptions[0].idTipoSeguimiento), {
        shouldDirty: false,
      });
    }
  }, [
    adoptionOptions,
    catalogsLoading,
    detailLoading,
    setValue,
    trackingTypeOptions,
    watchedAdoptionId,
    watchedTrackingTypeId,
  ]);

  useEffect(() => {
    if (!selectedAdoptionDate) {
      return;
    }

    if (!watchedStartDate || watchedStartDate < selectedAdoptionDate) {
      setValue("fechaInicio", selectedAdoptionDate, {
        shouldDirty: Boolean(watchedStartDate),
      });
    }

    if (!watchedEndDate || watchedEndDate < selectedAdoptionDate) {
      setValue("fechaFin", selectedAdoptionDate, {
        shouldDirty: Boolean(watchedEndDate),
      });
    }
  }, [selectedAdoptionDate, setValue, watchedEndDate, watchedStartDate]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = isEditing ? buildUpdatePayload(values) : buildCreatePayload(values);

      if (isEditing) {
        await followUpsApi.updateFollowUp(idSeguimiento, payload);
      } else {
        await followUpsApi.createFollowUp(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Seguimiento actualizado" : "Seguimiento creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El seguimiento fue creado correctamente.",
      });

      navigate("/dashboard/seguimientos");
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
          <h1>Seguimientos</h1>
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
            {isEditing ? "Editar seguimiento" : "Nuevo seguimiento"}
          </p>
          <h1>{isEditing ? "Actualizar seguimiento" : "Crear seguimiento"}</h1>
          <p className="dashboard-page__lede">
            Programa la ventana de seguimiento para una adopcion activa. Luego el usuario podra
            completar sus evidencias desde el perfil.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/seguimientos">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El seguimiento debe tomar una <Link to="/dashboard/adopciones">adopcion</Link> activa y
          un <Link to="/dashboard/tipos-seguimiento">tipo de seguimiento</Link> activo para poder
          quedar vigente.
        </div>

        <div className="dashboard-alert">
          Si este seguimiento ya tiene evidencias activas, el backend bloqueara cambios de
          adopcion, tipo o fechas, y tambien bloqueara desactivarlo.
        </div>

        {selectedAdoptionDate ? (
          <div className="dashboard-alert">
            La fecha de adopcion seleccionada es {selectedAdoptionDate}. Las fechas de inicio y fin
            no pueden ser anteriores a ese dia.
          </div>
        ) : null}

        {selectedAdoption && Number(selectedAdoption.idEstado) !== 1 ? (
          <div className="dashboard-alert">
            La adopcion actual esta inactiva. Solo podras mantener este seguimiento si tambien lo
            dejas inactivo o reasignas una adopcion activa.
          </div>
        ) : null}

        {selectedTrackingType && Number(selectedTrackingType.idEstado) !== 1 ? (
          <div className="dashboard-alert">
            El tipo de seguimiento actual esta inactivo. Para dejar el seguimiento activo debes
            seleccionar un tipo vigente.
          </div>
        ) : null}

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Necesitas estados, adopciones y tipos de seguimiento disponibles para completar este
            formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input dashboard-input--full">
                  <span>Adopcion</span>
                  <select
                    className="form-select"
                    {...register("idAdopcion", {
                      required: "La adopcion es obligatoria",
                    })}
                  >
                    <option value="">Selecciona una adopcion</option>
                    {adoptionOptions.map((adoption) => (
                      <option key={adoption.idAdopcion} value={adoption.idAdopcion}>
                        {buildAdoptionLabel(adoption)}
                      </option>
                    ))}
                  </select>
                  {errors.idAdopcion ? <small>{errors.idAdopcion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Tipo de seguimiento</span>
                  <select
                    className="form-select"
                    {...register("idTipoSeguimiento", {
                      required: "El tipo de seguimiento es obligatorio",
                    })}
                  >
                    <option value="">Selecciona un tipo</option>
                    {trackingTypeOptions.map((trackingType) => (
                      <option
                        key={trackingType.idTipoSeguimiento}
                        value={trackingType.idTipoSeguimiento}
                      >
                        {buildTrackingTypeLabel(trackingType)}
                        {Number(trackingType.idEstado) !== 1
                          ? ` - ${trackingType.estado || "Inactivo"}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {errors.idTipoSeguimiento ? (
                    <small>{errors.idTipoSeguimiento.message}</small>
                  ) : null}
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
                    <input className="form-control" readOnly type="text" value="Activo" />
                  </label>
                )}

                <label className="dashboard-input">
                  <span>Fecha inicio</span>
                  <input
                    className="form-control"
                    type="date"
                    {...register("fechaInicio", {
                      required: "La fecha de inicio es obligatoria",
                      validate: (value) => {
                        if (!value) {
                          return true;
                        }

                        if (selectedAdoptionDate && value < selectedAdoptionDate) {
                          return "La fecha de inicio no puede ser anterior a la adopcion";
                        }

                        return true;
                      },
                    })}
                  />
                  {errors.fechaInicio ? <small>{errors.fechaInicio.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha fin</span>
                  <input
                    className="form-control"
                    type="date"
                    {...register("fechaFin", {
                      required: "La fecha de fin es obligatoria",
                      validate: (value) => {
                        if (!value) {
                          return true;
                        }

                        if (selectedAdoptionDate && value < selectedAdoptionDate) {
                          return "La fecha de fin no puede ser anterior a la adopcion";
                        }

                        if (watchedStartDate && value < watchedStartDate) {
                          return "La fecha de fin no puede ser anterior a la fecha de inicio";
                        }

                        return true;
                      },
                    })}
                  />
                  {errors.fechaFin ? <small>{errors.fechaFin.message}</small> : null}
                </label>

                <label className="dashboard-input dashboard-input--full">
                  <span>Comentarios</span>
                  <textarea
                    className="form-control"
                    rows={4}
                    {...register("comentarios", {
                      maxLength: {
                        value: 500,
                        message: "Los comentarios no pueden superar 500 caracteres",
                      },
                    })}
                  />
                  {errors.comentarios ? <small>{errors.comentarios.message}</small> : null}
                </label>
              </div>

              {selectedAdoption ? (
                <div className="dashboard-alert">
                  Adoptante: {selectedAdoption.adoptante || selectedAdoption.identificacion || "-"}
                  . Perrito: {selectedAdoption.nombrePerrito || `#${selectedAdoption.idPerrito}`}.
                </div>
              ) : null}

              <div className="dashboard-form__actions">
                <button
                  className="dashboard-btn dashboard-btn--primary"
                  disabled={formDisabled}
                  type="submit"
                >
                  {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear seguimiento"}
                </button>
                <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/seguimientos">
                  Cancelar
                </Link>
              </div>
            </fieldset>
          </form>
        )}
      </section>
    </div>
  );
};

export default FollowUpFormPage;
