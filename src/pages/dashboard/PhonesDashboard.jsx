import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as phonesApi from "../../api/phones";
import { useAuth } from "../../hooks/useAuth";

const PhonesDashboard = () => {
  const { isAdmin } = useAuth();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [search, setSearch] = useState("");

  const filteredPhones = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return phones;
    }

    return phones.filter((phone) =>
      [phone.identificacion, phone.usuario, phone.telefono, phone.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [phones, search]);

  const loadPhones = async () => {
    try {
      setLoading(true);
      const data = await phonesApi.getPhones({ force: true });
      setPhones(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los telefonos",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Telefonos | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadPhones();
  }, [isAdmin]);

  const onDelete = async (phone) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar telefono",
      text: `Se desactivara el telefono "${phone.telefono}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    const cacheKey = `${phone.identificacion}:${phone.telefono}`;

    try {
      setDeletingKey(cacheKey);
      await phonesApi.deletePhone(phone.identificacion, phone.telefono);
      await loadPhones();

      Swal.fire({
        icon: "success",
        title: "Telefono eliminado",
        text: "El telefono fue desactivado correctamente.",
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
          <h1>Telefonos</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de telefonos</p>
          <h1>Telefonos</h1>
          <p className="dashboard-page__lede">
            Administra numeros de telefono asociados a usuarios y su estado dentro del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/telefonos/nuevo">
          Crear telefono
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingKey !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por identificacion, usuario, telefono o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredPhones.length} de {phones.length} telefonos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando telefonos...</div>
        ) : filteredPhones.length === 0 ? (
          <div className="dashboard-empty-state">No hay telefonos que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Identificacion</th>
                  <th>Usuario</th>
                  <th>Telefono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPhones.map((phone) => {
                  const cacheKey = `${phone.identificacion}:${phone.telefono}`;
                  const isDeletingCurrent = deletingKey === cacheKey;

                  return (
                    <tr key={cacheKey}>
                      <td>{phone.identificacion}</td>
                      <td>{phone.usuario || "-"}</td>
                      <td>{phone.telefono}</td>
                      <td>{phone.estado || phone.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingKey !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingKey !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/telefonos/${phone.identificacion}/${encodeURIComponent(phone.telefono)}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingKey !== null}
                            onClick={() => onDelete(phone)}
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

export default PhonesDashboard;
