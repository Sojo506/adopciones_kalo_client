import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as statesApi from "../../api/states";
import { useAuth } from "../../hooks/useAuth";

const RESERVED_STATE_IDS = new Set([1, 2, 3]);
const RESERVED_STATE_NAMES = new Set(["activo", "inactivo", "pendiente"]);

const isReservedState = (state) =>
  RESERVED_STATE_IDS.has(Number(state?.idEstado)) ||
  RESERVED_STATE_NAMES.has(String(state?.nombreEstado || "").trim().toLowerCase());

const StatesDashboard = () => {
  const { isAdmin } = useAuth();
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredStates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return states;
    }

    return states.filter((state) =>
      [state.idEstado, state.nombreEstado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, states]);

  const loadStates = async () => {
    try {
      setLoading(true);
      const data = await statesApi.getStates({ force: true });
      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los estados",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Estados | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadStates();
  }, [isAdmin]);

  const onDelete = async (state) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar estado",
      text: `Se eliminara el estado "${state.nombreEstado}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(state.idEstado);
      await statesApi.deleteState(state.idEstado);
      await loadStates();

      Swal.fire({
        icon: "success",
        title: "Estado eliminado",
        text: "El estado fue eliminado correctamente.",
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
          <h1>Estados</h1>
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
          <h1>Estados</h1>
          <p className="dashboard-page__lede">
            Administra los estados reutilizables que usan otros modulos para su ciclo de vida.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/estados/nuevo">
          Crear estado
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Los estados base <strong>Activo</strong>, <strong>Inactivo</strong> y{" "}
          <strong>Pendiente</strong> estan protegidos. Los demas solo pueden eliminarse si no
          tienen registros relacionados.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID o nombre"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredStates.length} de {states.length} estados
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando estados...</div>
        ) : filteredStates.length === 0 ? (
          <div className="dashboard-empty-state">No hay estados que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStates.map((state) => {
                  const reservedState = isReservedState(state);
                  const actionsDisabled = reservedState || deletingId !== null;
                  const isDeletingCurrent = deletingId === state.idEstado;

                  return (
                    <tr key={state.idEstado}>
                      <td>{state.idEstado}</td>
                      <td>{state.nombreEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${actionsDisabled ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (actionsDisabled) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/estados/${state.idEstado}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={actionsDisabled}
                            onClick={() => onDelete(state)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {reservedState ? (
                          <small className="dashboard-table__note">Estado base protegido</small>
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

export default StatesDashboard;
