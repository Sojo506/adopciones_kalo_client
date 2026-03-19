import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as usersApi from "../../api/users";
import { useAuth } from "../../hooks/useAuth";

const UsersDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const isProtectedUser = (candidate) =>
    isAdmin && Number(candidate?.identificacion) === Number(user?.identificacion);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((currentUser) =>
      [
        currentUser.identificacion,
        currentUser.nombre,
        currentUser.apellidoPaterno,
        currentUser.apellidoMaterno,
        currentUser.tipoUsuario,
        currentUser.cuenta?.usuario,
        currentUser.cuenta?.correo,
        currentUser.direccion?.pais,
        currentUser.direccion?.provincia,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar usuarios",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Usuarios | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadUsers();
  }, [isAdmin]);

  const onDelete = async (targetUser) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar usuario",
      text: `Se desactivara a ${targetUser.nombre} ${targetUser.apellidoPaterno}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(targetUser.identificacion);
      await usersApi.deleteUser(targetUser.identificacion);
      await loadUsers();

      Swal.fire({
        icon: "success",
        title: "Usuario eliminado",
        text: "El usuario fue desactivado correctamente.",
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
          <h1>Usuarios</h1>
          <p className="dashboard-page__lede">
            Solo un administrador puede gestionar usuarios desde esta seccion.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header mt-4">
        <div>
          <p className="dashboard-page__eyebrow">Gestion de usuarios</p>
          <h1>Usuarios</h1>
          <p className="dashboard-page__lede">
            Todos los usuarios se muestran en una tabla y el formulario vive en su propia pagina.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/usuarios/nuevo">
          Crear usuario
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, usuario, correo, rol o ubicacion"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredUsers.length} de {users.length} usuarios
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando usuarios...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="dashboard-empty-state">No hay usuarios que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Identificacion</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Tipo usuario</th>
                  <th>Estado</th>
                  <th>Ubicacion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((currentUser) => {
                  const fullName = [
                    currentUser.nombre,
                    currentUser.apellidoPaterno,
                    currentUser.apellidoMaterno,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const protectedUser = isProtectedUser(currentUser);
                  const isDeletingCurrent = deletingId === currentUser.identificacion;

                  return (
                    <tr key={currentUser.identificacion}>
                      <td>{currentUser.identificacion}</td>
                      <td>{fullName}</td>
                      <td>{currentUser.cuenta?.usuario || "-"}</td>
                      <td>{currentUser.cuenta?.correo || "-"}</td>
                      <td>{currentUser.tipoUsuario || "-"}</td>
                      <td>{currentUser.estado || currentUser.idEstado}</td>
                      <td>
                        {[currentUser.direccion?.pais, currentUser.direccion?.provincia, currentUser.direccion?.distrito]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${protectedUser || deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (protectedUser || deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/usuarios/${currentUser.identificacion}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={protectedUser || deletingId !== null}
                            onClick={() => onDelete(currentUser)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {protectedUser ? (
                          <small className="dashboard-table__note">Admin en sesion protegido</small>
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

export default UsersDashboard;
