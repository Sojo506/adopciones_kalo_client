import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as catalogsApi from "../../api/catalogs";
import * as invoicesApi from "../../api/invoices";
import * as saleInvoicesApi from "../../api/saleInvoices";
import * as salesApi from "../../api/sales";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  idVenta: "",
  idFactura: "",
  idEstado: "1",
};

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (amount, symbol) => {
  const formattedAmount = amountFormatter.format(Number(amount || 0));

  return symbol ? `${symbol} ${formattedAmount}` : formattedAmount;
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const buildSaleLabel = (sale) => {
  const clientLabel = sale?.cliente || sale?.identificacion || "Venta sin cliente";
  return clientLabel;
};

const buildInvoiceLabel = (invoice) => {
  const amountLabel = formatMoney(invoice?.total, invoice?.simbolo);
  return `${invoice.idFactura} - ${invoice?.moneda || "Moneda registrada"} - ${amountLabel}`;
};

const mapSaleInvoiceToForm = (saleInvoice) => ({
  idVenta: String(saleInvoice?.idVenta ?? ""),
  idFactura: String(saleInvoice?.idFactura ?? ""),
  idEstado: String(saleInvoice?.idEstado ?? "1"),
});

const buildCreatePayload = (values) => ({
  idVenta: Number(values.idVenta),
  idFactura: String(values.idFactura),
  idEstado: 1,
});

const buildUpdatePayload = (values) => ({
  idEstado: Number(values.idEstado),
});

const SaleInvoiceFormPage = () => {
  const { idVenta, idFactura } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentSaleInvoice, setCurrentSaleInvoice] = useState(null);

  const isEditing = Boolean(idVenta && idFactura);

  const saleOptions = useMemo(() => {
    return sales.filter(
      (sale) =>
        Number(sale.idEstado) === 1 || Number(sale.idVenta) === Number(currentSaleInvoice?.idVenta),
    );
  }, [currentSaleInvoice?.idVenta, sales]);

  const invoiceOptions = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        Number(invoice.idEstado) === 1 || String(invoice.idFactura) === String(currentSaleInvoice?.idFactura),
    );
  }, [currentSaleInvoice?.idFactura, invoices]);

  const hasRequiredData = states.length > 0 && saleOptions.length > 0 && invoiceOptions.length > 0;
  const formDisabled = catalogsLoading || detailLoading || saving || !hasRequiredData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedSaleId = watch("idVenta");
  const watchedInvoiceId = watch("idFactura");

  const selectedSale = useMemo(() => {
    return saleOptions.find((sale) => Number(sale.idVenta) === Number(watchedSaleId)) || null;
  }, [saleOptions, watchedSaleId]);

  const selectedInvoice = useMemo(() => {
    return invoiceOptions.find((invoice) => String(invoice.idFactura) === String(watchedInvoiceId)) || null;
  }, [invoiceOptions, watchedInvoiceId]);

  useEffect(() => {
    document.title = isEditing
      ? "Editar venta-factura | Dashboard Kalo"
      : "Nueva venta-factura | Dashboard Kalo";
  }, [isEditing]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setCatalogsLoading(true);
        const [statesData, salesData, invoicesData] = await Promise.all([
          catalogsApi.getStates(),
          salesApi.getSales({ force: true }),
          invoicesApi.getInvoices({ force: true }),
        ]);

        const availableStates = Array.isArray(statesData) ? statesData : [];
        const availableSales = Array.isArray(salesData) ? salesData : [];
        const availableInvoices = Array.isArray(invoicesData) ? invoicesData : [];
        const activeState = availableStates.find((state) => Number(state.idEstado) === 1);
        const activeSale = availableSales.find((sale) => Number(sale.idEstado) === 1);
        const activeInvoice = availableInvoices.find((invoice) => Number(invoice.idEstado) === 1);

        setStates(availableStates);
        setSales(availableSales);
        setInvoices(availableInvoices);

        if (!isEditing) {
          reset({
            ...EMPTY_FORM,
            idVenta: String(activeSale?.idVenta ?? ""),
            idFactura: String(activeInvoice?.idFactura ?? ""),
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

    const loadSaleInvoice = async () => {
      try {
        setDetailLoading(true);
        const detail = await saleInvoicesApi.getSaleInvoiceByPk(idVenta, idFactura, { force: true });
        setCurrentSaleInvoice(detail);
        reset(mapSaleInvoiceToForm(detail));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "No pudimos cargar la relacion venta-factura",
          text: error?.response?.data?.message || "Volvamos al listado para evitar inconsistencias.",
        });
        navigate("/dashboard/ventas-factura");
      } finally {
        setDetailLoading(false);
      }
    };

    loadSaleInvoice();
  }, [idFactura, idVenta, isEditing, navigate, reset]);

  const onSubmit = async (values) => {
    if (!isAdmin || !hasRequiredData) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await saleInvoicesApi.updateSaleInvoice(idVenta, idFactura, buildUpdatePayload(values));
      } else {
        await saleInvoicesApi.createSaleInvoice(buildCreatePayload(values));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Relacion actualizada" : "Relacion creada",
        text: isEditing
          ? "Los cambios quedaron guardados correctamente."
          : "La relacion venta-factura fue creada correctamente.",
      });

      navigate("/dashboard/ventas-factura");
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
          <h1>Ventas-factura</h1>
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
            {isEditing ? "Editar relacion" : "Nueva relacion"}
          </p>
          <h1>{isEditing ? "Actualizar venta-factura" : "Crear venta-factura"}</h1>
          <p className="dashboard-page__lede">
            Vincula una venta con una factura existente. La factura recalcula sus montos cuando la
            relacion se crea, se desactiva o cambia de estado.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/ventas-factura">
          Volver al listado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Solo se muestran ventas y facturas activas al crear una relacion nueva. Si estas
          editando, se conserva la relacion actual aunque alguno de los dos registros haya quedado
          inactivo despues. El estado inicial siempre sera Activo por trigger.
        </div>

        {catalogsLoading || detailLoading ? (
          <div className="dashboard-empty-state">Cargando formulario...</div>
        ) : !hasRequiredData ? (
          <div className="dashboard-empty-state">
            Debe existir al menos una venta activa, una factura activa y estados disponibles para
            completar este formulario.
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="dashboard-form__fieldset" disabled={formDisabled}>
              <div className="dashboard-form-grid">
                <label className="dashboard-input">
                  <span>Venta</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
                    {...register("idVenta", { required: "La venta es obligatoria" })}
                  >
                    <option value="">Selecciona una venta</option>
                    {saleOptions.map((sale) => (
                      <option key={sale.idVenta} value={sale.idVenta}>
                        {buildSaleLabel(sale)}
                      </option>
                    ))}
                  </select>
                  {errors.idVenta ? <small>{errors.idVenta.message}</small> : null}
                </label>

                <label className="dashboard-input">
                  <span>Factura</span>
                  <select
                    className="form-select"
                    disabled={isEditing || formDisabled}
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
                  <span>Cliente de la venta</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={selectedSale?.cliente || selectedSale?.identificacion || ""}
                  />
                </label>

                <label className="dashboard-input">
                  <span>Total actual de la factura</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatMoney(selectedInvoice?.total, selectedInvoice?.simbolo)}
                  />
                  <small>Este valor puede cambiar despues de guardar la relacion.</small>
                </label>

                <label className="dashboard-input">
                  <span>Fecha de la factura</span>
                  <input
                    className="form-control"
                    readOnly
                    type="text"
                    value={formatDateTime(selectedInvoice?.fechaFactura)}
                  />
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear relacion"}
              </button>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/ventas-factura">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default SaleInvoiceFormPage;
