import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as districtsApi from "../../api/districts";
import { useAuth } from "../../hooks/useAuth";

const DistrictsDashboard = () => {
  const { isAdmin } = useAuth();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredDistricts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return districts;
    }

    return districts.filter((district) =>
      [district.idDistrito, district.nombre, district.canton, district.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [districts, search]);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await districtsApi.getDistricts({ force: true });
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los distritos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Distritos | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadDistricts();
  }, [isAdmin]);

  const onDelete = async (district) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar distrito",
      text: `Se desactivara el distrito "${district.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(district.idDistrito);
      await districtsApi.deleteDistrict(district.idDistrito);
      await loadDistricts();

      Swal.fire({
        icon: "success",
        title: "Distrito eliminado",
        text: "El distrito fue desactivado correctamente.",
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
          <h1>Distritos</h1>
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
          <h1>Distritos</h1>
          <p className="dashboard-page__lede">
            Administra los distritos enlazados a cada canton y su disponibilidad operativa.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/distritos/nuevo">
          Crear distrito
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El sistema no permite desactivar ni mover un distrito si todavia tiene direcciones activas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, canton o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredDistricts.length} de {districts.length} distritos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando distritos...</div>
        ) : filteredDistricts.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay distritos que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Canton</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistricts.map((district) => {
                  const isDeletingCurrent = deletingId === district.idDistrito;
                  const isInactive = Number(district.idEstado) !== 1;

                  return (
                    <tr key={district.idDistrito}>
                      <td>{district.nombre}</td>
                      <td>{district.canton || "Canton relacionado"}</td>
                      <td>{district.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/distritos/${district.idDistrito}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(district)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Distrito ya inactivo</small>
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

export default DistrictsDashboard;
