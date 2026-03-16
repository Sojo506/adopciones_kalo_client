import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const trustMetrics = [
    {
      value: "Acompañamiento",
      label: "Durante todo el proceso",
      detail: "Te guiamos desde el registro hasta la llegada del animal a su nuevo hogar.",
    },
    {
      value: "Proceso claro",
      label: "Sin pasos confusos",
      detail: "Conoce requisitos, avances y comunicación en una sola experiencia.",
    },
  ];

  const journeySteps = [
    {
      id: "01",
      title: "Crea tu cuenta",
      description: "Regístrate con tus datos y valida tu correo para comenzar el proceso con seguridad.",
    },
    {
      id: "02",
      title: "Completa tu perfil",
      description: "Comparte información básica de tu hogar y tus preferencias para una adopción responsable.",
    },
    {
      id: "03",
      title: "Da seguimiento",
      description: "Consulta el estado de tu solicitud y mantente al tanto de cada actualización importante.",
    },
  ];

  const valueCards = [
    {
      title: "Qué encontrarás aquí",
      body: "Información clara sobre el proceso, tus solicitudes y los pasos necesarios para adoptar con tranquilidad.",
    },
    {
      title: "Por qué confiar",
      body: "La plataforma está pensada para proteger a los animales y también para acompañar a las familias con transparencia.",
    },
    {
      title: "Para quién es",
      body: "Para personas y familias que quieren adoptar de forma responsable, con seguimiento y comunicación ordenada.",
    },
  ];

  const benefits = [
    "Registro simple y seguimiento del estado de tu cuenta.",
    "Comunicación más clara durante la verificación y la adopción.",
    "Una experiencia diseñada para entender qué sigue en cada etapa.",
    "Acceso desde cualquier dispositivo para consultar tu proceso.",
  ];

  const requirements = [
    {
      title: "Compromiso real",
      description: "Adoptar implica tiempo, cuidado, alimentación, visitas veterinarias y mucha paciencia.",
    },
    {
      title: "Entorno adecuado",
      description: "Es importante contar con un espacio seguro y apropiado según el tamaño y necesidades del animal.",
    },
    {
      title: "Información veraz",
      description: "Tus datos deben estar actualizados para poder avanzar con validaciones y contacto oportuno.",
    },
  ];

  const faqs = [
    {
      question: "¿Necesito una cuenta para empezar?",
      answer: "Sí. Tu cuenta permite guardar tus datos, verificar tu correo y dar seguimiento a tu proceso.",
    },
    {
      question: "¿Puedo consultar el estado de mi solicitud?",
      answer: "Sí. La plataforma está pensada para que tengas visibilidad de tus avances sin depender de mensajes aislados.",
    },
    {
      question: "¿La adopción es inmediata?",
      answer: "No siempre. Cada caso requiere revisión para asegurar el bienestar del animal y una buena compatibilidad.",
    },
  ];

  useEffect(() => {
    document.title = "Adopciones Kalö";
  }, []);

  return (
    <section className="landing-page">
      <div className="landing-hero">
        <div className="container py-5">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <span className="eyebrow-pill">Adopciones responsables para Costa Rica</span>
              <h1 className="landing-title">Encuentra una forma clara y confiable de iniciar tu adopción.</h1>
              <p className="landing-copy">
                En Adopciones Kalö puedes registrarte, verificar tu cuenta y dar seguimiento a tu proceso en un solo
                lugar. Queremos que cada persona entienda qué necesita, qué sigue y cómo prepararse para recibir a un
                nuevo compañero en casa.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {!isAuthenticated && (
                  <>
                    <Link className="btn btn-primary hero-btn" to="/signup">
                      Comenzar ahora
                    </Link>
                    <Link className="btn btn-outline-light hero-btn" to="/login">
                      Ya tengo cuenta
                    </Link>
                  </>
                )}
                {isAuthenticated && <span className="eyebrow-pill">Tu sesión está activa y lista para continuar</span>}
              </div>
              <div className="hero-metrics">
                {trustMetrics.map((metric) => (
                  <div key={metric.label} className="metric-card">
                    <strong>{metric.value}</strong>
                    <small>{metric.label}</small>
                    <span>{metric.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-panel">
                <div className="hero-panel__header">
                  <span className="status-dot" />
                  <span>Guía para comenzar</span>
                </div>
                <h2>Tu proceso de adopción, explicado paso a paso.</h2>
                <p>
                  La plataforma fue diseñada para ayudarte a avanzar con calma, claridad y confianza desde el primer
                  momento.
                </p>
                <div className="hero-highlights">
                  {journeySteps.map((step) => (
                    <div key={step.id} className="highlight-card">
                      <span>{step.id}</span>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          {valueCards.map((card) => (
            <div key={card.title} className="col-md-4">
              <article className="info-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="container pb-5">
        <section className="landing-section landing-section--split">
          <div className="section-heading">
            <span className="section-kicker">Beneficios para ti</span>
            <h2>Una experiencia más humana para adoptar con seguridad.</h2>
            <p>
              Queremos reducir la incertidumbre de las personas interesadas en adoptar y ofrecer una plataforma que
              acompañe mejor cada decisión.
            </p>
          </div>

          <div className="landing-benefits-card">
            <ul className="benefits-list">
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="container pb-5">
        <section className="landing-section">
          <div className="section-heading section-heading--center">
            <span className="section-kicker">Antes de adoptar</span>
            <h2>Algunas bases importantes para prepararte bien.</h2>
            <p>
              Adoptar no es solo llenar un formulario. También es construir un entorno estable y amoroso para el
              animal que llegará a tu hogar.
            </p>
          </div>

          <div className="landing-grid landing-grid--three">
            {requirements.map((requirement) => (
              <article key={requirement.title} className="surface-card">
                <h3>{requirement.title}</h3>
                <p>{requirement.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="container pb-5">
        <section className="landing-section landing-section--faq">
          <div className="section-heading">
            <span className="section-kicker">Preguntas frecuentes</span>
            <h2>Lo esencial para empezar sin dudas.</h2>
          </div>

          <div className="landing-grid landing-grid--faq">
            {faqs.map((item) => (
              <article key={item.question} className="faq-card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Home;
