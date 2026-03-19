import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as salesApi from "../../api/sales";
import * as usersApi from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  identificacion: "",
  fechaVenta: "",
  idEstado: "",
};

const pad = (value) => String(value).padStart(2, "0");

const formatDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const buildFullName = (user) =>
  [user?.nombre, user?.apellidoPaterno, user?.apellidoMaterno].filter(Boolean).join(" ");

const mapSaleToForm = (sale) => ({
  identificacion: String(sale?.identificacion ?? ""),
  fechaVenta: formatDateTimeLocal(sale?.fechaVenta),
  idEstado: String(sale?.idEstado ?? ""),
});

const buildPayload = (values) => ({
  identificacion: Number(values.identificacion),
  fechaVenta: new Date(values.fechaVenta).toISOString(),
  idEstado: Number(values.idEstado),
});

const SaleFormPage = () => {
  const { idVenta } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [users, setUsers] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);

  const isEditing = Boolean(idVenta);

  const userOptions = useMemo(() => {
    return users.filter(
      (candidate) =>
        Number(candidate.idEstado) === 1 ||
        Number(candidate.identificacion) === Number(currentSale?.identificacion),
    );
  }, [currentSale?.identificacion, users]);

  const hasRequiredData = states.length > 0 && userOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  useEffect(() => {
    document.title = isEditing ? "Editar venta | Dashboard Kalö" : "Nueva venta | Dashboard Kalö";
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
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const firstUser = availableUsers.find((user) => Number(user.idEstado) === 1);

        setStates(availableStates);
        setUsers(availableUsers);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            identificacion: String(firstUser?.identificacion ?? ""),
            fechaVenta: formatDateTimeLocal(new Date()),
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

    const loadSale = async () => {
      try {
        setDetailLoading(true);
        const detail = await salesApi.getSaleById(idVenta, { force: true });
        setCurrentSale(detail);
        reset(mapSaleToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la venta",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/ventas");
      } finally {
        setDetailLoading(false);
      }
    };

    loadSale();
  }, [idVenta, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);

      if (isEditing) {
        await salesApi.updateSale(idVenta, payload);
      } else {
        await salesApi.createSale(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Venta actualizada" : "Venta creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La venta fue creada correctamente.",
      });

      navigate("/dashboard/ventas");
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

  const derivedTotalLabel = useMemo(() => {
    const amount = Number(currentSale?.totalVenta || 0);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }, [currentSale?.totalVenta]);

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Ventas</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar venta" : "Nueva venta"}</p>
          <h1>{isEditing ? "Actualizar venta" : "Crear venta"}</h1>
          <p className="dashboard-page__lede">
            Registra la persona responsable de la compra, la fecha y el estado. El total se calcula
            automaticamente a partir del detalle de venta.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/ventas">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Solo se muestran usuarios activos al crear una venta nueva. Si la venta ya existe, su
          cliente actual se mantiene disponible aunque ese usuario se haya desactivado despues.
          El total de la venta ya no se edita manualmente.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            No hay usuarios o estados disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Cliente</span>
                  <select
                    className="form-select"
                    {...register("identificacion", { required: "El cliente es obligatorio" })}
                  >
                    <option value="">Selecciona un cliente</option>
                    {userOptions.map((candidate) => (
                      <option key={candidate.identificacion} value={candidate.identificacion}>
                        {candidate.identificacion} - {buildFullName(candidate) || "Usuario sin nombre"}
                      </option>
                    ))}
                  </select>
                  {errors.identificacion ? <small>{errors.identificacion.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Total de la venta</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={isEditing ? derivedTotalLabel : "Se calculara cuando agregues lineas"}
                  />
                  <small>Este monto se deriva del detalle de la venta.</small>
                </label>

                <label className="dashboard-input">
                  <span>Fecha y hora de la venta</span>
                  <input
                    className="form-control"
                    type="datetime-local"
                    {...register("fechaVenta", {
                      required: "La fecha de la venta es obligatoria",
                    })}
                  />
                  {errors.fechaVenta ? <small>{errors.fechaVenta.message}</small> : null}
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear venta"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/ventas">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default SaleFormPage;
