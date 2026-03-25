import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as inventoryMovementsApi from "../../api/inventoryMovements";
import { useAuth } from "../../hooks/useAuth";

const formatDateTime = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha invalida";
  }

  return date.toLocaleString("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const InventoryMovementsDashboard = () => {
  const { isAdmin } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredMovements = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return movements;
    }

    return movements.filter((movement) =>
      [
        movement.idMovimiento,
        movement.idProducto,
        movement.producto,
        movement.idTipoMovimiento,
        movement.tipoMovimiento,
        movement.cantidad,
        movement.estado,
        formatDateTime(movement.fechaMovimiento),
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [movements, search]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await inventoryMovementsApi.getInventoryMovements({ force: true });
      setMovements(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los movimientos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Movimientos de inventario | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadMovements();
  }, [isAdmin]);

  const onDelete = async (movement) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Desactivar movimiento",
      text: `Se desactivara el movimiento #${movement.idMovimiento} de "${movement.producto}".`,
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(movement.idMovimiento);
      await inventoryMovementsApi.deleteInventoryMovement(movement.idMovimiento, {
        idProducto: movement.idProducto,
      });
      await loadMovements();

      Swal.fire({
        icon: "success",
        title: "Movimiento desactivado",
        text: "El movimiento fue desactivado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos desactivar el movimiento",
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
          <h1>Movimientos de inventario</h1>
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
          <h1>Movimientos de inventario</h1>
          <p className="dashboard-page__lede">
            Cada movimiento activo recalcula el stock del inventario asociado.
          </p>
        </div>
        <div className="dashboard-table__actions">
          <Link className="dashboard-btn dashboard-btn--ghost" to="/dashboard/inventario">
            Ver inventario
          </Link>
          <Link
            className="dashboard-btn dashboard-btn--primary"
            to="/dashboard/movimientos-inventario/nuevo"
          >
            Crear movimiento
          </Link>
        </div>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Un movimiento activo de <strong>INGRESO</strong> suma stock y uno de{" "}
          <strong>EGRESO</strong> lo reduce.
        </div>

        <div className="dashboard-alert">
          Al desactivar un movimiento activo, el backend revierte su efecto sobre el inventario.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, producto, tipo, cantidad, fecha o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredMovements.length} de {movements.length} movimientos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando movimientos...</div>
        ) : filteredMovements.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay movimientos que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => {
                  const isDeletingCurrent = deletingId === movement.idMovimiento;

                  return (
                    <tr key={movement.idMovimiento}>
                      <td>{movement.producto || movement.idProducto}</td>
                      <td>{movement.tipoMovimiento || movement.idTipoMovimiento}</td>
                      <td>{Number(movement.cantidad || 0)}</td>
                      <td>{formatDateTime(movement.fechaMovimiento)}</td>
                      <td>{movement.estado || movement.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/movimientos-inventario/${movement.idMovimiento}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(movement)}
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

export default InventoryMovementsDashboard;
