import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as provincesApi from "../../api/provinces";
import { useAuth } from "../../hooks/useAuth";

const ProvincesDashboard = () => {
  const { isAdmin } = useAuth();
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredProvinces = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return provinces;
    }

    return provinces.filter((province) =>
      [province.idProvincia, province.nombre, province.pais, province.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [provinces, search]);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const data = await provincesApi.getProvinces({ force: true });
      setProvinces(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las provincias",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Provincias | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadProvinces();
  }, [isAdmin]);

  const onDelete = async (province) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar provincia",
      text: `Se desactivara la provincia "${province.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(province.idProvincia);
      await provincesApi.deleteProvince(province.idProvincia);
      await loadProvinces();

      Swal.fire({
        icon: "success",
        title: "Provincia eliminada",
        text: "La provincia fue desactivada correctamente.",
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
          <h1>Provincias</h1>
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
          <h1>Provincias</h1>
          <p className="dashboard-page__lede">
            Administra las provincias enlazadas a cada pais y su disponibilidad operativa.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/provincias/nuevo">
          Crear provincia
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El sistema no permite desactivar ni mover una provincia si todavia tiene cantones activos.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre, pais o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredProvinces.length} de {provinces.length} provincias
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando provincias...</div>
        ) : filteredProvinces.length === 0 ? (
          <div className="dashboard-empty-state">No hay provincias que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Pais</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProvinces.map((province) => {
                  const isDeletingCurrent = deletingId === province.idProvincia;
                  const isInactive = Number(province.idEstado) !== 1;

                  return (
                    <tr key={province.idProvincia}>
                      <td>{province.nombre}</td>
                      <td>{province.pais || province.idPais}</td>
                      <td>{province.estado || province.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/provincias/${province.idProvincia}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(province)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Provincia ya inactiva</small>
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

export default ProvincesDashboard;
