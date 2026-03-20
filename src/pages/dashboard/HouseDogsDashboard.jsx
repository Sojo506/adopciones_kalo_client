import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as houseDogsApi from "../../api/houseDogs";
import { useAuth } from "../../hooks/useAuth";

const buildFosterHomeLabel = (houseDog) => {
  const base = `#${houseDog.idCasaCuna}`;
  return houseDog.casaCuna ? `${base} - ${houseDog.casaCuna}` : base;
};

const buildDogLabel = (houseDog) => {
  const base = `#${houseDog.idPerrito}`;
  return houseDog.nombrePerrito ? `${base} - ${houseDog.nombrePerrito}` : base;
};

const HouseDogsDashboard = () => {
  const { isAdmin } = useAuth();
  const [houseDogs, setHouseDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [search, setSearch] = useState("");

  const filteredHouseDogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return houseDogs;
    }

    return houseDogs.filter((houseDog) =>
      [
        houseDog.idCasaCuna,
        houseDog.casaCuna,
        houseDog.idPerrito,
        houseDog.nombrePerrito,
        houseDog.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [houseDogs, search]);

  const loadHouseDogs = async () => {
    try {
      setLoading(true);
      const data = await houseDogsApi.getHouseDogs({ force: true });
      setHouseDogs(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las relaciones casa-perrito",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Casa-perrito | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadHouseDogs();
  }, [isAdmin]);

  const onDelete = async (houseDog) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar relacion casa-perrito",
      text: `Se desactivara la asignacion de la casa cuna #${houseDog.idCasaCuna} con el perrito #${houseDog.idPerrito}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    const relationKey = `${houseDog.idCasaCuna}:${houseDog.idPerrito}`;

    try {
      setDeletingKey(relationKey);
      await houseDogsApi.deleteHouseDog(houseDog.idCasaCuna, houseDog.idPerrito);
      await loadHouseDogs();

      Swal.fire({
        icon: "success",
        title: "Relacion eliminada",
        text: "La relacion casa-perrito fue desactivada correctamente.",
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
          <h1>Casa-perrito</h1>
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
          <p className="dashboard-page__eyebrow">Asignaciones temporales</p>
          <h1>Casa-perrito</h1>
          <p className="dashboard-page__lede">
            Administra la relacion entre casas cuna y los perritos que estan temporalmente a su
            cargo.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/casas-perrito/nuevo">
          Crear relacion
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Un perrito solo puede tener una asignacion activa a la vez. Si necesitas moverlo,
          desactiva o edita su relacion actual antes de crear otra.
        </div>

        <div className="dashboard-alert">
          Esta tabla conecta <Link to="/dashboard/casas-cuna">Casas cuna</Link> con{" "}
          <Link to="/dashboard/perritos">Perritos</Link>. Si alguno queda inactivo, no podras
          reactivar la relacion hasta corregirlo.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingKey !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por casa cuna, perrito o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredHouseDogs.length} de {houseDogs.length} relaciones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando relaciones casa-perrito...</div>
        ) : filteredHouseDogs.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay relaciones casa-perrito que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Casa cuna</th>
                  <th>Perrito</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredHouseDogs.map((houseDog) => {
                  const relationKey = `${houseDog.idCasaCuna}:${houseDog.idPerrito}`;
                  const isDeletingCurrent = deletingKey === relationKey;
                  const isInactive = Number(houseDog.idEstado) !== 1;

                  return (
                    <tr key={relationKey}>
                      <td>{buildFosterHomeLabel(houseDog)}</td>
                      <td>{buildDogLabel(houseDog)}</td>
                      <td>{houseDog.estado || houseDog.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingKey !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingKey !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/casas-perrito/${houseDog.idCasaCuna}/${houseDog.idPerrito}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingKey !== null}
                            onClick={() => onDelete(houseDog)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Relacion ya inactiva</small>
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

export default HouseDogsDashboard;
