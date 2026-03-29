import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getProducts } from "../../api/catalogs";
import { useAuth } from "../../hooks/useAuth";

const formatPrice = (price) => {
  if (price === undefined || price === null) return "Sin precio";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(price);
};

const ProductDetailPage = () => {
  const { idProducto } = useParams();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const products = await getProducts();
        if (ignore) return;

        const found = products.find(
          (p) => String(p.idProducto) === String(idProducto)
        );

        if (found) {
          setProduct(found);
          document.title = `${found.nombre} | Adopciones Kalo`;
        } else {
          setError("Producto no encontrado.");
          document.title = "Producto no encontrado | Adopciones Kalo";
        }
      } catch {
        if (!ignore) setError("No pudimos cargar el producto. Intenta nuevamente.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [idProducto]);

  const handleBuy = () => {
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

  if (loading) {
    return (
      <section className="store-page">
        <div className="container product-detail-shell">
          <div className="store-empty">Cargando producto...</div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="store-page">
        <div className="container product-detail-shell">
          <Link className="product-detail__back" to="/tienda">
            Volver a la tienda
          </Link>
          <div className="store-empty store-empty--error">
            {error || "Producto no encontrado."}
          </div>
        </div>
      </section>
    );
  }

  const outOfStock = (product.stock ?? 0) <= 0;

  return (
    <section className="store-page">
      <div className="container product-detail-shell">
        <Link className="product-detail__back" to="/tienda">
          Volver a la tienda
        </Link>

        <div className="product-detail">
          <div
            className="product-detail__image"
            style={
              product.imageUrl
                ? {
                    backgroundImage: `linear-gradient(180deg, rgba(9,18,29,0.04), rgba(9,18,29,0.18)), url("${product.imageUrl}")`,
                  }
                : undefined
            }
          />

          <div className="product-detail__info">
            <div className="product-detail__tags">
              {product.categoria && (
                <span className="store-tag">{product.categoria}</span>
              )}
              {product.marca && (
                <span className="store-tag store-tag--brand">{product.marca}</span>
              )}
            </div>

            <h1 className="product-detail__name">{product.nombre}</h1>

            {product.descripcion && (
              <p className="product-detail__desc">{product.descripcion}</p>
            )}

            <div className="product-detail__price-row">
              <strong className="product-detail__price">
                {formatPrice(product.precio)}
              </strong>
              <span
                className={`store-stock${outOfStock ? " store-stock--out" : ""}`}
              >
                {outOfStock ? "Sin stock" : `${product.stock} en stock`}
              </span>
            </div>

            <button
              className="product-detail__buy-btn"
              disabled={outOfStock}
              onClick={handleBuy}
              type="button"
            >
              {outOfStock ? "Agotado" : "Comprar"}
            </button>

            {!isAuthenticated && (
              <p className="product-detail__auth-hint">
                Necesitas{" "}
                <Link to="/login">iniciar sesion</Link> o{" "}
                <Link to="/signup">crear una cuenta</Link> para comprar.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;
