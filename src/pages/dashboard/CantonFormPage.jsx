import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as provincesApi from "../../api/provinces";
import * as cantonsApi from "../../api/cantons";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  idProvincia: "",
  idEstado: "",
};

const mapCantonToForm = (canton) => ({
  nombre: canton?.nombre ?? "",
  idProvincia: String(canton?.idProvincia ?? ""),
  idEstado: String(canton?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  nombre: values.nombre.trim(),
  idProvincia: Number(values.idProvincia),
  idEstado: Number(values.idEstado),
});

const CantonFormPage = () => {
  const { idCanton } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idCanton);
  const hasRequiredData = states.length > 0 && provinces.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing
      ? "Editar canton | Dashboard Kalö"
      : "Nuevo canton | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, provincesData] = await Promise.all([
          catalogsApi.getStates(),
          provincesApi.getProvinces({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableProvinces = Array.isArray(provincesData) ? provincesData : [];

        setStates(availableStates);
        setProvinces(availableProvinces);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          const activeProvince = availableProvinces.find(
            (province) => Number(province.idEstado) === 1,
          );
          reset({
            ...EMPTY_FORM,
            idProvincia: String(activeProvince?.idProvincia ?? availableProvinces?.[0]?.idProvincia ?? ""),
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

    const loadCanton = async () => {
      try {
        setDetailLoading(true);
        const detail = await cantonsApi.getCantonById(idCanton, { force: true });
        reset(mapCantonToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el canton",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/cantones");
      } finally {
        setDetailLoading(false);
      }
    };

    loadCanton();
  }, [idCanton, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await cantonsApi.updateCanton(idCanton, payload);
      } else {
        await cantonsApi.createCanton(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Canton actualizado" : "Canton creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El canton fue creado correctamente.",
      });

      navigate("/dashboard/cantones");
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
          <h1>Cantones</h1>
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
            {isEditing ? "Editar canton" : "Nuevo canton"}
          </p>
          <h1>{isEditing ? "Actualizar canton" : "Crear canton"}</h1>
          <p className="dashboard-page__lede">
            Define la provincia, el nombre y el estado con el que debe quedar disponible el canton.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/cantones">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos una provincia y un estado para gestionar este modulo.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Provincia</span>
                  <select
                    className="form-select"
                    {...register("idProvincia", { required: "La provincia es obligatoria" })}
                  >
                    <option value="">Selecciona una provincia</option>
                    {provinces.map((province) => (
                      <option key={province.idProvincia} value={province.idProvincia}>
                        {province.nombre} ({province.pais || "Pais relacionado"}, {province.estado || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.idProvincia ? <small>{errors.idProvincia.message}</small> : null}
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
              </div>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear canton"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/cantones">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default CantonFormPage;
