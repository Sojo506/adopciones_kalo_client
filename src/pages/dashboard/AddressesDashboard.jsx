import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as addressesApi from "../../api/addresses";
import { useAuth } from "../../hooks/useAuth";

const AddressesDashboard = () => {
  const { isAdmin } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredAddresses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return addresses;
    }

    return addresses.filter((address) =>
      [
        address.idDireccion,
        address.pais,
        address.provincia,
        address.canton,
        address.distrito,
        address.calle,
        address.numero,
        address.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [addresses, search]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressesApi.getAddresses({ force: true });
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las direcciones",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Direcciones | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadAddresses();
  }, [isAdmin]);

  const onDelete = async (address) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar direccion",
      text: "Se desactivara la direccion seleccionada.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(address.idDireccion);
      await addressesApi.deleteAddress(address.idDireccion);
      await loadAddresses();

      Swal.fire({
        icon: "success",
        title: "Direccion eliminada",
        text: "La direccion fue desactivada correctamente.",
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
          <h1>Direcciones</h1>
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
          <p className="dashboard-page__eyebrow">Ubicaciones y direcciones</p>
          <h1>Direcciones</h1>
          <p className="dashboard-page__lede">
            Administra direcciones detalladas para usuarios y casas cuna sin salir del panel.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/direcciones/nuevo">
          Crear direccion
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          El sistema no permite desactivar ni eliminar una direccion si sigue asignada a usuarios o casas cuna activas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por jerarquia, calle, numero o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredAddresses.length} de {addresses.length} direcciones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando direcciones...</div>
        ) : filteredAddresses.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay direcciones que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Pais</th>
                  <th>Provincia</th>
                  <th>Canton</th>
                  <th>Distrito</th>
                  <th>Calle</th>
                  <th>Numero</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAddresses.map((address) => {
                  const isDeletingCurrent = deletingId === address.idDireccion;
                  const isInactive = Number(address.idEstado) !== 1;

                  return (
                    <tr key={address.idDireccion}>
                      <td>{address.pais || "Pais relacionado"}</td>
                      <td>{address.provincia || "Provincia relacionada"}</td>
                      <td>{address.canton || "Canton relacionado"}</td>
                      <td>{address.distrito || "Distrito relacionado"}</td>
                      <td>{address.calle || "Sin calle"}</td>
                      <td>{address.numero || "Sin numero"}</td>
                      <td>{address.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/direcciones/${address.idDireccion}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(address)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Direccion ya inactiva</small>
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

export default AddressesDashboard;
