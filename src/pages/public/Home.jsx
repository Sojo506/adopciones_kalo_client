import { Link } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    document.title = "Adopciones Kalö";
  }, []);

  return (
    <main className="container py-5">
      <div className="row align-items-center">
        <div className="col-lg-6">
          <h1 className="display-5">Bienvenido a Adopciones Kalö</h1>
          <p className="lead">
            Únete a nuestra comunidad y ayuda a encontrar un hogar amoroso para los animales que lo necesitan.
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <Link className="btn btn-primary" to="/signup">
              Crear cuenta
            </Link>
            <Link className="btn btn-outline-primary" to="/login">
              Iniciar sesión
            </Link>
          </div>
        </div>
        <div className="col-lg-6 mt-4 mt-lg-0">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">¿Sabías que?</h5>
              <p className="card-text">
                Millones de animales esperan un hogar. Con tu registro podrás acceder a formularios de adopción,
                gestionar tus mascotas y estar al día con las campañas de la organización.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
