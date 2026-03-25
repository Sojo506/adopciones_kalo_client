import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as sexesApi from "../../api/sexes";
import { useAuth } from "../../hooks/useAuth";

const SexesDashboard = () => {
  const { isAdmin } = useAuth();
  const [sexes, setSexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredSexes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sexes;
    }

    return sexes.filter((sex) =>
      [sex.idSexo, sex.nombre, sex.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [sexes, search]);

  const loadSexes = async () => {
    try {
      setLoading(true);
      const data = await sexesApi.getSexes({ force: true });
      setSexes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los sexos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Sexos | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadSexes();
  }, [isAdmin]);

  const onDelete = async (sex) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar sexo",
      text: `Se desactivara el sexo "${sex.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(sex.idSexo);
      await sexesApi.deleteSex(sex.idSexo);
      await loadSexes();

      Swal.fire({
        icon: "success",
        title: "Sexo eliminado",
        text: "El sexo fue desactivado correctamente.",
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
          <h1>Sexos</h1>
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
          <h1>Sexos</h1>
          <p className="dashboard-page__lede">
            Administra las opciones de sexo disponibles para clasificar perritos dentro del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/sexos/nuevo">
          Crear sexo
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar un sexo si todavia tiene perritos activos asociados.
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
            {filteredSexes.length} de {sexes.length} sexos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando sexos...</div>
        ) : filteredSexes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay sexos que coincidan con tu busqueda.
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
                {filteredSexes.map((sex) => {
                  const isDeletingCurrent = deletingId === sex.idSexo;

                  return (
                    <tr key={sex.idSexo}>
                      <td>{sex.nombre}</td>
                      <td>{sex.estado || sex.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/sexos/${sex.idSexo}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(sex)}
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

export default SexesDashboard;
