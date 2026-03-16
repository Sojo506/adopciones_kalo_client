import { useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Dashboard | Adopciones Kalö";
  }, []);

  return (
    <main className="container py-4">
      <div className="row">
        <Sidebar />

        <section className="col-12 col-md-9 col-lg-10">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h2>Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}!</h2>
              <p className="text-muted">Desde aquí puedes administrar tu cuenta, mascotas y solicitudes.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Tu información</h5>
              <p className="mb-1">
                <strong>Correo:</strong> {user?.correo || user?.usuario || "-"}
              </p>
              <p className="mb-1">
                <strong>Identificación:</strong> {user?.identificacion || "-"}
              </p>
              <p className="mb-1">
                <strong>Tipo:</strong> {user?.tipo || user?.tipoUsuario || "-"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
