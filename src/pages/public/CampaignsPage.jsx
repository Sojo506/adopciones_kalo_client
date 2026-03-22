import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getActiveCampaigns } from "../../api/campaigns";
import { createPublicDonation } from "../../api/donations";
import { useAuth } from "../../hooks/useAuth";

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "Sin fecha";
  }
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [donating, setDonating] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    document.title = "Campanas | Adopciones Kalo";
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
          setError("No pudimos cargar las campanas. Intenta nuevamente en unos segundos.");
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

    setSelectedCampaign(campaign);
    setAmount("");
    setMessage("");
  };

  const handleCloseModal = () => {
    if (donating) return;
    setSelectedCampaign(null);
    setAmount("");
    setMessage("");
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();

    if (donating) return;

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Monto invalido",
        text: "Ingresa un monto mayor a 0.",
      });
      return;
    }

    const campaignName = selectedCampaign.nombre;

    try {
      setDonating(true);

      await createPublicDonation({
        idCampania: selectedCampaign.idCampania,
        monto: parsedAmount,
        mensaje: message.trim() || null,
      });

      setSelectedCampaign(null);

      Swal.fire({
        icon: "success",
        title: "Donacion registrada",
        text: `Tu donacion para "${campaignName}" fue registrada exitosamente. Gracias por tu apoyo.`,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No pudimos registrar la donacion",
        text: err?.response?.data?.message || "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setDonating(false);
    }
  };

  return (
    <section className="campaign-page">
      <div className="container campaign-shell">

        <section className="campaign-hero">
          <div>
            <span className="campaign-pill">Campanas</span>
            <h1>Apoya nuestras <em className="hero-highlight">campanas</em> y ayuda a mas perritos.</h1>
            <p>
              Cada donacion contribuye directamente al rescate, atencion veterinaria y
              bienestar de los perritos de Kalo mientras esperan un hogar.
            </p>
          </div>

          <div className="campaign-hero__aside">
            <article>
              <strong>{campaigns.length}</strong>
              <span>Campanas activas</span>
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
          <div className="campaign-empty">Cargando campanas...</div>
        ) : error ? (
          <div className="campaign-empty campaign-empty--error">{error}</div>
        ) : !campaigns.length ? (
          <div className="campaign-empty">No hay campanas activas en este momento.</div>
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

        {selectedCampaign && (
          <div
            className="campaign-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={handleCloseModal}
          >
            <div className="campaign-modal" onClick={(e) => e.stopPropagation()}>
              <div className="campaign-modal__header">
                <div>
                  <p className="campaign-modal__eyebrow">Donacion</p>
                  <h2>{selectedCampaign.nombre}</h2>
                </div>
                <button
                  className="campaign-modal__close"
                  type="button"
                  onClick={handleCloseModal}
                  disabled={donating}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <form className="campaign-modal__form" onSubmit={handleSubmitDonation}>
                <div className="campaign-modal__field">
                  <label htmlFor="donation-amount">Monto (₡)</label>
                  <input
                    id="donation-amount"
                    className="form-control"
                    type="number"
                    min="1"
                    step="any"
                    placeholder="Ej. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={donating}
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
                    disabled={donating}
                  />
                </div>

                {user && (
                  <div className="campaign-modal__user">
                    <strong>
                      {[user?.nombre, user?.apellidoPaterno].filter(Boolean).join(" ") || user?.usuario}
                    </strong>
                    <span>La donacion se asociara a tu cuenta.</span>
                  </div>
                )}

                <div className="campaign-modal__note">
                  La pasarela de pago estara disponible proximamente. Tu donacion quedara
                  registrada para su procesamiento.
                </div>

                <div className="campaign-modal__actions">
                  <button
                    className="campaign-modal__cancel"
                    type="button"
                    onClick={handleCloseModal}
                    disabled={donating}
                  >
                    Cancelar
                  </button>
                  <button className="campaign-btn" type="submit" disabled={donating}>
                    {donating ? "Registrando..." : "Confirmar donacion"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignsPage;
