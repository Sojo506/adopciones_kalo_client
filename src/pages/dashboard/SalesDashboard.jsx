import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as salesApi from "../../api/sales";
import { useAuth } from "../../hooks/useAuth";

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const SalesDashboard = () => {
  const { isAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sales;
    }

    return sales.filter((sale) =>
      [sale.idVenta, sale.identificacion, sale.cliente, sale.totalVenta, sale.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [sales, search]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await salesApi.getSales({ force: true });
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las ventas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Ventas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadSales();
  }, [isAdmin]);

  const onDelete = async (sale) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar venta",
      text: "Se desactivara la venta seleccionada.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(sale.idVenta);
      await salesApi.deleteSale(sale.idVenta);
      await loadSales();

      Swal.fire({
        icon: "success",
        title: "Venta eliminada",
        text: "La venta fue desactivada correctamente.",
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
          <h1>Ventas</h1>
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
          <h1>Ventas</h1>
          <p className="dashboard-page__lede">
            Administra ventas registradas por usuario, total de la transaccion y estado general.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/ventas/nuevo">
          Crear venta
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una venta si todavia tiene detalle venta-producto o factura activa
          asociada.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, identificacion, total o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredSales.length} de {sales.length} ventas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando ventas...</div>
        ) : filteredSales.length === 0 ? (
          <div className="dashboard-empty-state">No hay ventas que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Identificacion</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const isDeletingCurrent = deletingId === sale.idVenta;

                  return (
                    <tr key={sale.idVenta}>
                      <td>{sale.identificacion}</td>
                      <td>{sale.cliente || "-"}</td>
                      <td>{formatCurrency(sale.totalVenta)}</td>
                      <td>{formatDateTime(sale.fechaVenta)}</td>
                      <td>{sale.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/ventas/${sale.idVenta}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(sale)}
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

export default SalesDashboard;
