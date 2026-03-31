import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as eventTypesApi from "../../api/eventTypes";
import { useAuth } from "../../hooks/useAuth";

const EventTypesDashboard = () => {
  const { isAdmin } = useAuth();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredEventTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return eventTypes;
    }

    return eventTypes.filter((eventType) =>
      [eventType.idTipoEvento, eventType.nombre, eventType.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [eventTypes, search]);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const data = await eventTypesApi.getEventTypes({ force: true });
      setEventTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los tipos de evento",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Tipos de evento | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadEventTypes();
  }, [isAdmin]);

  const onDelete = async (eventType) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar tipo de evento",
      text: `Se desactivara el tipo "${eventType.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(eventType.idTipoEvento);
      await eventTypesApi.deleteEventType(eventType.idTipoEvento);
      await loadEventTypes();

      Swal.fire({
        icon: "success",
        title: "Tipo de evento eliminado",
        text: "El tipo de evento fue desactivado correctamente.",
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
          <h1>Tipos de evento</h1>
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
          <h1>Tipos de evento</h1>
          <p className="dashboard-page__lede">
            Administra los tipos de evento disponibles para registrar historial medico y operativo de los perritos.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/tipos-evento/nuevo">
          Crear tipo
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar un tipo de evento si todavia tiene eventos activos asociados.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredEventTypes.length} de {eventTypes.length} tipos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando tipos de evento...</div>
        ) : filteredEventTypes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay tipos de evento que coincidan con tu busqueda.
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
                {filteredEventTypes.map((eventType) => {
                  const isDeletingCurrent = deletingId === eventType.idTipoEvento;

                  return (
                    <tr key={eventType.idTipoEvento}>
                      <td>{eventType.nombre}</td>
                      <td>{eventType.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/tipos-evento/${eventType.idTipoEvento}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(eventType)}
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

export default EventTypesDashboard;
