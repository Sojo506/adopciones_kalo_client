import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { selectCartCount } from "../../store/cartSlice";

const PRIMARY_NAV_ITEMS = [
  { label: "Inicio", to: "/", end: true },
  { label: "Adoptar", to: "/adopciones", end: false },
  { label: "Tienda", to: "/tienda", end: false },
  { label: "Campañas", to: "/campanias", end: false },
];

const Header = () => {
  const { isAuthenticated, isAdmin, isEmailVerified, user, logout } = useAuth();
  const cartCount = useSelector(selectCartCount);
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
                className={({ isActive }) => `site-header__nav-link${isActive ? " is-active" : ""}`}
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
                <Link className="header-user-link" onClick={closeMenu} title="Ver perfil" to="/perfil">
                  {displayName}
                </Link>
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

        {isAuthenticated && (
          <Link className="header-cart-link" onClick={closeMenu} to="/carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="header-cart-badge">{cartCount}</span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
