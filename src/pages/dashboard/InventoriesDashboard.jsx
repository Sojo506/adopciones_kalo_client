import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as inventoriesApi from "../../api/inventories";
import { useAuth } from "../../hooks/useAuth";

const InventoriesDashboard = () => {
  const { isAdmin } = useAuth();
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredInventories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return inventories;
    }

    return inventories.filter((inventory) =>
      [
        inventory.idInventario,
        inventory.idProducto,
        inventory.producto,
        inventory.cantidad,
        inventory.stockMinimo,
        inventory.estado,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [inventories, search]);

  const loadInventories = async () => {
    try {
      setLoading(true);
      const data = await inventoriesApi.getInventories({ force: true });
      setInventories(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar el inventario",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Inventario | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadInventories();
  }, [isAdmin]);

  const onDelete = async (inventory) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Desactivar inventario",
      text: `Se desactivara el inventario del producto "${inventory.producto}".`,
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(inventory.idInventario);
      await inventoriesApi.deleteInventory(inventory.idInventario, {
        idProducto: inventory.idProducto,
      });
      await loadInventories();

      Swal.fire({
        icon: "success",
        title: "Inventario desactivado",
        text: "El inventario fue desactivado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos desactivar el inventario",
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
          <h1>Inventario</h1>
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
          <p className="dashboard-page__eyebrow">Productos e inventario</p>
          <h1>Inventario</h1>
          <p className="dashboard-page__lede">
            Mantiene el stock actual por producto. Cada producto solo puede tener un inventario y
            cualquier cambio de cantidad genera un movimiento automatico de ingreso o egreso.
            El stock minimo se configura por inventario para detectar alertas operativas.
          </p>
        </div>
        <div className="dashboard-table__actions">
          <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/movimientos-inventario">
            Ver movimientos
          </Link>
          <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/inventario/nuevo">
            Crear inventario
          </Link>
        </div>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Si una cantidad baja o sube desde este CRUD, el movimiento
          correspondiente se registra en <code>Movimientos de inventario</code>.
        </div>

        <div className="dashboard-alert">
          El stock bajo se calcula comparando el stock actual contra el stock minimo configurado en
          cada inventario.
        </div>

        <div className="dashboard-alert">
          No puedes desactivar un inventario mientras tenga stock disponible; primero debe quedar en
          cero mediante un egreso.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por producto, stock actual, stock minimo o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredInventories.length} de {inventories.length} inventarios
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando inventario...</div>
        ) : filteredInventories.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay inventarios que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock actual</th>
                  <th>Stock minimo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventories.map((inventory) => {
                  const isDeletingCurrent = deletingId === inventory.idInventario;

                  return (
                    <tr key={inventory.idInventario}>
                      <td>{inventory.producto || "Producto registrado"}</td>
                      <td>{Number(inventory.cantidad || 0)}</td>
                      <td>{Number(inventory.stockMinimo ?? 10)}</td>
                      <td>{inventory.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/inventario/${inventory.idInventario}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(inventory)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Desactivando..." : "Desactivar"}
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

export default InventoriesDashboard;
