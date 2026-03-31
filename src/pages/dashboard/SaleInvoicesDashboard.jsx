import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as saleInvoicesApi from "../../api/saleInvoices";
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

const SaleInvoicesDashboard = () => {
  const { isAdmin } = useAuth();
  const [saleInvoices, setSaleInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [search, setSearch] = useState("");

  const filteredSaleInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return saleInvoices;
    }

    return saleInvoices.filter((saleInvoice) =>
      [
        saleInvoice.idVenta,
        saleInvoice.cliente,
        saleInvoice.idFactura,
        saleInvoice.moneda,
        saleInvoice.totalFactura,
        saleInvoice.fechaFactura,
        saleInvoice.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [saleInvoices, search]);

  const loadSaleInvoices = async () => {
    try {
      setLoading(true);
      const data = await saleInvoicesApi.getSaleInvoices({ force: true });
      setSaleInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las relaciones venta-factura",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Ventas-factura | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadSaleInvoices();
  }, [isAdmin]);

  const onDelete = async (saleInvoice) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar relacion venta-factura",
      text: `Se desactivara la relacion de factura para ${saleInvoice.cliente || "la compra seleccionada"}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    const cacheKey = `${saleInvoice.idVenta}:${saleInvoice.idFactura}`;

    try {
      setDeletingKey(cacheKey);
      await saleInvoicesApi.deleteSaleInvoice(saleInvoice.idVenta, saleInvoice.idFactura);
      await loadSaleInvoices();

      Swal.fire({
        icon: "success",
        title: "Relacion eliminada",
        text: "La relacion venta-factura fue desactivada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos eliminar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDeletingKey(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Ventas-factura</h1>
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
          <h1>Ventas-factura</h1>
          <p className="dashboard-page__lede">
            Relaciona ventas con sus facturas y recalcula los montos de la factura asociada.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/ventas-factura/nuevo">
          Crear relacion
        </Link>
      </div>

      <section className="dashboard-card">
        {/* <div className="dashboard-alert">
          Las relaciones nuevas siempre inician activas por trigger. Cada alta, baja o cambio de
          estado recalcula el total de la factura asociada.
        </div> */}

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingKey !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, moneda, total o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredSaleInvoices.length} de {saleInvoices.length} relaciones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando relaciones venta-factura...</div>
        ) : filteredSaleInvoices.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay relaciones venta-factura que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Moneda</th>
                  <th>Total factura</th>
                  <th>Fecha factura</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSaleInvoices.map((saleInvoice) => {
                  const cacheKey = `${saleInvoice.idVenta}:${saleInvoice.idFactura}`;
                  const isDeletingCurrent = deletingKey === cacheKey;

                  return (
                    <tr key={cacheKey}>
                      <td>{saleInvoice.cliente || "-"}</td>
                      <td>{saleInvoice.moneda || "-"}</td>
                      <td>{formatMoney(saleInvoice.totalFactura, saleInvoice.simbolo)}</td>
                      <td>{formatDateTime(saleInvoice.fechaFactura)}</td>
                      <td>{saleInvoice.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingKey !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingKey !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/ventas-factura/${saleInvoice.idVenta}/${saleInvoice.idFactura}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingKey !== null}
                            onClick={() => onDelete(saleInvoice)}
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

export default SaleInvoicesDashboard;
