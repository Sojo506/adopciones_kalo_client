import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const STORY_CARDS = [
  {
    title: "Conexión antes que trámite",
    text: "La experiencia está pensada para acompañarte como persona, no solo para pedirte datos y formularios.",
  },
  {
    title: "Claridad en cada paso",
    text: "Desde tu registro hasta el seguimiento, siempre deberías entender qué sigue y por qué importa.",
  },
  {
    title: "Diseño con intención",
    text: "Queremos una plataforma cálida, confiable y con personalidad, alineada con el propósito de adoptar responsablemente.",
  },
];

const PROCESS_STEPS = [
  {
    index: "01",
    title: "Explora con calma",
    text: "Infórmate, entiende el proceso y descubre qué significa de verdad estar listo para adoptar.",
  },
  {
    index: "02",
    title: "Crea tu cuenta",
    text: "Regístrate, verifica tu correo y deja tu perfil preparado para avanzar con una base segura.",
  },
  {
    index: "03",
    title: "Da seguimiento",
    text: "Mantén visibilidad sobre tu progreso y evita la incertidumbre de procesos poco claros.",
  },
];

const READINESS_ITEMS = [
  "Tiempo real para acompañar a un animal en adaptación",
  "Espacio seguro y condiciones adecuadas en casa",
  "Compromiso con salud, alimentación y seguimiento",
  "Decisión sostenida, no impulsiva ni temporal",
];

const FAQS = [
  {
    question: "¿Necesito una cuenta para comenzar?",
    answer: "Sí. La cuenta te permite verificar tu correo, guardar avances y tener un seguimiento más claro.",
  },
  {
    question: "¿La adopción es inmediata?",
    answer: "No siempre. Cada caso se revisa con foco en bienestar animal y compatibilidad con el hogar.",
  },
  {
    question: "¿Puedo retomar mi proceso luego?",
    answer: "Sí. La plataforma está pensada para que vuelvas, revises tu estado y continúes sin perder contexto.",
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "Adopciones Kalö";
  }, []);

  return (
    <section className="home-page">
      <section className="home-hero">
        <div className="home-hero__image" />
        <div className="container">
          <div className="home-hero__overlay">
            <span className="home-pill home-pill--light">Adopción responsable con criterio y corazón</span>
            <h1>Un nuevo comienzo merece una experiencia que también se sienta especial.</h1>
            <p>
              Adopciones Kalö reúne información, seguimiento y acompañamiento en un mismo lugar para
              que el proceso sea más claro, más humano y mucho menos frío.
            </p>

            <div className="home-hero__actions">
              {!isAuthenticated ? (
                <>
                  <Link className="home-btn home-btn--primary" to="/signup">
                    Crear mi cuenta
                  </Link>
                  <Link className="home-btn home-btn--secondary-light" to="/login">
                    Ya tengo cuenta
                  </Link>
                </>
              ) : (
                <span className="home-session-badge home-session-badge--light">
                  Tu sesión está activa y lista para continuar.
                </span>
              )}
            </div>

            <div className="home-hero__microcopy">
              Una plataforma pensada para personas que quieren adoptar con responsabilidad, calma y
              una mejor comprensión de todo el recorrido.
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-editorial-grid">
            <div className="home-section__header home-section__header--left">
              <span>Una experiencia con personalidad</span>
              <h2>La adopción no debería sentirse como un trámite gris.</h2>
              <p>
                Queremos que la plataforma inspire confianza desde la primera pantalla: con un tono
                cercano, una guía útil y una identidad visual que conecte con el propósito.
              </p>
            </div>

            <div className="home-story-grid">
              {STORY_CARDS.map((card) => (
                <article key={card.title} className="home-story-card">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section--contrast">
        <div className="container">
          <div className="home-split">
            <div className="home-section__header home-section__header--left">
              <span>Cómo se vive el proceso</span>
              <h2>Un recorrido simple, claro y diseñado para acompañarte.</h2>
              <p>
                Desde que exploras la plataforma hasta que das seguimiento a tu cuenta, cada etapa
                debería sentirse entendible y bien acompañada.
              </p>
            </div>

            <div className="home-process-list">
              {PROCESS_STEPS.map((step) => (
                <article key={step.index} className="home-process-card">
                  <span>{step.index}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-dual-grid">
            <section className="home-checklist-card">
              <span>Antes de dar el paso</span>
              <h2>Qué conviene revisar con honestidad.</h2>
              <ul>
                {READINESS_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="home-faq-shell">
              <div className="home-section__header home-section__header--left">
                <span>Preguntas frecuentes</span>
                <h2>Lo esencial, sin rodeos.</h2>
              </div>

              <div className="home-faq-grid">
                {FAQS.map((item) => (
                  <article key={item.question} className="home-faq-card">
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="container">
          <div className="home-cta__shell">
            <div>
              <span className="home-pill home-pill--light">Listo para comenzar</span>
              <h2>Haz que tu proceso empiece con claridad, no con dudas.</h2>
            </div>

            <div className="home-cta__actions">
              {!isAuthenticated ? (
                <>
                  <Link className="home-btn home-btn--primary" to="/signup">
                    Registrarme
                  </Link>
                  <Link className="home-btn home-btn--secondary-light" to="/login">
                    Iniciar sesión
                  </Link>
                </>
              ) : (
                <span className="home-session-badge home-session-badge--light">
                  Tu sesión ya está activa y preparada para continuar.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Home;
