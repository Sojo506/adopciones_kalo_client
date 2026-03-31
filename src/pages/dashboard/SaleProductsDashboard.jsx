import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as saleProductsApi from "../../api/saleProducts";
import { useAuth } from "../../hooks/useAuth";

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const SaleProductsDashboard = () => {
  const { isAdmin } = useAuth();
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [search, setSearch] = useState("");

  const filteredSaleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return saleProducts;
    }

    return saleProducts.filter((saleProduct) =>
      [
        saleProduct.idVenta,
        saleProduct.idProducto,
        saleProduct.producto,
        saleProduct.tipoMovimiento,
        saleProduct.cantidad,
        saleProduct.precioUnitario,
        saleProduct.total,
        saleProduct.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [saleProducts, search]);

  const loadSaleProducts = async () => {
    try {
      setLoading(true);
      const data = await saleProductsApi.getSaleProducts({ force: true });
      setSaleProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar el detalle de venta",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Detalle venta-producto | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadSaleProducts();
  }, [isAdmin]);

  const onDelete = async (saleProduct) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar linea de venta",
      text: `Se desactivara la linea de ${saleProduct.producto || "producto seleccionado"}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    const cacheKey = `${saleProduct.idVenta}:${saleProduct.idProducto}`;

    try {
      setDeletingKey(cacheKey);
      await saleProductsApi.deleteSaleProduct(saleProduct.idVenta, saleProduct.idProducto);
      await loadSaleProducts();

      Swal.fire({
        icon: "success",
        title: "Linea eliminada",
        text: "La linea de detalle fue desactivada correctamente.",
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
          <h1>Detalle venta-producto</h1>
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
          <h1>Detalle venta-producto</h1>
          <p className="dashboard-page__lede">
            Administra las lineas de productos vendidas dentro de cada venta y su estado.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/ventas-producto/nuevo">
          Crear linea
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Cada cambio recalcula el total de la venta. Si la venta ya tiene facturas activas, el
          detalle no se puede modificar desde este modulo.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingKey !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por venta, producto, tipo, cantidad, precio unitario, total o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredSaleProducts.length} de {saleProducts.length} lineas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando detalle de ventas...</div>
        ) : filteredSaleProducts.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay lineas de venta que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre producto</th>
                  <th>Tipo movimiento</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSaleProducts.map((saleProduct) => {
                  const cacheKey = `${saleProduct.idVenta}:${saleProduct.idProducto}`;
                  const isDeletingCurrent = deletingKey === cacheKey;

                  return (
                    <tr key={cacheKey}>
                      <td>{saleProduct.producto || "-"}</td>
                      <td>{saleProduct.tipoMovimiento || "-"}</td>
                      <td>{saleProduct.cantidad}</td>
                      <td>{formatCurrency(saleProduct.precioUnitario)}</td>
                      <td>{formatCurrency(saleProduct.total)}</td>
                      <td>{saleProduct.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingKey !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingKey !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/ventas-producto/${saleProduct.idVenta}/${saleProduct.idProducto}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingKey !== null}
                            onClick={() => onDelete(saleProduct)}
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

export default SaleProductsDashboard;
