import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer mt-auto">
      <div className="footer-frame">
        <div className="footer-shell">
          <section className="footer-hero">
            <div className="footer-brand-block">
              <span className="footer-kicker">Adopciones Kalö</span>
              <h2>Una plataforma más humana para empezar adopciones responsables.</h2>
              <p className="footer-copy">
                Diseñamos una experiencia clara, cálida y confiable para acompañar a personas y
                familias durante el proceso de adopción.
              </p>
            </div>

            <div className="footer-meta-block">
              <span>Atención de lunes a viernes</span>
              <strong>8:00 a.m. a 5:00 p.m.</strong>
              <p>Consultas, verificación de cuentas y acompañamiento inicial del proceso.</p>
            </div>
          </section>

          <div className="footer-grid">
            <div className="footer-column">
              <span className="footer-column__title">Organización</span>
              <span>Adopciones Kalö</span>
              <span>San José, Costa Rica</span>
              <span>Plataforma de adopción y seguimiento</span>
            </div>

            <div className="footer-column">
              <span className="footer-column__title">Accesos</span>
              <Link to="/signup">Crear cuenta</Link>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/verify-email">Verificar correo</Link>
            </div>

            <div className="footer-column">
              <span className="footer-column__title">Contacto</span>
              <a href="mailto:apoyo@adopcioneskalo.org">apoyo@adopcioneskalo.org</a>
              <span>+506 2222-4455</span>
              <span>Seguimiento por correo</span>
            </div>

            <div className="footer-column">
              <span className="footer-column__title">Enfoque</span>
              <span>Bienestar animal</span>
              <span>Claridad en el proceso</span>
              <span>Experiencia centrada en las personas</span>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Adopciones Kalö. Todos los derechos reservados.</span>
            <span>Diseño de experiencia, trazabilidad y acompañamiento para adopciones responsables.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
