import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "404 | Adopciones Kalo";
  }, []);

  return (
    <section className="not-found-page">
      <div className="container not-found-shell">
        <div className="not-found-card">
          <span className="not-found-code">404</span>
          <h1>Página no encontrada</h1>
          <p>
            La página que intentaste abrir no existe o ya no está disponible.
          </p>
          <small>{location.pathname || "/"}</small>
          <Link className="not-found-btn" to="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
