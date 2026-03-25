import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as fosterHomesApi from "../../api/fosterHomes";
import { useAuth } from "../../hooks/useAuth";

const buildManagerLabel = (fosterHome) => {
  const base = String(fosterHome.identificacion || "-");
  return fosterHome.encargado ? `${base} - ${fosterHome.encargado}` : base;
};

const buildRequestLabel = (fosterHome) => {
  if (!fosterHome?.idSolicitud) {
    return "Sin solicitud";
  }

  return fosterHome.tipoSolicitud
    ? `#${fosterHome.idSolicitud} - ${fosterHome.tipoSolicitud}`
    : `#${fosterHome.idSolicitud}`;
};

const buildAddressLabel = (fosterHome) => {
  const location = [fosterHome.distrito, fosterHome.canton, fosterHome.provincia]
    .filter(Boolean)
    .join(", ");
  const line = [fosterHome.calle, fosterHome.numero].filter(Boolean).join(" ");

  if (line && location) {
    return `${line} - ${location}`;
  }

  return line || location || `Direccion #${fosterHome.idDireccion}`;
};

const FosterHomesDashboard = () => {
  const { isAdmin } = useAuth();
  const [fosterHomes, setFosterHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredFosterHomes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return fosterHomes;
    }

    return fosterHomes.filter((fosterHome) =>
      [
        fosterHome.idCasaCuna,
        fosterHome.nombre,
        fosterHome.identificacion,
        fosterHome.encargado,
        fosterHome.idSolicitud,
        fosterHome.tipoSolicitud,
        fosterHome.distrito,
        fosterHome.canton,
        fosterHome.provincia,
        fosterHome.pais,
        fosterHome.calle,
        fosterHome.numero,
        fosterHome.totalPerritos,
        fosterHome.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [fosterHomes, search]);

  const loadFosterHomes = async () => {
    try {
      setLoading(true);
      const data = await fosterHomesApi.getFosterHomes({ force: true });
      setFosterHomes(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las casas cuna",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Casas cuna | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadFosterHomes();
  }, [isAdmin]);

  const onDelete = async (fosterHome) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar casa cuna",
      text: `Se desactivara la casa cuna "${fosterHome.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(fosterHome.idCasaCuna);
      await fosterHomesApi.deleteFosterHome(fosterHome.idCasaCuna);
      await loadFosterHomes();

      Swal.fire({
        icon: "success",
        title: "Casa cuna eliminada",
        text: "La casa cuna fue desactivada correctamente.",
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
          <h1>Casas cuna</h1>
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
          <p className="dashboard-page__eyebrow">Hogares temporales</p>
          <h1>Casas cuna</h1>
          <p className="dashboard-page__lede">
            Administra las casas cuna, su encargado, la direccion asignada y la solicitud de casa
            cuna cuando exista.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/casas-cuna/nuevo">
          Crear casa cuna
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          La solicitud es opcional, pero si se asigna debe ser de tipo Casa Cuna y no puede
          repetirse en otra casa cuna.
        </div>

        <div className="dashboard-alert">
          No puedes eliminar o desactivar una casa cuna si todavia tiene perritos activos en{" "}
          <Link to="/dashboard/casas-perrito">Casa-perrito</Link>.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, encargado, solicitud, ubicacion, perritos o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredFosterHomes.length} de {fosterHomes.length} casas cuna
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando casas cuna...</div>
        ) : filteredFosterHomes.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay casas cuna que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Encargado</th>
                  <th>Solicitud</th>
                  <th>Direccion</th>
                  <th>Perritos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFosterHomes.map((fosterHome) => {
                  const isDeletingCurrent = deletingId === fosterHome.idCasaCuna;
                  const isInactive = Number(fosterHome.idEstado) !== 1;

                  return (
                    <tr key={fosterHome.idCasaCuna}>
                      <td>{fosterHome.nombre}</td>
                      <td>{buildManagerLabel(fosterHome)}</td>
                      <td>{buildRequestLabel(fosterHome)}</td>
                      <td>{buildAddressLabel(fosterHome)}</td>
                      <td>{fosterHome.totalPerritos}</td>
                      <td>{fosterHome.estado || fosterHome.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/casas-cuna/${fosterHome.idCasaCuna}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={isInactive || deletingId !== null}
                            onClick={() => onDelete(fosterHome)}
                            type="button"
                          >
                            {isDeletingCurrent ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                        {isInactive ? (
                          <small className="dashboard-table__note">Casa cuna ya inactiva</small>
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

export default FosterHomesDashboard;
