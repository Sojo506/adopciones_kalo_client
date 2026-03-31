import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as currenciesApi from "../../api/currencies";
import * as invoicesApi from "../../api/invoices";
import * as statesApi from "../../api/states";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idMoneda: "",
  tasaImpuestoAplicada: "0.13",
  fechaFactura: "",
  idEstado: "1",
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

const formatMoney = (amount, symbol) => {
  const formattedAmount = amountFormatter.format(Number(amount || 0));

  return symbol ? `${symbol} ${formattedAmount}` : formattedAmount;
};

const mapInvoiceToForm = (invoice) => ({
  idMoneda: String(invoice?.idMoneda ?? ""),
  tasaImpuestoAplicada:
    invoice?.tasaImpuestoAplicada === null || invoice?.tasaImpuestoAplicada === undefined
      ? "0.13"
      : String(invoice.tasaImpuestoAplicada),
  fechaFactura: formatDateTimeLocal(invoice?.fechaFactura),
  idEstado: String(invoice?.idEstado ?? "1"),
});

const buildPayload = (values, isEditing) => ({
  idMoneda: Number(values.idMoneda),
  tasaImpuestoAplicada:
    values.tasaImpuestoAplicada === "" ? undefined : Number(values.tasaImpuestoAplicada),
  fechaFactura: new Date(values.fechaFactura).toISOString(),
  idEstado: isEditing ? Number(values.idEstado) : 1,
});

const InvoiceFormPage = () => {
  const { idFactura } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const isEditing = Boolean(idFactura);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const selectedCurrencyId = watch("idMoneda");
  const currentCurrency = useMemo(() => {
    return currencies.find((currency) => Number(currency.idMoneda) === Number(selectedCurrencyId));
  }, [currencies, selectedCurrencyId]);

  const currencyOptions = useMemo(() => {
    return currencies.filter(
      (currency) =>
        Number(currency.idEstado) === 1 ||
        Number(currency.idMoneda) === Number(currentInvoice?.idMoneda),
    );
  }, [currencies, currentInvoice?.idMoneda]);

  const hasRequiredData = states.length > 0 && currencyOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  useEffect(() => {
    document.title = isEditing ? "Editar factura | Dashboard Kalo" : "Nueva factura | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, currenciesData] = await Promise.all([
          statesApi.getStates({ force: true }),
          currenciesApi.getCurrencies({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableCurrencies = Array.isArray(currenciesData) ? currenciesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const firstActiveCurrency = availableCurrencies.find(
          (currency) => Number(currency.idEstado) === 1,
        );

        setStates(availableStates);
        setCurrencies(availableCurrencies);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idMoneda: String(firstActiveCurrency?.idMoneda ?? ""),
            fechaFactura: formatDateTimeLocal(new Date()),
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

    const loadInvoice = async () => {
      try {
        setDetailLoading(true);
        const detail = await invoicesApi.getInvoiceById(idFactura, { force: true });
        setCurrentInvoice(detail);
        reset(mapInvoiceToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la factura",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/facturas");
      } finally {
        setDetailLoading(false);
      }
    };

    loadInvoice();
  }, [idFactura, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(values, isEditing);

      if (isEditing) {
        await invoicesApi.updateInvoice(idFactura, payload);
      } else {
        await invoicesApi.createInvoice(payload);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Factura actualizada" : "Factura creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La factura fue creada correctamente.",
      });

      navigate("/dashboard/facturas");
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

  const amountSymbol = currentCurrency?.simbolo || currentInvoice?.simbolo || "";
  const derivedSubtotalLabel = isEditing
    ? formatMoney(currentInvoice?.subtotal, amountSymbol)
    : "Se calculara al vincular ventas o donaciones";
  const derivedTaxLabel = isEditing
    ? formatMoney(currentInvoice?.impuesto, amountSymbol)
    : "Se calculara automaticamente";
  const derivedTotalLabel = isEditing
    ? formatMoney(currentInvoice?.total, amountSymbol)
    : "Se calculara automaticamente";

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Facturas</h1>
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
          <p className="dashboard-page__eyebrow">{isEditing ? "Editar factura" : "Nueva factura"}</p>
          <h1>{isEditing ? "Actualizar factura" : "Crear factura"}</h1>
          <p className="dashboard-page__lede">
            Define la moneda, la tasa de impuesto y la fecha. El ID y los montos se generan o
            recalculan automaticamente desde la base de datos.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/facturas">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las facturas nuevas siempre inician activas porque el trigger de la base fija ese estado.
          Solo se muestran monedas activas al crear; al editar tambien se conserva la moneda actual
          aunque ya no este activa.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            No hay estados o monedas disponibles para completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Referencia interna</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value="Administrada por el sistema"
                  />
                </label>

                <label className="dashboard-input">
                  <span>Moneda</span>
                  <select
                    className="form-select"
                    {...register("idMoneda", { required: "La moneda es obligatoria" })}
                  >
                    <option value="">Selecciona una moneda</option>
                    {currencyOptions.map((currency) => (
                      <option key={currency.idMoneda} value={currency.idMoneda}>
                        {currency.nombre} ({currency.simbolo})
                      </option>
                    ))}
                  </select>
                  {errors.idMoneda ? <small>{errors.idMoneda.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Tasa de impuesto aplicada</span>
                  <input
                    className="form-control"
                    step="0.0001"
                    type="number"
                    {...register("tasaImpuestoAplicada", {
                      min: {
                        value: 0,
                        message: "La tasa no puede ser negativa",
                      },
                    })}
                  />
                  {errors.tasaImpuestoAplicada ? (
                    <small>{errors.tasaImpuestoAplicada.message}</small>
                  ) : (
                    <small>Si la dejas vacia, la base aplica 0.13 por defecto.</small>
                  )}
                </label>

                <label className="dashboard-input">
                  <span>Fecha y hora de la factura</span>
                  <input
                    className="form-control"
                    type="datetime-local"
                    {...register("fechaFactura", {
                      required: "La fecha de la factura es obligatoria",
                    })}
                  />
                  {errors.fechaFactura ? <small>{errors.fechaFactura.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Subtotal</span>
                  <input className="form-control" readOnly type="text" value={derivedSubtotalLabel} />
                  <small>Se recalcula segun las ventas o donaciones asociadas.</small>
                </label>

                <label className="dashboard-input">
                  <span>Impuesto</span>
                  <input className="form-control" readOnly type="text" value={derivedTaxLabel} />
                  <small>Se deriva de la tasa aplicada y el subtotal actual.</small>
                </label>

                <label className="dashboard-input">
                  <span>Total</span>
                  <input className="form-control" readOnly type="text" value={derivedTotalLabel} />
                  <small>Se recalcula automaticamente desde la base.</small>
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
                          {state.nombreEstado}
                        </option>
                      ))}
                    </select>
                    {errors.idEstado ? <small>{errors.idEstado.message}</small> : null}
                  </label>
                ) : (
                  <label className="dashboard-input">
                    <span>Estado inicial</span>
                    <input className="form-control" readOnly type="text" value="Activo" />
                    <small>La base de datos fija este valor al momento de crear.</small>
                  </label>
                )}
              </div>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear factura"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/facturas">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default InvoiceFormPage;
