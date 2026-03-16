import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="col-12 col-md-3 col-lg-2 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">Menú</h5>
          <nav className="nav flex-column">
            <NavLink className="nav-link" to="/dashboard">
              Inicio
            </NavLink>
            <NavLink className="nav-link" to="/dashboard/perfil">
              Perfil
            </NavLink>
            <NavLink className="nav-link" to="/dashboard/mascotas">
              Mascotas
            </NavLink>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
