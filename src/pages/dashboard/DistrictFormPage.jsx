import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as cantonsApi from "../../api/cantons";
import * as districtsApi from "../../api/districts";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  idCanton: "",
  idEstado: "",
};

const mapDistrictToForm = (district) => ({
  nombre: district?.nombre ?? "",
  idCanton: String(district?.idCanton ?? ""),
  idEstado: String(district?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  nombre: values.nombre.trim(),
  idCanton: Number(values.idCanton),
  idEstado: Number(values.idEstado),
});

const DistrictFormPage = () => {
  const { idDistrito } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idDistrito);
  const hasRequiredData = states.length > 0 && cantons.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing
      ? "Editar distrito | Dashboard Kalo"
      : "Nuevo distrito | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, cantonsData] = await Promise.all([
          catalogsApi.getStates(),
          cantonsApi.getCantons({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableCantons = Array.isArray(cantonsData) ? cantonsData : [];

        setStates(availableStates);
        setCantons(availableCantons);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          const activeCanton = availableCantons.find((canton) => Number(canton.idEstado) === 1);
          reset({
            ...EMPTY_FORM,
            idCanton: String(activeCanton?.idCanton ?? availableCantons?.[0]?.idCanton ?? ""),
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

    const loadDistrict = async () => {
      try {
        setDetailLoading(true);
        const detail = await districtsApi.getDistrictById(idDistrito, { force: true });
        reset(mapDistrictToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el distrito",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/distritos");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDistrict();
  }, [idDistrito, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await districtsApi.updateDistrict(idDistrito, payload);
      } else {
        await districtsApi.createDistrict(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Distrito actualizado" : "Distrito creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El distrito fue creado correctamente.",
      });

      navigate("/dashboard/distritos");
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
          <h1>Distritos</h1>
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
            {isEditing ? "Editar distrito" : "Nuevo distrito"}
          </p>
          <h1>{isEditing ? "Actualizar distrito" : "Crear distrito"}</h1>
          <p className="dashboard-page__lede">
            Define el canton, el nombre y el estado con el que debe quedar disponible el distrito.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/distritos">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos un canton y un estado para gestionar este modulo.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Canton</span>
                  <select
                    className="form-select"
                    {...register("idCanton", { required: "El canton es obligatorio" })}
                  >
                    <option value="">Selecciona un canton</option>
                    {cantons.map((canton) => (
                      <option key={canton.idCanton} value={canton.idCanton}>
                        {canton.nombre} ({canton.provincia || "Provincia relacionada"},{" "}
                        {canton.estado || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.idCanton ? <small>{errors.idCanton.message}</small> : null}
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear distrito"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/distritos">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default DistrictFormPage;
