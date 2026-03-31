import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as breedsApi from "../../api/breeds";
import { useAuth } from "../../hooks/useAuth";

const BreedsDashboard = () => {
  const { isAdmin } = useAuth();
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredBreeds = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return breeds;
    }

    return breeds.filter((breed) =>
      [breed.idRaza, breed.nombre, breed.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [breeds, search]);

  const loadBreeds = async () => {
    try {
      setLoading(true);
      const data = await breedsApi.getBreeds({ force: true });
      setBreeds(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las razas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Razas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadBreeds();
  }, [isAdmin]);

  const onDelete = async (breed) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar raza",
      text: `Se desactivara la raza "${breed.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(breed.idRaza);
      await breedsApi.deleteBreed(breed.idRaza);
      await loadBreeds();

      Swal.fire({
        icon: "success",
        title: "Raza eliminada",
        text: "La raza fue desactivada correctamente.",
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
          <h1>Razas</h1>
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
          <h1>Razas</h1>
          <p className="dashboard-page__lede">
            Administra las razas disponibles para clasificar perritos dentro del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/razas/nuevo">
          Crear raza
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una raza si todavia tiene perritos activos asociados.
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
            {filteredBreeds.length} de {breeds.length} razas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando razas...</div>
        ) : filteredBreeds.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay razas que coincidan con tu busqueda.
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
                {filteredBreeds.map((breed) => {
                  const isDeletingCurrent = deletingId === breed.idRaza;

                  return (
                    <tr key={breed.idRaza}>
                      <td>{breed.nombre}</td>
                      <td>{breed.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/razas/${breed.idRaza}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(breed)}
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

export default BreedsDashboard;
