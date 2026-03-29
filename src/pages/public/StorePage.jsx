import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getBrands, getCategories, getProducts } from "../../api/catalogs";
import { useAuth } from "../../hooks/useAuth";

const formatPrice = (price) => {
  if (price === undefined || price === null) return "Sin precio";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(price);
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const PAGE_SIZE = 9;

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "Tienda | Adopciones Kalo";
  }, []);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [nextProducts, nextCategories, nextBrands] = await Promise.all([
          getProducts({ force: true }),
          getCategories(),
          getBrands(),
        ]);

        if (ignore) return;

        setProducts(Array.isArray(nextProducts) ? nextProducts : []);
        setCategories(Array.isArray(nextCategories) ? nextCategories : []);
        setBrands(Array.isArray(nextBrands) ? nextBrands : []);
      } catch {
        if (!ignore) setError("No pudimos cargar los productos. Intenta nuevamente en unos segundos.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return products
      .filter((p) => {
        if (selectedCategory && String(p.idCategoria) !== String(selectedCategory)) return false;
        if (selectedBrand && String(p.idMarca) !== String(selectedBrand)) return false;
        if (normalizedSearch) {
          const inName = normalizeText(p.nombre).includes(normalizedSearch);
          const inDesc = normalizeText(p.descripcion).includes(normalizedSearch);
          if (!inName && !inDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "precio_asc") return (a.precio ?? 0) - (b.precio ?? 0);
        if (sortBy === "precio_desc") return (b.precio ?? 0) - (a.precio ?? 0);
        return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
      });
  }, [products, selectedCategory, selectedBrand, search, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedBrand, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const inStock = products.filter((p) => (p.stock ?? 0) > 0).length;

  const handleBuy = (product) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Necesitas una cuenta",
        html: `Para comprar <strong>${product.nombre}</strong> necesitas iniciar sesion o crear una cuenta.`,
        showCancelButton: true,
        confirmButtonText: "Iniciar sesion",
        cancelButtonText: "Crear cuenta",
        confirmButtonColor: "#11253d",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = "/signup";
        }
      });
      return;
    }

    Swal.fire({
      icon: "info",
      title: "Proximamente",
      text: "La pasarela de pago estara disponible muy pronto.",
    });
  };

  const hasActiveFilters = search || selectedCategory || selectedBrand;

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSortBy("nombre");
  };

  return (
    <section className="store-page">
      <div className="container store-shell">

        <section className="store-hero">

          <div>
            <span className="store-pill">Tienda</span>
            <h1>Cada compra <em className="hero-highlight">apoya</em> directamente a los perritos de Kalo.</h1>
            <p>
              Los productos de nuestra tienda financian cuidados veterinarios, alimentacion y
              bienestar para los perritos que esperan un hogar.
            </p>
          </div>

          <div className="store-hero__aside">
            <article>
              <strong>{products.length}</strong>
              <span>Productos en tienda</span>
            </article>
            <article>
              <strong>{inStock}</strong>
              <span>Con stock disponible</span>
            </article>
            <article>
              <strong>{isAuthenticated ? "Lista" : "Requiere cuenta"}</strong>
              <span>{isAuthenticated ? "Sesion activa" : "Para comprar"}</span>
            </article>
          </div>
        </section>

        <section className="store-filters">
          <input
            className="store-search"
            placeholder="Buscar producto..."
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="store-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorias</option>
            {categories.map((cat) => (
              <option key={cat.idCategoria} value={cat.idCategoria}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <select
            className="store-select"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand.idMarca} value={brand.idMarca}>
                {brand.nombre}
              </option>
            ))}
          </select>

          <select
            className="store-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="nombre">Ordenar: A-Z</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>

          {hasActiveFilters && (
            <button className="store-clear-btn" onClick={handleClearFilters} type="button">
              Limpiar filtros
            </button>
          )}

          {hasActiveFilters && !loading && (
            <span className="store-filter-count">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </section>

        {loading ? (
          <div className="store-empty">Cargando productos...</div>
        ) : error ? (
          <div className="store-empty store-empty--error">{error}</div>
        ) : !filtered.length ? (
          <div className="store-empty">
            {products.length
              ? "Ningun producto coincide con tu busqueda."
              : "No hay productos disponibles en este momento."}
          </div>
        ) : (
          <>
            <div className="store-grid">
              {paginated.map((product) => {
                const outOfStock = (product.stock ?? 0) <= 0;

                return (
                  <Link
                    key={product.idProducto}
                    className={`store-card${outOfStock ? " store-card--out" : ""}`}
                    to={`/tienda/${product.idProducto}`}
                  >
                    <div
                      className="store-card__image"
                      style={
                        product.imageUrl
                          ? {
                            backgroundImage: `linear-gradient(180deg, rgba(9,18,29,0.06), rgba(9,18,29,0.34)), url("${product.imageUrl}")`,
                          }
                          : undefined
                      }
                    />

                    <div className="store-card__body">
                      <div className="store-card__tags">
                        {product.categoria && (
                          <span className="store-tag">{product.categoria}</span>
                        )}
                        {product.marca && (
                          <span className="store-tag store-tag--brand">{product.marca}</span>
                        )}
                      </div>

                      <h3>{product.nombre}</h3>

                      {product.descripcion && (
                        <p className="store-card__desc">{product.descripcion}</p>
                      )}

                      <div className="store-card__footer">
                        <div className="store-card__meta">
                          <strong className="store-card__price">{formatPrice(product.precio)}</strong>
                          <span className={`store-stock${outOfStock ? " store-stock--out" : ""}`}>
                            {outOfStock ? "Sin stock" : `${product.stock} en stock`}
                          </span>
                        </div>

                        <button
                          className="store-btn"
                          disabled={outOfStock}
                          onClick={(e) => {
                            e.preventDefault();
                            handleBuy(product);
                          }}
                          type="button"
                        >
                          {outOfStock ? "Agotado" : "Comprar"}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  type="button"
                >
                  Anterior
                </button>
                <span className="pagination-info">
                  Pagina {page} de {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {!isAuthenticated && !loading && products.length > 0 && (
          <div className="store-auth-banner">
            <div>
              <strong>Apoya a los perritos de Kalo</strong>
              <span>Crea una cuenta para realizar compras y contribuir con la causa.</span>
            </div>
            <div className="store-auth-banner__actions">
              <Link className="home-btn home-btn--primary" to="/signup">
                Crear cuenta
              </Link>
              <Link className="dashboard-btn dashboard-btn--ghost" to="/login">
                Iniciar sesion
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default StorePage;
