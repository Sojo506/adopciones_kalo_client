import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getActiveCampaigns } from "../../api/campaigns";
import PayPalProvider, { isPayPalConfigured } from "../../components/payments/PayPalProvider";
import { capturePayPalOrder, createPayPalOrder } from "../../api/paypalCheckout";
import { useAuth } from "../../hooks/useAuth";

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "Sin fecha";
  }
};

// Renders PayPal buttons and handles the SDK loading state
const PayPalCheckout = ({ campaign, amount, message, onSuccess, onCancel }) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <div className="campaign-paypal-error">
        No se pudo cargar PayPal. Verifica tu conexion e intenta nuevamente.
      </div>
    );
  }

  if (isPending) {
    return <div className="campaign-paypal-loading">Cargando PayPal...</div>;
  }

  return (
    <PayPalButtons
      style={{ layout: "vertical", shape: "rect", color: "gold", label: "donate" }}
      forceReRender={[amount, campaign.idCampania]}
      createOrder={async () => {
        const { orderId } = await createPayPalOrder({
          idCampania: campaign.idCampania,
          monto: amount,
        });
        return orderId;
      }}
      onApprove={async (data) => {
        try {
          const donation = await capturePayPalOrder({
            orderId: data.orderID,
            idCampania: campaign.idCampania,
            monto: amount,
            mensaje: message || null,
          });
          onSuccess(donation);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "No se pudo registrar la donacion",
            text:
              err?.response?.data?.message ||
              "El pago fue procesado pero no pudimos registrar la donacion. Contacta al equipo de Kalo.",
          });
        }
      }}
      onError={() => {
        Swal.fire({
          icon: "error",
          title: "Error en el pago",
          text: "Hubo un problema al procesar tu pago con PayPal. Intenta nuevamente.",
        });
      }}
      onCancel={onCancel}
    />
  );
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Donation modal state
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // 1 = form, 2 = paypal buttons

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    document.title = "Campañas | Adopciones Kalö";
  }, []);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const next = await getActiveCampaigns();

        if (!ignore) {
          setCampaigns(Array.isArray(next) ? next : []);
        }
      } catch {
        if (!ignore) {
          setError("No pudimos cargar las campañas. Intenta nuevamente en unos segundos.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const openModal = (campaign) => {
    setSelectedCampaign(campaign);
    setAmount("");
    setMessage("");
    setStep(1);
  };

  const closeModal = () => {
    setSelectedCampaign(null);
    setAmount("");
    setMessage("");
    setStep(1);
  };

  const handleDonar = (campaign) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Necesitas una cuenta",
        html: `Para donar a <strong>${campaign.nombre}</strong> necesitas iniciar sesion o crear una cuenta.`,
        showCancelButton: true,
        confirmButtonText: "Iniciar sesion",
        cancelButtonText: "Crear cuenta",
        confirmButtonColor: "#11253d",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = "/signup";
        }
      });
      return;
    }

    openModal(campaign);
  };

  const handleContinueToPayPal = (e) => {
    e.preventDefault();
    const parsed = Number(amount);

    if (!parsed || parsed <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Monto invalido",
        text: "Ingresa un monto mayor a 0.",
      });
      return;
    }

    setStep(2);
  };

  const handlePayPalSuccess = (donation) => {
    const campaignName = selectedCampaign?.nombre;
    closeModal();

    Swal.fire({
      icon: "success",
      title: "Donacion completada",
      text: `Tu donacion para "${campaignName}" fue procesada exitosamente. Gracias por tu apoyo.`,
    });
  };

  return (
    <section className="campaign-page">
      <div className="container campaign-shell">

        <section className="campaign-hero">
          <div>
            <span className="campaign-pill">Campañas</span>
            <h1>Apoya nuestras <em className="hero-highlight">campañas</em> y ayuda a mas perritos.</h1>
            <p>
              Cada donacion contribuye directamente al rescate, atencion veterinaria y
              bienestar de los perritos de Kalo mientras esperan un hogar.
            </p>
          </div>

          <div className="campaign-hero__aside">
            <article>
              <strong>{campaigns.length}</strong>
              <span>Campañas activas</span>
            </article>
            <article>
              <strong>{isAuthenticated ? "Lista" : "Requiere cuenta"}</strong>
              <span>{isAuthenticated ? "Sesion activa" : "Para donar"}</span>
            </article>
          </div>
        </section>

        {!isAuthenticated && (
          <div className="campaign-auth-banner">
            <strong>Crea una cuenta para poder donar</strong>
            <span>
              Las donaciones quedan asociadas a tu cuenta para darte seguimiento y agradecerte
              por tu apoyo.
            </span>
            <div className="campaign-auth-banner__actions">
              <Link className="home-btn home-btn--primary" to="/login">
                Iniciar sesion
              </Link>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/signup">
                Crear cuenta
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="campaign-empty">Cargando campañas...</div>
        ) : error ? (
          <div className="campaign-empty campaign-empty--error">{error}</div>
        ) : !campaigns.length ? (
          <div className="campaign-empty">No hay campañas activas en este momento.</div>
        ) : (
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <div key={campaign.idCampania} className="campaign-card">
                <div
                  className="campaign-card__image"
                  style={{
                    backgroundImage: campaign.imageUrl
                      ? `linear-gradient(180deg, rgba(9, 18, 29, 0.06), rgba(9, 18, 29, 0.44)), url("${campaign.imageUrl}")`
                      : undefined,
                  }}
                />
                <div className="campaign-card__body">
                  <h3>{campaign.nombre}</h3>
                  {campaign.descripcion && (
                    <p className="campaign-card__desc">{campaign.descripcion}</p>
                  )}
                  <div className="campaign-card__dates">
                    <span>{formatDate(campaign.fechaInicio)}</span>
                    <span className="campaign-card__dates-sep">–</span>
                    <span>{formatDate(campaign.fechaFin)}</span>
                  </div>
                </div>
                <div className="campaign-card__footer">
                  <button
                    className="campaign-btn"
                    type="button"
                    onClick={() => handleDonar(campaign)}
                  >
                    Donar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Donation modal */}
        {selectedCampaign && (
          <div
            className="campaign-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={step === 1 ? closeModal : undefined}
          >
            <div className="campaign-modal" onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="campaign-modal__header">
                <div>
                  <p className="campaign-modal__eyebrow">
                    {step === 1 ? "Donacion" : "Pago con PayPal"}
                  </p>
                  <h2>{selectedCampaign.nombre}</h2>
                </div>
                {step === 1 && (
                  <button
                    className="campaign-modal__close"
                    type="button"
                    onClick={closeModal}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Step 1 — amount & message form */}
              {step === 1 && (
                <form className="campaign-modal__form" onSubmit={handleContinueToPayPal}>
                  <div className="campaign-modal__field">
                    <label htmlFor="donation-amount">Monto (USD)</label>
                    <input
                      id="donation-amount"
                      className="form-control"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Ej. 10.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="campaign-modal__field">
                    <label htmlFor="donation-message">Mensaje (opcional)</label>
                    <textarea
                      id="donation-message"
                      className="form-control"
                      rows="3"
                      maxLength="500"
                      placeholder="Quieres dejar un mensaje de apoyo?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {user && (
                    <div className="campaign-modal__user">
                      <strong>
                        {[user?.nombre, user?.apellidoPaterno].filter(Boolean).join(" ") ||
                          user?.usuario}
                      </strong>
                      <span>La donacion se asociara a tu cuenta.</span>
                    </div>
                  )}

                  <div className="campaign-modal__actions">
                    <button
                      className="campaign-modal__cancel"
                      type="button"
                      onClick={closeModal}
                    >
                      Cancelar
                    </button>
                    <button className="campaign-btn" type="submit">
                      Continuar con PayPal
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2 — PayPal buttons */}
              {step === 2 && (
                <div className="campaign-modal__form">
                  <div className="campaign-modal__paypal-summary">
                    <span>Monto</span>
                    <strong>USD {Number(amount).toFixed(2)}</strong>
                  </div>

                  {message && (
                    <div className="campaign-modal__paypal-summary">
                      <span>Mensaje</span>
                      <strong>{message}</strong>
                    </div>
                  )}

                  <div className="campaign-modal__paypal-wrap">
                    {isPayPalConfigured ? (
                      <PayPalProvider>
                        <PayPalCheckout
                          campaign={selectedCampaign}
                          amount={Number(amount)}
                          message={message}
                          onSuccess={handlePayPalSuccess}
                          onCancel={() => setStep(1)}
                        />
                      </PayPalProvider>
                    ) : (
                      <div className="campaign-paypal-error">
                        PayPal no esta configurado en este ambiente.
                      </div>
                    )}
                  </div>

                  <button
                    className="campaign-modal__cancel"
                    type="button"
                    onClick={() => setStep(1)}
                    style={{ marginTop: "0.5rem", width: "100%" }}
                  >
                    Volver y editar monto
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignsPage;
