import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as cantonsApi from "../../api/cantons";
import { useAuth } from "../../hooks/useAuth";

const CantonsDashboard = () => {
  const { isAdmin } = useAuth();
  const [cantons, setCantons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCantons = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return cantons;
    }

    return cantons.filter((canton) =>
      [canton.idCanton, canton.nombre, canton.provincia, canton.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [cantons, search]);

  const loadCantons = async () => {
    try {
      setLoading(true);
      const data = await cantonsApi.getCantons({ force: true });
      setCantons(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los cantones",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Cantones | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadCantons();
  }, [isAdmin]);

  const onDelete = async (canton) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar canton",
      text: `Se desactivara el canton "${canton.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(canton.idCanton);
      await cantonsApi.deleteCanton(canton.idCanton);
      await loadCantons();

      Swal.fire({
        icon: "success",
        title: "Canton eliminado",
        text: "El canton fue desactivado correctamente.",
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
          <h1>Cantones</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de ubicaciones</p>
          <h1>Cantones</h1>
          <p className="dashboard-page__lede">
            Administra los cantones enlazados a cada provincia y su disponibilidad operativa.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/cantones/nuevo">
          Crear canton
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El sistema no permite desactivar ni mover un canton si todavia tiene distritos activos.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre, provincia o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredCantons.length} de {cantons.length} cantones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando cantones...</div>
        ) : filteredCantons.length === 0 ? (
          <div className="dashboard-empty-state">No hay cantones que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Provincia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCantons.map((canton) => {
                  const isDeletingCurrent = deletingId === canton.idCanton;
                  const isInactive = Number(canton.idEstado) !== 1;

                  return (
                    <tr key={canton.idCanton}>
                      <td>{canton.idCanton}</td>
                      <td>{canton.nombre}</td>
                      <td>{canton.provincia || canton.idProvincia}</td>
                      <td>{canton.estado || canton.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/cantones/${canton.idCanton}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(canton)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Canton ya inactivo</small>
                        ) : null}
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

export default CantonsDashboard;
