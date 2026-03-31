import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as invoicesApi from "../../api/invoices";
import { useAuth } from "../../hooks/useAuth";

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

const InvoicesDashboard = () => {
  const { isAdmin } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return invoices;
    }

    return invoices.filter((invoice) =>
      [
        invoice.idFactura,
        invoice.moneda,
        invoice.simbolo,
        invoice.estado,
        invoice.fechaFactura,
        invoice.tasaImpuestoAplicada,
        invoice.subtotal,
        invoice.impuesto,
        invoice.total,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [invoices, search]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.getInvoices({ force: true });
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las facturas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Facturas | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadInvoices();
  }, [isAdmin]);

  const onDelete = async (invoice) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar factura",
      text: "Se desactivara la factura seleccionada.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(invoice.idFactura);
      await invoicesApi.deleteInvoice(invoice.idFactura);
      await loadInvoices();

      Swal.fire({
        icon: "success",
        title: "Factura eliminada",
        text: "La factura fue desactivada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos eliminar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Facturas</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede gestionar esta tabla desde el dashboard.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Gestion comercial</p>
          <h1>Facturas</h1>
          <p className="dashboard-page__lede">
            Administra facturas, moneda, tasa de impuesto y los totales recalculados del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/facturas/nuevo">
          Crear factura
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una factura si todavia tiene ventas, donaciones o pagos PayPal
          activos asociados.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por moneda, fecha, monto o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredInvoices.length} de {invoices.length} facturas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando facturas...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay facturas que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Moneda</th>
                  <th>Tasa</th>
                  <th>Subtotal</th>
                  <th>Impuesto</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const isDeletingCurrent = deletingId === invoice.idFactura;

                  return (
                    <tr key={invoice.idFactura}>
                      <td>{invoice.moneda || "Moneda registrada"}</td>
                      <td>{invoice.tasaImpuestoAplicada}</td>
                      <td>{formatMoney(invoice.subtotal, invoice.simbolo)}</td>
                      <td>{formatMoney(invoice.impuesto, invoice.simbolo)}</td>
                      <td>{formatMoney(invoice.total, invoice.simbolo)}</td>
                      <td>{formatDateTime(invoice.fechaFactura)}</td>
                      <td>{invoice.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/facturas/${invoice.idFactura}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(invoice)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default InvoicesDashboard;
