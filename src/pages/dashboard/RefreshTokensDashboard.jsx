import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as refreshTokensApi from "../../api/refreshTokens";
import { useAuth } from "../../hooks/useAuth";

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("es-CR");
};

const truncateText = (value, maxLength = 18) => {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

const RefreshTokensDashboard = () => {
  const { isAdmin } = useAuth();
  const [refreshTokens, setRefreshTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredRefreshTokens = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return refreshTokens;
    }

    return refreshTokens.filter((refreshToken) =>
      [
        refreshToken.idRefreshToken,
        refreshToken.idCuenta,
        refreshToken.usuario,
        refreshToken.jti,
        refreshToken.ipAddress,
        refreshToken.userAgent,
        refreshToken.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [refreshTokens, search]);

  const loadRefreshTokens = async () => {
    try {
      setLoading(true);
      const data = await refreshTokensApi.getRefreshTokens({ force: true });
      setRefreshTokens(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los refresh tokens",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Refresh tokens | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadRefreshTokens();
  }, [isAdmin]);

  const onDelete = async (refreshToken) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar refresh token",
      text: `Se desactivara el refresh token #${refreshToken.idRefreshToken}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(refreshToken.idRefreshToken);
      await refreshTokensApi.deleteRefreshToken(refreshToken.idRefreshToken);
      await loadRefreshTokens();

      Swal.fire({
        icon: "success",
        title: "Refresh token eliminado",
        text: "El refresh token fue desactivado correctamente.",
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
          <h1>Refresh tokens</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de refresh tokens</p>
          <h1>Refresh tokens</h1>
          <p className="dashboard-page__lede">
            Administra sesiones persistentes, revocaciones y metadatos tecnicos asociados a cada cuenta.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/refresh-tokens/nuevo">
          Crear refresh token
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Este modulo administra el valor almacenado en <strong>TOKEN_HASH</strong>, no el token plano.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por id, cuenta, usuario, jti, ip, agente o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredRefreshTokens.length} de {refreshTokens.length} refresh tokens
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando refresh tokens...</div>
        ) : filteredRefreshTokens.length === 0 ? (
          <div className="dashboard-empty-state">No hay refresh tokens que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cuenta</th>
                  <th>Usuario</th>
                  <th>JTI</th>
                  <th>Token hash</th>
                  <th>IP</th>
                  <th>User agent</th>
                  <th>Expira</th>
                  <th>Revocado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefreshTokens.map((refreshToken) => {
                  const isDeletingCurrent = deletingId === refreshToken.idRefreshToken;

                  return (
                    <tr key={refreshToken.idRefreshToken}>
                      <td>{refreshToken.idRefreshToken}</td>
                      <td>{refreshToken.idCuenta}</td>
                      <td>{refreshToken.usuario || "-"}</td>
                      <td title={refreshToken.jti || ""}>{truncateText(refreshToken.jti, 18)}</td>
                      <td title={refreshToken.tokenHash || ""}>{truncateText(refreshToken.tokenHash, 18)}</td>
                      <td title={refreshToken.ipAddress || ""}>{truncateText(refreshToken.ipAddress, 16)}</td>
                      <td title={refreshToken.userAgent || ""}>{truncateText(refreshToken.userAgent, 24)}</td>
                      <td>{formatDateTime(refreshToken.fechaExpiracion)}</td>
                      <td>{formatDateTime(refreshToken.fechaRevocacion)}</td>
                      <td>{refreshToken.estado || refreshToken.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/refresh-tokens/${refreshToken.idRefreshToken}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(refreshToken)}
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

export default RefreshTokensDashboard;
