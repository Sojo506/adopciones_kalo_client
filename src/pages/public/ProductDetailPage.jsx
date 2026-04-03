import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import InlineCartQuantityControl from "../../components/store/InlineCartQuantityControl";
import { getCatalogProductById } from "../../api/catalogs";
import { useAuth } from "../../hooks/useAuth";
import { addItem, selectCartItems, updateQuantity } from "../../store/cartSlice";

const formatPrice = (price) => {
  if (price === undefined || price === null) return "Sin precio";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(price);
};

const getProductGallery = (product) => {
  const gallery = [];
  const seen = new Set();

  const addImage = (image) => {
    const imageUrl = image?.imageUrl || null;
    if (!imageUrl || seen.has(imageUrl)) return;
    seen.add(imageUrl);
    gallery.push({
      idImagen: image?.idImagen ?? imageUrl,
      imageUrl,
    });
  };

  if (Array.isArray(product?.imagenes)) {
    product.imagenes.forEach(addImage);
  }

  addImage({ idImagen: "cover", imageUrl: product?.imageUrl });

  return gallery;
};

const ProductDetailPage = () => {
  const { idProducto } = useParams();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const [product, setProduct] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const gallery = useMemo(() => getProductGallery(product), [product]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setSelectedImageUrl(null);

      try {
        const found = await getCatalogProductById(idProducto, { force: true });
        if (ignore) return;

        if (found) {
          setProduct(found);
          document.title = `${found.nombre} | Adopciones Kalo`;
        } else {
          setProduct(null);
          setSelectedImageUrl(null);
          setError("Producto no encontrado.");
          document.title = "Producto no encontrado | Adopciones Kalo";
        }
      } catch {
        if (!ignore) {
          setProduct(null);
          setSelectedImageUrl(null);
          setError("No pudimos cargar el producto. Intenta nuevamente.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [idProducto]);

  useEffect(() => {
    setSelectedImageUrl((currentImageUrl) => {
      if (gallery.some((image) => image.imageUrl === currentImageUrl)) {
        return currentImageUrl;
      }

      return gallery[0]?.imageUrl || null;
    });
  }, [gallery]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Necesitas una cuenta",
        html: `Para agregar <strong>${product.nombre}</strong> necesitas iniciar sesion o crear una cuenta.`,
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

    dispatch(addItem(product));
  };

  const handleQuantityChange = (nextQuantity) => {
    dispatch(
      updateQuantity({
        idProducto: product.idProducto,
        cantidad: nextQuantity,
      })
    );
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

  const inCart = cartItems.find((i) => i.idProducto === product.idProducto)?.cantidad ?? 0;
  const available = (product.stock ?? 0) - inCart;
  const outOfStock = available <= 0;
  const isAdded = inCart > 0;
  const mainImageUrl = selectedImageUrl || gallery[0]?.imageUrl || null;

  return (
    <section className="store-page">
      <div className="container product-detail-shell">
        <Link className="product-detail__back" to="/tienda">
          Volver a la tienda
        </Link>

        <div className="product-detail">
          <div className="product-detail__media">
            <div className="product-detail__image">
              {mainImageUrl ? (
                <img
                  alt={`Imagen principal de ${product.nombre}`}
                  className="product-detail__image-img"
                  src={mainImageUrl}
                />
              ) : (
                <div className="product-detail__image-empty">
                  No hay imagen disponible para este producto.
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="product-detail__thumbs" aria-label="Imagenes disponibles">
                {gallery.map((image) => {
                  const isSelected = image.imageUrl === mainImageUrl;

                  return (
                    <button
                      key={image.idImagen}
                      aria-label={`Ver imagen ${product.nombre}`}
                      aria-pressed={isSelected}
                      className={`product-detail__thumb${isSelected ? " product-detail__thumb--active" : ""}`}
                      onClick={() => setSelectedImageUrl(image.imageUrl)}
                      type="button"
                    >
                      <img
                        alt={`Miniatura de ${product.nombre}`}
                        className="product-detail__thumb-image"
                        loading="lazy"
                        src={image.imageUrl}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
                {outOfStock ? "Sin stock" : `${available} en stock`}
              </span>
            </div>

            {isAdded ? (
              <InlineCartQuantityControl
                disableIncrement={inCart >= (product.stock ?? 0)}
                onDecrement={() => handleQuantityChange(inCart - 1)}
                onIncrement={() => handleQuantityChange(inCart + 1)}
                quantity={inCart}
                variant="detail"
              />
            ) : (
              <button
                className="product-detail__buy-btn"
                disabled={outOfStock}
                onClick={handleAddToCart}
                type="button"
              >
                {outOfStock ? "Agotado" : "Agregar al carrito"}
              </button>
            )}

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
