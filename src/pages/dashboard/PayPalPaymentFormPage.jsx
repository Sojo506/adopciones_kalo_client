import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as invoicesApi from "../../api/invoices";
import * as paypalPaymentsApi from "../../api/paypalPayments";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idFactura: "",
  paypalOrderId: "",
  paypalCaptureId: "",
  fechaPago: "",
  idEstado: "1",
};

const toDatetimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (amount, symbol) => {
  const formattedAmount = amountFormatter.format(Number(amount || 0));

  return symbol ? `${symbol} ${formattedAmount}` : formattedAmount;
};

const buildInvoiceLabel = (invoice) => {
  return `${invoice.idFactura} - ${invoice.moneda || "Sin moneda"} - ${formatMoney(invoice.total, invoice.simbolo)}`;
};

const mapPayPalPaymentToForm = (paypalPayment) => ({
  idFactura: String(paypalPayment?.idFactura ?? ""),
  paypalOrderId: paypalPayment?.paypalOrderId ?? "",
  paypalCaptureId: paypalPayment?.paypalCaptureId ?? "",
  fechaPago: toDatetimeLocalValue(paypalPayment?.fechaPago),
  idEstado: String(paypalPayment?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  idFactura: values.idFactura.trim(),
  paypalOrderId: values.paypalOrderId.trim() || null,
  paypalCaptureId: values.paypalCaptureId.trim() || null,
  fechaPago: values.fechaPago,
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  idFactura: values.idFactura.trim(),
  paypalOrderId: values.paypalOrderId.trim() || null,
  paypalCaptureId: values.paypalCaptureId.trim() || null,
  fechaPago: values.fechaPago,
  idEstado: Number(values.idEstado),
});

const PayPalPaymentFormPage = () => {
  const { idPago } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPayPalPayment, setCurrentPayPalPayment] = useState(null);

  const isEditing = Boolean(idPago);

  const invoiceOptions = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        Number(invoice.idEstado) === 1 ||
        String(invoice.idFactura) === String(currentPayPalPayment?.idFactura),
    );
  }, [currentPayPalPayment?.idFactura, invoices]);

  const hasRequiredData = states.length > 0 && invoiceOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedInvoiceId = watch("idFactura");
  const selectedInvoice = useMemo(() => {
    return invoiceOptions.find((invoice) => String(invoice.idFactura) === String(watchedInvoiceId)) || null;
  }, [invoiceOptions, watchedInvoiceId]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar pago PayPal | Dashboard Kalo"
      : "Nuevo pago PayPal | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, invoicesData] = await Promise.all([
          catalogsApi.getStates(),
          invoicesApi.getInvoices({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableInvoices = Array.isArray(invoicesData) ? invoicesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeInvoice = availableInvoices.find((invoice) => Number(invoice.idEstado) === 1);

        setStates(availableStates);
        setInvoices(availableInvoices);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idFactura: String(activeInvoice?.idFactura ?? ""),
            fechaPago: toDatetimeLocalValue(new Date()),
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

    const loadPayPalPayment = async () => {
      try {
        setDetailLoading(true);
        const detail = await paypalPaymentsApi.getPayPalPaymentById(idPago, { force: true });
        setCurrentPayPalPayment(detail);
        reset(mapPayPalPaymentToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar el pago PayPal",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/pagos-paypal");
      } finally {
        setDetailLoading(false);
      }
    };

    loadPayPalPayment();
  }, [idPago, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await paypalPaymentsApi.updatePayPalPayment(idPago, buildUpdatePayload(values));
      } else {
        await paypalPaymentsApi.createPayPalPayment(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Pago PayPal actualizado" : "Pago PayPal creado",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "El pago PayPal fue creado correctamente.",
      });

      navigate("/dashboard/pagos-paypal");
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
          <h1>Pagos PayPal</h1>
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
            {isEditing ? "Editar pago PayPal" : "Nuevo pago PayPal"}
          </p>
          <h1>{isEditing ? "Actualizar pago PayPal" : "Crear pago PayPal"}</h1>
          <p className="dashboard-page__lede">
            Registra la factura asociada, las referencias de PayPal y la fecha efectiva del pago.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/pagos-paypal">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Los pagos nuevos siempre inician activos porque el trigger de la base fija ese estado.
          Solo se muestran facturas activas al crear, y se conserva la factura actual al editar.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos una factura activa y estados disponibles para gestionar este modulo.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Factura</span>
                  <select
                    className="form-select"
                    {...register("idFactura", { required: "La factura es obligatoria" })}
                  >
                    <option value="">Selecciona una factura</option>
                    {invoiceOptions.map((invoice) => (
                      <option key={invoice.idFactura} value={invoice.idFactura}>
                        {buildInvoiceLabel(invoice)}
                      </option>
                    ))}
                  </select>
                  {errors.idFactura ? <small>{errors.idFactura.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Total actual de la factura</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatMoney(selectedInvoice?.total, selectedInvoice?.simbolo)}
                  />
                </label>

                <label className="dashboard-input">
                  <span>PayPal order ID</span>
                  <input
                    className="form-control"
                    {...register("paypalOrderId", {
                      maxLength: {
                        value: 100,
                        message: "El PayPal order ID no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.paypalOrderId ? <small>{errors.paypalOrderId.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>PayPal capture ID</span>
                  <input
                    className="form-control"
                    {...register("paypalCaptureId", {
                      maxLength: {
                        value: 100,
                        message: "El PayPal capture ID no puede superar 100 caracteres",
                      },
                    })}
                  />
                  {errors.paypalCaptureId ? <small>{errors.paypalCaptureId.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Fecha de pago</span>
                  <input
                    className="form-control"
                    type="datetime-local"
                    {...register("fechaPago", {
                      required: "La fecha de pago es obligatoria",
                    })}
                  />
                  {errors.fechaPago ? <small>{errors.fechaPago.message}</small> : null}
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
                    <small>La base de datos fija este valor al momento de crear.</small>
                  </label>
                )}
              </div>
            </fieldset>

            <div className="dashboard-form__actions">
              <button className="dashboard-btn dashboard-btn--primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear pago"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/pagos-paypal">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default PayPalPaymentFormPage;
