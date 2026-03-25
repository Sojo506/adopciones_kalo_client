import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as followUpsApi from "../../api/followUps";
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

const buildAdoptionLabel = (followUp) => {
  return `#${followUp.idAdopcion}`;
};

const buildAdopterLabel = (followUp) => {
  const base = String(followUp.identificacion || "-");
  return followUp.adoptante ? `${base} - ${followUp.adoptante}` : base;
};

const buildDogLabel = (followUp) => {
  const base = `#${followUp.idPerrito}`;
  return followUp.nombrePerrito ? `${base} - ${followUp.nombrePerrito}` : base;
};

const formatCommentsPreview = (value) => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "-";
  }

  if (normalized.length <= 88) {
    return normalized;
  }

  return `${normalized.slice(0, 85)}...`;
};

const FollowUpsDashboard = () => {
  const { isAdmin } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredFollowUps = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return followUps;
    }

    return followUps.filter((followUp) =>
      [
        followUp.idSeguimiento,
        followUp.idAdopcion,
        followUp.identificacion,
        followUp.adoptante,
        followUp.idPerrito,
        followUp.nombrePerrito,
        followUp.idTipoSeguimiento,
        followUp.tipoSeguimiento,
        followUp.fechaInicio,
        followUp.fechaFin,
        followUp.comentarios,
        followUp.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [followUps, search]);

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      const data = await followUpsApi.getFollowUps({ force: true });
      setFollowUps(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los seguimientos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Seguimientos | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadFollowUps();
  }, [isAdmin]);

  const onDelete = async (followUp) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar seguimiento",
      text: `Se desactivara el seguimiento #${followUp.idSeguimiento}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(followUp.idSeguimiento);
      await followUpsApi.deleteFollowUp(followUp.idSeguimiento);
      await loadFollowUps();

      Swal.fire({
        icon: "success",
        title: "Seguimiento eliminado",
        text: "El seguimiento fue desactivado correctamente.",
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
          <h1>Seguimientos</h1>
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
          <p className="dashboard-page__eyebrow">Acompanamiento post adopcion</p>
          <h1>Seguimientos</h1>
          <p className="dashboard-page__lede">
            Programa las revisiones que acompanaran cada adopcion. Luego el usuario vera esos
            seguimientos en su perfil para subir evidencias.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/seguimientos/nuevo">
          Crear seguimiento
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Cada seguimiento debe colgar de una <Link to="/dashboard/adopciones">adopcion</Link>{" "}
          activa y de un <Link to="/dashboard/tipos-seguimiento">tipo de seguimiento</Link>{" "}
          disponible.
        </div>

        <div className="dashboard-alert">
          Si un seguimiento ya tiene evidencias activas, no podras cambiar adopcion, tipo ni
          fechas, y tampoco desactivarlo o eliminarlo.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, adopcion, adoptante, perrito, tipo, fechas, comentario o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredFollowUps.length} de {followUps.length} seguimientos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando seguimientos...</div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay seguimientos que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Adopcion</th>
                  <th>Adoptante</th>
                  <th>Perrito</th>
                  <th>Tipo</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Comentarios</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFollowUps.map((followUp) => {
                  const isDeletingCurrent = deletingId === followUp.idSeguimiento;
                  const isInactive = Number(followUp.idEstado) !== 1;

                  return (
                    <tr key={followUp.idSeguimiento}>
                      <td>{buildAdoptionLabel(followUp)}</td>
                      <td>{buildAdopterLabel(followUp)}</td>
                      <td>{buildDogLabel(followUp)}</td>
                      <td>{followUp.tipoSeguimiento || followUp.idTipoSeguimiento}</td>
                      <td>{formatDate(followUp.fechaInicio)}</td>
                      <td>{formatDate(followUp.fechaFin)}</td>
                      <td title={followUp.comentarios}>
                        {formatCommentsPreview(followUp.comentarios)}
                      </td>
                      <td>{followUp.estado || followUp.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/seguimientos/${followUp.idSeguimiento}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(followUp)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Seguimiento ya inactivo</small>
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

export default FollowUpsDashboard;
