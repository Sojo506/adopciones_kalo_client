import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as campaignsApi from "../../api/campaigns";
import { useAuth } from "../../hooks/useAuth";

const imageStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  objectFit: "cover",
  display: "block",
};

const formatDate = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const buildDateRangeLabel = (campaign) => {
  const start = formatDate(campaign.fechaInicio);
  const end = formatDate(campaign.fechaFin);
  return `${start} al ${end}`;
};

const CampaignsDashboard = () => {
  const { isAdmin } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return campaigns;
    }

    return campaigns.filter((campaign) =>
      [
        campaign.idCampania,
        campaign.nombre,
        campaign.descripcion,
        campaign.imageUrl,
        campaign.estado,
        campaign.fechaInicio,
        campaign.fechaFin,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [campaigns, search]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignsApi.getCampaigns({ force: true });
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las campañas",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Campañas | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadCampaigns();
  }, [isAdmin]);

  const onDelete = async (campaign) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar campaña",
      text: `Se desactivara la campaña "${campaign.nombre}".`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(campaign.idCampania);
      await campaignsApi.deleteCampaign(campaign.idCampania);
      await loadCampaigns();

      Swal.fire({
        icon: "success",
        title: "Campaña eliminada",
        text: "La campaña fue desactivada correctamente.",
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
          <h1>Campañas</h1>
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
          <p className="dashboard-page__eyebrow">Gestion de donaciones</p>
          <h1>Campañas</h1>
          <p className="dashboard-page__lede">
            Administra la imagen principal, el nombre, la descripcion, la vigencia y el estado de
            las campañas que apoyan la recaudacion del proyecto.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/campanias/nuevo">
          Crear campaña
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una campaña si todavia tiene donaciones activas asociadas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, nombre, descripcion, fecha o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredCampaigns.length} de {campaigns.length} campañas
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando campañas...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay campañas que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Descripcion</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => {
                  const isDeletingCurrent = deletingId === campaign.idCampania;

                  return (
                    <tr key={campaign.idCampania}>
                      <td>
                        {campaign.imageUrl ? (
                          <a href={campaign.imageUrl} rel="noreferrer" target="_blank">
                            <img
                              alt={`Campaña ${campaign.nombre}`}
                              loading="lazy"
                              src={campaign.imageUrl}
                              style={imageStyle}
                            />
                          </a>
                        ) : (
                          <span className="dashboard-muted">Sin imagen</span>
                        )}
                      </td>
                      <td>{campaign.nombre}</td>
                      <td>{campaign.descripcion || "Sin descripcion"}</td>
                      <td>{buildDateRangeLabel(campaign)}</td>
                      <td>{campaign.estado || campaign.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/campanias/${campaign.idCampania}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(campaign)}
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

export default CampaignsDashboard;
