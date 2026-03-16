import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const displayName = user?.nombre || user?.name || "Usuario";
  const roleLabel = user?.roleName || user?.tipoUsuario || user?.tipo || "Cliente";

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <Link className="navbar-brand brand-mark" to="/">
            <span className="brand-mark__icon">K</span>
            <span>
              Adopciones <strong>Kalö</strong>
            </span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav me-auto mb-3 mb-lg-0 align-items-lg-center">
              <li className="nav-item">
                <NavLink className="nav-link nav-link-custom" to="/">
                  Inicio
                </NavLink>
              </li>
              {isAuthenticated && isAdmin && (
                <li className="nav-item">
                  <NavLink className="nav-link nav-link-custom" to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
              )}
            </ul>

            <ul className="navbar-nav ms-auto mb-0 align-items-lg-center gap-lg-2">
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <div className="user-chip">
                      <span className="user-chip__label">Sesión activa</span>
                      <strong>{displayName}</strong>
                      <span className={`role-badge ${isAdmin ? "role-badge--admin" : ""}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </li>
                  {isAdmin && (
                    <li className="nav-item">
                      <Link className="btn btn-light header-action" to="/dashboard">
                        Ir al dashboard
                      </Link>
                    </li>
                  )}
                  <li className="nav-item mt-3 mt-lg-0">
                    <button className="btn btn-outline-light header-action" onClick={logout}>
                      Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item mt-3 mt-lg-0">
                    <NavLink className="nav-link nav-link-custom" to="/login">
                      Iniciar sesión
                    </NavLink>
                  </li>
                  <li className="nav-item mt-2 mt-lg-0">
                    <NavLink className="btn btn-light header-action" to="/signup">
                      Registrarse
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
