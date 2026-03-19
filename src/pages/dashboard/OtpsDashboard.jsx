import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as otpsApi from "../../api/otps";
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

const truncateHash = (value) => {
  if (!value) {
    return "-";
  }

  return value.length > 18 ? `${value.slice(0, 18)}...` : value;
};

const OtpsDashboard = () => {
  const { isAdmin } = useAuth();
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredOtps = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return otps;
    }

    return otps.filter((otp) =>
      [
        otp.idCodigoOtp,
        otp.idCuenta,
        otp.usuario,
        otp.tipoOtp,
        otp.codigoHash,
        otp.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [otps, search]);

  const loadOtps = async () => {
    try {
      setLoading(true);
      const data = await otpsApi.getOtps({ force: true });
      setOtps(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los codigos OTP",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Codigos OTP | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadOtps();
  }, [isAdmin]);

  const onDelete = async (otp) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar codigo OTP",
      text: `Se desactivara el OTP #${otp.idCodigoOtp}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(otp.idCodigoOtp);
      await otpsApi.deleteOtp(otp.idCodigoOtp);
      await loadOtps();

      Swal.fire({
        icon: "success",
        title: "Codigo OTP eliminado",
        text: "El codigo OTP fue desactivado correctamente.",
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
          <h1>Codigos OTP</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de codigos OTP</p>
          <h1>Codigos OTP</h1>
          <p className="dashboard-page__lede">
            Administra hashes, cuentas, tipos OTP, fechas e intentos asociados a cada codigo temporal.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/codigos-otp/nuevo">
          Crear codigo OTP
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Este modulo administra el valor almacenado en <strong>CODIGO_HASH</strong>, no el OTP en texto plano.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por id, cuenta, usuario, tipo, hash o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredOtps.length} de {otps.length} codigos OTP
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando codigos OTP...</div>
        ) : filteredOtps.length === 0 ? (
          <div className="dashboard-empty-state">No hay codigos OTP que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID OTP</th>
                  <th>ID cuenta</th>
                  <th>Usuario</th>
                  <th>Tipo OTP</th>
                  <th>Hash</th>
                  <th>Expira</th>
                  <th>Uso</th>
                  <th>Intentos</th>
                  <th>Creado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOtps.map((otp) => {
                  const isDeletingCurrent = deletingId === otp.idCodigoOtp;

                  return (
                    <tr key={otp.idCodigoOtp}>
                      <td>{otp.idCodigoOtp}</td>
                      <td>{otp.idCuenta}</td>
                      <td>{otp.usuario || "-"}</td>
                      <td>{otp.tipoOtp || otp.idTipoOtp}</td>
                      <td title={otp.codigoHash || ""}>{truncateHash(otp.codigoHash)}</td>
                      <td>{formatDateTime(otp.fechaExpiracion)}</td>
                      <td>{formatDateTime(otp.fechaUso)}</td>
                      <td>{otp.intentos}</td>
                      <td>{formatDateTime(otp.fechaCreacion)}</td>
                      <td>{otp.estado || otp.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/codigos-otp/${otp.idCodigoOtp}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(otp)}
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

export default OtpsDashboard;
