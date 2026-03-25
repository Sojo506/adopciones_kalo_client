import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as accountsApi from "../../api/accounts";
import { useAuth } from "../../hooks/useAuth";

const AccountsDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const isProtectedAccount = (account) =>
    isAdmin && Number(account?.identificacion) === Number(user?.identificacion);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return accounts;
    }

    return accounts.filter((account) =>
      [
        account.idCuenta,
        account.identificacion,
        account.usuarioNombre,
        account.usuario,
        account.estado,
        account.tipoUsuario,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [accounts, search]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountsApi.getAccounts({ force: true });
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las cuentas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Cuentas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadAccounts();
  }, [isAdmin]);

  const onDelete = async (account) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar cuenta",
      text: `Se desactivara la cuenta "${account.usuario}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(account.idCuenta);
      await accountsApi.deleteAccount(account.idCuenta);
      await loadAccounts();

      Swal.fire({
        icon: "success",
        title: "Cuenta eliminada",
        text: "La cuenta fue desactivada correctamente.",
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
          <h1>Cuentas</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de cuentas</p>
          <h1>Cuentas</h1>
          <p className="dashboard-page__lede">
            Administra nombres de usuario, estado general y relacion de acceso con cada perfil.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/cuentas/nuevo">
          Crear cuenta
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por id, usuario, nombre o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredAccounts.length} de {accounts.length} cuentas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando cuentas...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="dashboard-empty-state">No hay cuentas que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Identificacion</th>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => {
                  const protectedAccount = isProtectedAccount(account);
                  const isDeletingCurrent = deletingId === account.idCuenta;

                  return (
                    <tr key={account.idCuenta}>
                      <td>{account.identificacion}</td>
                      <td>{account.usuario}</td>
                      <td>{account.usuarioNombre || "-"}</td>
                      <td>{account.estado || account.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${protectedAccount || deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (protectedAccount || deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/cuentas/${account.idCuenta}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={protectedAccount || deletingId !== null}
                            onClick={() => onDelete(account)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {protectedAccount ? (
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

export default AccountsDashboard;
