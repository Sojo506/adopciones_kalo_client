import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as movementTypesApi from "../../api/movementTypes";
import { useAuth } from "../../hooks/useAuth";

const MovementTypesDashboard = () => {
  const { isAdmin } = useAuth();
  const [movementTypes, setMovementTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredMovementTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return movementTypes;
    }

    return movementTypes.filter((movementType) =>
      [movementType.idTipoMovimiento, movementType.nombre, movementType.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [movementTypes, search]);

  const loadMovementTypes = async () => {
    try {
      setLoading(true);
      const data = await movementTypesApi.getMovementTypes({ force: true });
      setMovementTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los tipos de movimiento",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Tipos de movimiento | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadMovementTypes();
  }, [isAdmin]);

  const onDelete = async (movementType) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar tipo de movimiento",
      text: `Se desactivara el tipo "${movementType.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(movementType.idTipoMovimiento);
      await movementTypesApi.deleteMovementType(movementType.idTipoMovimiento);
      await loadMovementTypes();

      Swal.fire({
        icon: "success",
        title: "Tipo de movimiento eliminado",
        text: "El tipo de movimiento fue desactivado correctamente.",
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
          <h1>Tipos de movimiento</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de catalogo</p>
          <h1>Tipos de movimiento</h1>
          <p className="dashboard-page__lede">
            Administra las clases de movimiento que impactan inventario y ventas dentro del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/tipos-movimiento/nuevo">
          Crear tipo
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar un tipo de movimiento si todavia tiene movimientos de inventario o
          detalles de venta activos asociados.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredMovementTypes.length} de {movementTypes.length} tipos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando tipos de movimiento...</div>
        ) : filteredMovementTypes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay tipos de movimiento que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovementTypes.map((movementType) => {
                  const isDeletingCurrent = deletingId === movementType.idTipoMovimiento;

                  return (
                    <tr key={movementType.idTipoMovimiento}>
                      <td>{movementType.idTipoMovimiento}</td>
                      <td>{movementType.nombre}</td>
                      <td>{movementType.estado || movementType.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/tipos-movimiento/${movementType.idTipoMovimiento}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(movementType)}
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

export default MovementTypesDashboard;
