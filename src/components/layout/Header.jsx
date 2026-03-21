import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const PRIMARY_NAV_ITEMS = [
  { label: "Inicio", to: "/", end: true },
  { label: "Adoptar", to: "/adopciones", end: false },
  { label: "Tienda", to: "/tienda", end: false },
];

const Header = () => {
  const { isAuthenticated, isAdmin, isEmailVerified, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName =
    [user?.nombre, user?.apellidoPaterno].filter(Boolean).join(" ") || user?.usuario || "Usuario";
  const verifyEmailPath = user?.correo
    ? `/verify-email?correo=${encodeURIComponent(user.correo)}`
    : "/verify-email";
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand-mark" onClick={closeMenu} to="/">
          <span className="brand-mark__icon">K</span>
          <span>
            Adopciones <strong>Kalö</strong>
          </span>
        </Link>

        <button
          aria-controls="site-header-panel"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
          className={`site-header__toggle${isMenuOpen ? " is-open" : ""}`}
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          type="button"
        >
          <span className="site-header__toggle-bar" />
          <span className="site-header__toggle-bar" />
          <span className="site-header__toggle-bar" />
        </button>

        <div className={`site-header__panel${isMenuOpen ? " is-open" : ""}`} id="site-header-panel">
          <nav aria-label="Principal" className="site-header__nav">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `site-header__nav-link${isActive ? " is-active" : ""}`
                }
                end={item.end}
                onClick={closeMenu}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            {isAuthenticated ? (
              <>
                <span className="header-user-link" title="Perfil de usuario próximamente">
                  {displayName}
                </span>
                {!isEmailVerified && (
                  <div className="header-alert-chip">
                    <div className="header-alert-chip__content">
                      <span className="header-alert-chip__label">Correo pendiente</span>
                      <p>Verifica tu cuenta para habilitar futuras compras.</p>
                    </div>
                    <Link className="header-action header-action--warning" onClick={closeMenu} to={verifyEmailPath}>
                      Verificar correo
                    </Link>
                  </div>
                )}
                {isAdmin && (
                  <Link className="header-action header-action--soft" onClick={closeMenu} to="/dashboard">
                    Dashboard
                  </Link>
                )}
                <button className="header-action header-action--ghost" onClick={handleLogout} type="button">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <NavLink className="site-header__nav-link site-header__nav-link--subtle" onClick={closeMenu} to="/login">
                  Iniciar sesión
                </NavLink>
                <NavLink className="header-action header-action--solid" onClick={closeMenu} to="/signup">
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
