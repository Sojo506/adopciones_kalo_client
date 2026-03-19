import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as userTypesApi from "../../api/userTypes";
import { useAuth } from "../../hooks/useAuth";

const RESERVED_USER_TYPE_IDS = new Set([1, 2]);
const RESERVED_USER_TYPE_NAMES = new Set(["administrador", "cliente"]);

const isReservedUserType = (userType) =>
  RESERVED_USER_TYPE_IDS.has(Number(userType?.idTipoUsuario)) ||
  RESERVED_USER_TYPE_NAMES.has(String(userType?.nombre || "").trim().toLowerCase());

const UserTypesDashboard = () => {
  const { isAdmin } = useAuth();
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredUserTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return userTypes;
    }

    return userTypes.filter((userType) =>
      [userType.idTipoUsuario, userType.nombre, userType.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, userTypes]);

  const loadUserTypes = async () => {
    try {
      setLoading(true);
      const data = await userTypesApi.getUserTypes({ force: true });
      setUserTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los tipos de usuario",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Tipos de usuario | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadUserTypes();
  }, [isAdmin]);

  const onDelete = async (userType) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar tipo de usuario",
      text: `Se desactivara el tipo "${userType.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(userType.idTipoUsuario);
      await userTypesApi.deleteUserType(userType.idTipoUsuario);
      await loadUserTypes();

      Swal.fire({
        icon: "success",
        title: "Tipo eliminado",
        text: "El tipo de usuario fue desactivado correctamente.",
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
          <h1>Tipos de usuario</h1>
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
          <h1>Tipos de usuario</h1>
          <p className="dashboard-page__lede">
            Administra los roles disponibles y su estado operativo dentro del sistema.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/tipos-usuario/nuevo">
          Crear tipo
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredUserTypes.length} de {userTypes.length} tipos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando tipos de usuario...</div>
        ) : filteredUserTypes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay tipos de usuario que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUserTypes.map((userType) => {
                  const reservedUserType = isReservedUserType(userType);
                  const isDeletingCurrent = deletingId === userType.idTipoUsuario;

                  return (
                    <tr key={userType.idTipoUsuario}>
                      <td>{userType.idTipoUsuario}</td>
                      <td>{userType.nombre}</td>
                      <td>{userType.estado || userType.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/tipos-usuario/${userType.idTipoUsuario}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={reservedUserType || deletingId !== null}
                            onClick={() => onDelete(userType)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {reservedUserType ? (
                          <small className="dashboard-table__note">Rol base protegido</small>
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

export default UserTypesDashboard;
