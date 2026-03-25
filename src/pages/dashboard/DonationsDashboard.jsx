import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as donationsApi from "../../api/donations";
import { useAuth } from "../../hooks/useAuth";

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAmount = (value) => amountFormatter.format(Number(value || 0));

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

const DonationsDashboard = () => {
  const { isAdmin } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredDonations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return donations;
    }

    return donations.filter((donation) =>
      [
        donation.idDonacion,
        donation.identificacion,
        donation.donador,
        donation.idCampania,
        donation.campania,
        donation.monto,
        donation.fechaDonacion,
        donation.mensaje,
        donation.estado,
      ]
        .filter((value) => value !== null && value !== undefined && value !== "")
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [donations, search]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await donationsApi.getDonations({ force: true });
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las donaciones",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Donaciones | Dashboard Kalö";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadDonations();
  }, [isAdmin]);

  const onDelete = async (donation) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar donacion",
      text: `Se desactivara la donacion #${donation.idDonacion}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(donation.idDonacion);
      await donationsApi.deleteDonation(donation.idDonacion);
      await loadDonations();

      Swal.fire({
        icon: "success",
        title: "Donacion eliminada",
        text: "La donacion fue desactivada correctamente.",
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
          <h1>Donaciones</h1>
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
          <h1>Donaciones</h1>
          <p className="dashboard-page__lede">
            Administra aportes economicos por usuario, campania, monto, fecha, mensaje y estado.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/donaciones/nuevo">
          Crear donacion
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          No puedes eliminar una donacion si todavia tiene facturas activas asociadas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, donador, identificacion, campania, monto, fecha, mensaje o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredDonations.length} de {donations.length} donaciones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando donaciones...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="dashboard-empty-state">No hay donaciones que coincidan con tu busqueda.</div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Identificacion</th>
                  <th>Donador</th>
                  <th>Campania</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Mensaje</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => {
                  const isDeletingCurrent = deletingId === donation.idDonacion;

                  return (
                    <tr key={donation.idDonacion}>
                      <td>{donation.identificacion}</td>
                      <td>{donation.donador || "-"}</td>
                      <td>{donation.campania || donation.idCampania}</td>
                      <td>{formatAmount(donation.monto)}</td>
                      <td>{formatDate(donation.fechaDonacion)}</td>
                      <td>{donation.mensaje || "Sin mensaje"}</td>
                      <td>{donation.estado || donation.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/donaciones/${donation.idDonacion}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(donation)}
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

export default DonationsDashboard;
