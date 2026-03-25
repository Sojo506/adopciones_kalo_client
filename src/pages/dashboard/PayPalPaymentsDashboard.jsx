import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as paypalPaymentsApi from "../../api/paypalPayments";
import { useAuth } from "../../hooks/useAuth";

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

const PayPalPaymentsDashboard = () => {
  const { isAdmin } = useAuth();
  const [paypalPayments, setPayPalPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredPayPalPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return paypalPayments;
    }

    return paypalPayments.filter((paypalPayment) =>
      [
        paypalPayment.idPago,
        paypalPayment.idFactura,
        paypalPayment.paypalOrderId,
        paypalPayment.paypalCaptureId,
        paypalPayment.fechaPago,
        paypalPayment.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [paypalPayments, search]);

  const loadPayPalPayments = async () => {
    try {
      setLoading(true);
      const data = await paypalPaymentsApi.getPayPalPayments({ force: true });
      setPayPalPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos cargar los pagos PayPal",
        text: error?.response?.data?.message || "Intenta nuevamente en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Pagos PayPal | Dashboard Kalo";
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadPayPalPayments();
  }, [isAdmin]);

  const onDelete = async (paypalPayment) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar pago PayPal",
      text: `Se desactivara el pago #${paypalPayment.idPago}.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(paypalPayment.idPago);
      await paypalPaymentsApi.deletePayPalPayment(paypalPayment.idPago);
      await loadPayPalPayments();

      Swal.fire({
        icon: "success",
        title: "Pago eliminado",
        text: "El pago PayPal fue desactivado correctamente.",
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
          <h1>Pagos PayPal</h1>
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
          <p className="dashboard-page__eyebrow">Gestion comercial</p>
          <h1>Pagos PayPal</h1>
          <p className="dashboard-page__lede">
            Administra referencias de orden, captura y fecha de pago asociadas a cada factura.
          </p>
        </div>
        <Link className="dashboard-btn dashboard-btn--primary" to="/dashboard/pagos-paypal/nuevo">
          Crear pago
        </Link>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-alert">
          Los pagos nuevos siempre inician activos por trigger. Si una factura tiene pagos PayPal
          activos, no podra desactivarse desde el modulo de facturas.
        </div>

        <div className="dashboard-toolbar dashboard-toolbar--between">
          <input
            className="form-control dashboard-search"
            disabled={loading || deletingId !== null}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por ID, factura, orden, captura, fecha o estado"
            value={search}
          />
          <span className="dashboard-muted">
            {filteredPayPalPayments.length} de {paypalPayments.length} pagos
          </span>
        </div>

        {loading ? (
          <div className="dashboard-empty-state">Cargando pagos PayPal...</div>
        ) : filteredPayPalPayments.length === 0 ? (
          <div className="dashboard-empty-state">
            No hay pagos PayPal que coincidan con tu busqueda.
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>PayPal order ID</th>
                  <th>PayPal capture ID</th>
                  <th>Fecha de pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayPalPayments.map((paypalPayment) => {
                  const isDeletingCurrent = deletingId === paypalPayment.idPago;

                  return (
                    <tr key={paypalPayment.idPago}>
                      <td>{paypalPayment.idFactura}</td>
                      <td>{paypalPayment.paypalOrderId || "-"}</td>
                      <td>{paypalPayment.paypalCaptureId || "-"}</td>
                      <td>{formatDateTime(paypalPayment.fechaPago)}</td>
                      <td>{paypalPayment.estado || paypalPayment.idEstado}</td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Link
                            className={`dashboard-btn dashboard-btn--ghost${deletingId !== null ? " is-disabled" : ""}`}
                            onClick={(event) => {
                              if (deletingId !== null) {
                                event.preventDefault();
                              }
                            }}
                            to={`/dashboard/pagos-paypal/${paypalPayment.idPago}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="dashboard-btn dashboard-btn--danger"
                            disabled={deletingId !== null}
                            onClick={() => onDelete(paypalPayment)}
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

export default PayPalPaymentsDashboard;
