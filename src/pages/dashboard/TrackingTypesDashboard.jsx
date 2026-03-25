import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as trackingTypesApi from "../../api/trackingTypes";
import { useAuth } from "../../hooks/useAuth";

const TrackingTypesDashboard = () => {
  const { isAdmin } = useAuth();
  const [trackingTypes, setTrackingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredTrackingTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return trackingTypes;
    }

    return trackingTypes.filter((trackingType) =>
      [trackingType.idTipoSeguimiento, trackingType.nombre, trackingType.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [trackingTypes, search]);

  const loadTrackingTypes = async () => {
    try {
      setLoading(true);
      const data = await trackingTypesApi.getTrackingTypes({ force: true });
      setTrackingTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los tipos de seguimiento",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Tipos de seguimiento | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadTrackingTypes();
  }, [isAdmin]);

  const onDelete = async (trackingType) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar tipo de seguimiento",
      text: `Se desactivara el tipo "${trackingType.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(trackingType.idTipoSeguimiento);
      await trackingTypesApi.deleteTrackingType(trackingType.idTipoSeguimiento);
      await loadTrackingTypes();

      Swal.fire({
        icon: "success",
        title: "Tipo de seguimiento eliminado",
        text: "El tipo de seguimiento fue desactivado correctamente.",
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
          <h1>Tipos de seguimiento</h1>
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
          <h1>Tipos de seguimiento</h1>
          <p className="dashboard-page__lede">
            Administra las categorias de seguimiento disponibles para el acompanamiento posterior a la adopcion.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/tipos-seguimiento/nuevo">
          Crear tipo
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar un tipo de seguimiento si todavia tiene seguimientos activos asociados.
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
            {filteredTrackingTypes.length} de {trackingTypes.length} tipos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando tipos de seguimiento...</div>
        ) : filteredTrackingTypes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay tipos de seguimiento que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrackingTypes.map((trackingType) => {
                  const isDeletingCurrent = deletingId === trackingType.idTipoSeguimiento;

                  return (
                    <tr key={trackingType.idTipoSeguimiento}>
                      <td>{trackingType.nombre}</td>
                      <td>{trackingType.estado || trackingType.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/tipos-seguimiento/${trackingType.idTipoSeguimiento}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(trackingType)}
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

export default TrackingTypesDashboard;
