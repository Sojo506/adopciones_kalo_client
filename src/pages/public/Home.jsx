import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

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
              <h1 className="landing-title">Conectamos animales rescatados con familias listas para cuidarlos.</h1>
              <p className="landing-copy">
                Adopciones Kalö centraliza registros, seguimiento y procesos de adopción en una experiencia clara,
                humana y confiable para clientes y administradores.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {!isAuthenticated && (
                  <>
                    <Link className="btn btn-primary hero-btn" to="/signup">
                      Crear cuenta
                    </Link>
                    <Link className="btn btn-outline-light hero-btn" to="/login">
                      Iniciar sesión
                    </Link>
                  </>
                )}
                {isAuthenticated && isAdmin && (
                  <Link className="btn btn-light hero-btn" to="/dashboard">
                    Abrir dashboard
                  </Link>
                )}
                {isAuthenticated && !isAdmin && <span className="eyebrow-pill">Tu sesión como cliente está activa</span>}
              </div>
              <div className="hero-metrics">
                <div className="metric-card">
                  <strong>Seguimiento centralizado</strong>
                  <span>Usuarios, procesos y comunicaciones en un solo lugar.</span>
                </div>
                <div className="metric-card">
                  <strong>Roles verificados</strong>
                  <span>La plataforma distingue entre administradores y clientes.</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-panel">
                <div className="hero-panel__header">
                  <span className="status-dot" />
                  <span>Plataforma activa</span>
                </div>
                <h2>Un flujo moderno para adopciones más seguras.</h2>
                <p>
                  Diseñamos una experiencia profesional para que cada persona entienda su siguiente paso desde el
                  primer vistazo.
                </p>
                <div className="hero-highlights">
                  <div className="highlight-card">
                    <span>01</span>
                    <strong>Registro claro</strong>
                    <p>Acceso rápido con validación de correo y perfil.</p>
                  </div>
                  <div className="highlight-card">
                    <span>02</span>
                    <strong>Gestión por roles</strong>
                    <p>Los administradores obtienen acceso directo al dashboard.</p>
                  </div>
                  <div className="highlight-card">
                    <span>03</span>
                    <strong>Comunicación confiable</strong>
                    <p>Una interfaz cuidada que transmite confianza desde la landing.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <article className="info-card">
              <h3>Experiencia profesional</h3>
              <p>Navegación más limpia, jerarquía visual fuerte y componentes consistentes en toda la página.</p>
            </article>
          </div>
          <div className="col-md-4">
            <article className="info-card">
              <h3>Accesos inteligentes</h3>
              <p>El sistema puede identificar si el usuario pertenece al rol Administrador o Cliente.</p>
            </article>
          </div>
          <div className="col-md-4">
            <article className="info-card">
              <h3>Base lista para crecer</h3>
              <p>El diseño nuevo deja una estructura visual sólida para futuras secciones y módulos.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
