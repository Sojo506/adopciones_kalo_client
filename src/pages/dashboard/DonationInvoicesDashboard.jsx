import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as donationInvoicesApi from "../../api/donationInvoices";
import { useAuth } from "../../hooks/useAuth";

const amountFormatter = new Intl.NumberFormat("es-CR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (amount, symbol) => {
  const formattedAmount = amountFormatter.format(Number(amount || 0));
  return symbol ? `${symbol} ${formattedAmount}` : formattedAmount;
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const DonationInvoicesDashboard = () => {
  const { isAdmin } = useAuth();
  const [donationInvoices, setDonationInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState(null);
  const [search, setSearch] = useState("");

  const filteredDonationInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return donationInvoices;
    }

    return donationInvoices.filter((donationInvoice) =>
      [
        donationInvoice.idDonacion,
        donationInvoice.identificacion,
        donationInvoice.donador,
        donationInvoice.campania,
        donationInvoice.montoDonacion,
        donationInvoice.fechaDonacion,
        donationInvoice.mensaje,
        donationInvoice.idFactura,
        donationInvoice.moneda,
        donationInvoice.totalFactura,
        donationInvoice.fechaFactura,
        donationInvoice.estado,
      ]
        .filter((value) => value !== null && value !== undefined && value !== "")
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [donationInvoices, search]);

  const loadDonationInvoices = async () => {
    try {
      setLoading(true);
      const data = await donationInvoicesApi.getDonationInvoices({ force: true });
      setDonationInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar las relaciones donacion-factura",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Donaciones-factura | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadDonationInvoices();
  }, [isAdmin]);

  const onDelete = async (donationInvoice) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar relacion donacion-factura",
      text: `Se desactivara la relacion de factura para ${donationInvoice.donador || "la donacion seleccionada"}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    const cacheKey = `${donationInvoice.idDonacion}:${donationInvoice.idFactura}`;

    try {
      setDeletingKey(cacheKey);
      await donationInvoicesApi.deleteDonationInvoice(
        donationInvoice.idDonacion,
        donationInvoice.idFactura,
      );
      await loadDonationInvoices();

      Swal.fire({
        icon: "success",
        title: "Relacion eliminada",
        text: "La relacion donacion-factura fue desactivada correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos eliminar",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setDeletingKey(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-card">
          <p className="dashboard-page__eyebrow">Acceso restringido</p>
          <h1>Donaciones-factura</h1>
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
          <h1>Donaciones-factura</h1>
          <p className="dashboard-page__lede">
            Vincula donaciones con facturas y recalcula el total de la factura asociada.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/donaciones-factura/nuevo">
          Crear relacion
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Las relaciones nuevas siempre inician activas y cada cambio recalcula el total de la
          factura asociada.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingKey !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por donador, campania, monto, fecha o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredDonationInvoices.length} de {donationInvoices.length} relaciones
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando relaciones donacion-factura...</div>
        ) : filteredDonationInvoices.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay relaciones donacion-factura que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Donador</th>
                  <th>Campania</th>
                  <th>Moneda</th>
                  <th>Monto donacion</th>
                  <th>Total factura</th>
                  <th>Fecha factura</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonationInvoices.map((donationInvoice) => {
                  const cacheKey = `${donationInvoice.idDonacion}:${donationInvoice.idFactura}`;
                  const isDeletingCurrent = deletingKey === cacheKey;

                  return (
                    <tr key={cacheKey}>
                      <td>{donationInvoice.donador || donationInvoice.identificacion || "-"}</td>
                      <td>{donationInvoice.campania || "-"}</td>
                      <td>{donationInvoice.moneda || "-"}</td>
                      <td>{formatMoney(donationInvoice.montoDonacion)}</td>
                      <td>{formatMoney(donationInvoice.totalFactura, donationInvoice.simbolo)}</td>
                      <td>{formatDateTime(donationInvoice.fechaFactura) || "-"}</td>
                      <td>{donationInvoice.estado || "-"}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingKey !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingKey !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/donaciones-factura/${donationInvoice.idDonacion}/${donationInvoice.idFactura}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingKey !== null}
                            onClick={() => onDelete(donationInvoice)}
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

export default DonationInvoicesDashboard;
