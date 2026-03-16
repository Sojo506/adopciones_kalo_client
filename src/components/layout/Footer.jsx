const Footer = () => {
  return (
    <footer className="site-footer mt-auto">
      <div className="container">
        <div className="footer-shell">
          <div>
            <span className="footer-kicker">Adopciones Kalö</span>
            <h2>Una plataforma confiable para acompañar cada adopción.</h2>
          </div>
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} Todos los derechos reservados.</span>
            <span>Diseño enfocado en claridad, confianza y gestión por roles.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
