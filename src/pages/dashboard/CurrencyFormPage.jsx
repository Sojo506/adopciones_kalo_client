import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as currenciesApi from "../../api/currencies";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  nombre: "",
  simbolo: "",
  idEstado: "",
};

const mapCurrencyToForm = (currency) => ({
  nombre: currency?.nombre ?? "",
  simbolo: currency?.simbolo ?? "",
  idEstado: String(currency?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  nombre: values.nombre.trim(),
  simbolo: values.simbolo.trim(),
  idEstado: Number(values.idEstado),
});

const CurrencyFormPage = () => {
  const { idMoneda } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idMoneda);
  const hasStates = states.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasStates;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar moneda | Dashboard Kalö" : "Nueva moneda | Dashboard Kalö";
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

    const loadCurrency = async () => {
      try {
        setDetailLoading(true);
        const detail = await currenciesApi.getCurrencyById(idMoneda, { force: true });
        reset(mapCurrencyToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la moneda",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/monedas");
      } finally {
        setDetailLoading(false);
      }
    };

    loadCurrency();
  }, [idMoneda, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasStates) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await currenciesApi.updateCurrency(idMoneda, payload);
      } else {
        await currenciesApi.createCurrency(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Moneda actualizada" : "Moneda creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La moneda fue creada correctamente.",
      });

      navigate("/dashboard/monedas");
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
          <h1>Monedas</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar moneda" : "Nueva moneda"}</p>
          <h1>{isEditing ? "Actualizar moneda" : "Crear moneda"}</h1>
          <p className="dashboard-page__lede">
            Define el nombre, simbolo y estado con el que la moneda debe quedar disponible.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/monedas">
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
                  <span>Simbolo</span>
                  <input
                    className="form-control"
                    {...register("simbolo", {
                      required: "El simbolo es obligatorio",
                      maxLength: {
                        value: 10,
                        message: "El simbolo no puede superar 10 caracteres",
                      },
                    })}
                  />
                  {errors.simbolo ? <small>{errors.simbolo.message}</small> : null}
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear moneda"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/monedas">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default CurrencyFormPage;
