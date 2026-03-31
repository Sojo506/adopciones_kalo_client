import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as otpTypesApi from "../../api/otpTypes";
import { useAuth } from "../../hooks/useAuth";

const OtpTypesDashboard = () => {
  const { isAdmin } = useAuth();
  const [otpTypes, setOtpTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredOtpTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return otpTypes;
    }

    return otpTypes.filter((otpType) =>
      [otpType.idTipoOtp, otpType.nombre, otpType.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [otpTypes, search]);

  const loadOtpTypes = async () => {
    try {
      setLoading(true);
      const data = await otpTypesApi.getOtpTypes({ force: true });
      setOtpTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los tipos OTP",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Tipos de OTP | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadOtpTypes();
  }, [isAdmin]);

  const onDelete = async (otpType) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar tipo OTP",
      text: `Se desactivara el tipo "${otpType.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(otpType.idTipoOtp);
      await otpTypesApi.deleteOtpType(otpType.idTipoOtp);
      await loadOtpTypes();

      Swal.fire({
        icon: "success",
        title: "Tipo OTP eliminado",
        text: "El tipo OTP fue desactivado correctamente.",
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
          <h1>Tipos de OTP</h1>
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
          <h1>Tipos de OTP</h1>
          <p className="dashboard-page__lede">
            Administra las categorias de codigos temporales disponibles para autenticacion y validacion.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/tipos-otp/nuevo">
          Crear tipo OTP
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Al desactivar un tipo OTP deja de aparecer en catalogos activos, pero los codigos ya emitidos
          conservan la referencia historica.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredOtpTypes.length} de {otpTypes.length} tipos OTP
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando tipos OTP...</div>
        ) : filteredOtpTypes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay tipos OTP que coincidan con tu busqueda.
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
                {filteredOtpTypes.map((otpType) => {
                  const isDeletingCurrent = deletingId === otpType.idTipoOtp;

                  return (
                    <tr key={otpType.idTipoOtp}>
                      <td>{otpType.nombre}</td>
                      <td>{otpType.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/tipos-otp/${otpType.idTipoOtp}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(otpType)}
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

export default OtpTypesDashboard;
