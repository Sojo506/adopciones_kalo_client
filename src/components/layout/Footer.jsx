import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer mt-auto">
      <div className="container">
        <div className="footer-shell">
          <div className="footer-top">
            <div className="footer-main">
              <span className="footer-kicker">Adopciones Kalö</span>
              <h2>Un espacio para iniciar adopciones responsables con más claridad, seguimiento y confianza.</h2>
              <p className="footer-copy">
                Acompañamos a personas y familias durante el proceso de adopción con información clara, validación de
                cuenta y un seguimiento más ordenado en cada etapa.
              </p>
            </div>

            <div className="footer-note">
              <span className="footer-column__title">Importante</span>
              <p>
                La aprobación de una adopción depende de validación, disponibilidad y del bienestar integral del
                animal.
              </p>
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-column">
              <span className="footer-column__title">Ayuda</span>
              <Link to="/signup">Crear cuenta</Link>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/verify-email">Verificar correo</Link>
            </div>

            <div className="footer-column">
              <span className="footer-column__title">Contacto</span>
              <span>apoyo@adopcioneskalo.org</span>
              <span>+506 2222-4455</span>
              <span>San José, Costa Rica</span>
            </div>

            <div className="footer-column">
              <span className="footer-column__title">Atención</span>
              <span>Lunes a viernes</span>
              <span>8:00 a.m. a 5:00 p.m.</span>
              <span>Seguimiento sujeto a revisión</span>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Adopciones Kalö. Todos los derechos reservados.</span>
            <span>Plataforma orientada a adopciones responsables y seguimiento del proceso.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
