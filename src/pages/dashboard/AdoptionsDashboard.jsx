import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as adoptionsApi from "../../api/adoptions";
import { useAuth } from "../../hooks/useAuth";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(date);
};

const buildRequestLabel = (adoption) => {
  return `#${adoption.idSolicitud}`;
};

const buildDogLabel = (adoption) => {
  const base = `#${adoption.idPerrito}`;
  return adoption.nombrePerrito ? `${base} - ${adoption.nombrePerrito}` : base;
};

const buildAdopterLabel = (adoption) => {
  const base = String(adoption.identificacion || "-");
  return adoption.adoptante ? `${base} - ${adoption.adoptante}` : base;
};

const AdoptionsDashboard = () => {
  const { isAdmin } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredAdoptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return adoptions;
    }

    return adoptions.filter((adoption) =>
      [
        adoption.idAdopcion,
        adoption.identificacion,
        adoption.adoptante,
        adoption.idSolicitud,
        adoption.idPerrito,
        adoption.nombrePerrito,
        adoption.fechaAdopcion,
        adoption.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [adoptions, search]);

  const loadAdoptions = async () => {
    try {
      setLoading(true);
      const data = await adoptionsApi.getAdoptions({ force: true });
      setAdoptions(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las adopciones",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Adopciones | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadAdoptions();
  }, [isAdmin]);

  const onDelete = async (adoption) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar adopcion",
      text: `Se desactivara la adopcion #${adoption.idAdopcion}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(adoption.idAdopcion);
      await adoptionsApi.deleteAdoption(adoption.idAdopcion);
      await loadAdoptions();

      Swal.fire({
        icon: "success",
        title: "Adopcion eliminada",
        text: "La adopcion fue desactivada correctamente.",
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
          <h1>Adopciones</h1>
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
          <p className="dashboard-page__eyebrow">Solicitudes, adopciones y seguimiento</p>
          <h1>Adopciones</h1>
          <p className="dashboard-page__lede">
            Formaliza el cierre del proceso aprobando la solicitud, el adoptante y el perrito
            seleccionado.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/adopciones/nuevo">
          Crear adopcion
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          La solicitud define al adoptante. Cada solicitud solo puede usarse una vez en adopciones.
        </div>

        <div className="dashboard-alert">
          Un perrito solo puede tener una adopcion activa a la vez. Si la adopcion se reabre o se
          reemplaza, primero debes actualizar o desactivar la actual.
        </div>

        <div className="dashboard-alert">
          No puedes eliminar o desactivar una adopcion si todavia tiene seguimientos activos.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, adoptante, solicitud, perrito, fecha o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredAdoptions.length} de {adoptions.length} adopciones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando adopciones...</div>
        ) : filteredAdoptions.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay adopciones que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Adoptante</th>
                  <th>Perrito</th>
                  <th>Fecha adopcion</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdoptions.map((adoption) => {
                  const isDeletingCurrent = deletingId === adoption.idAdopcion;
                  const isInactive = Number(adoption.idEstado) !== 1;

                  return (
                    <tr key={adoption.idAdopcion}>
                      <td>{buildRequestLabel(adoption)}</td>
                      <td>{buildAdopterLabel(adoption)}</td>
                      <td>{buildDogLabel(adoption)}</td>
                      <td>{formatDate(adoption.fechaAdopcion)}</td>
                      <td>{adoption.estado || adoption.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/adopciones/${adoption.idAdopcion}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(adoption)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {/* {isInactive ? (
                          <small className="dashboard-table__note">Adopcion ya inactiva</small>
                        ) : null} */}
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

export default AdoptionsDashboard;
