import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as countriesApi from "../../api/countries";
import * as provincesApi from "../../api/provinces";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  idPais: "",
  idEstado: "",
};

const mapProvinceToForm = (province) => ({
  nombre: province?.nombre ?? "",
  idPais: String(province?.idPais ?? ""),
  idEstado: String(province?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  nombre: values.nombre.trim(),
  idPais: Number(values.idPais),
  idEstado: Number(values.idEstado),
});

const ProvinceFormPage = () => {
  const { idProvincia } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idProvincia);
  const hasRequiredData = states.length > 0 && countries.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing
      ? "Editar provincia | Dashboard Kalö"
      : "Nueva provincia | Dashboard Kalö";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, countriesData] = await Promise.all([
          catalogsApi.getStates(),
          countriesApi.getCountries({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableCountries = Array.isArray(countriesData) ? countriesData : [];

        setStates(availableStates);
        setCountries(availableCountries);

        if (!isEditing) {
          const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
          const activeCountry = availableCountries.find((country) => Number(country.idEstado) === 1);
          reset({
            ...EMPTY_FORM,
            idPais: String(activeCountry?.idPais ?? availableCountries?.[0]?.idPais ?? ""),
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

    const loadProvince = async () => {
      try {
        setDetailLoading(true);
        const detail = await provincesApi.getProvinceById(idProvincia, { force: true });
        reset(mapProvinceToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la provincia",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/provincias");
      } finally {
        setDetailLoading(false);
      }
    };

    loadProvince();
  }, [idProvincia, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await provincesApi.updateProvince(idProvincia, payload);
      } else {
        await provincesApi.createProvince(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Provincia actualizada" : "Provincia creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La provincia fue creada correctamente.",
      });

      navigate("/dashboard/provincias");
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
          <h1>Provincias</h1>
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
            {isEditing ? "Editar provincia" : "Nueva provincia"}
          </p>
          <h1>{isEditing ? "Actualizar provincia" : "Crear provincia"}</h1>
          <p className="dashboard-page__lede">
            Define el pais, el nombre y el estado con el que debe quedar disponible la provincia.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/provincias">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos un pais y un estado para gestionar este modulo.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Pais</span>
                  <select
                    className="form-select"
                    {...register("idPais", { required: "El pais es obligatorio" })}
                  >
                    <option value="">Selecciona un pais</option>
                    {countries.map((country) => (
                      <option key={country.idPais} value={country.idPais}>
                        {country.nombre} ({country.estado || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.idPais ? <small>{errors.idPais.message}</small> : null}
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear provincia"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/provincias">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProvinceFormPage;
