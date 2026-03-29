import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  selectCartItems,
  selectCartTotal,
  removeItem,
  updateQuantity,
  clearCart,
} from "../../store/cartSlice";

const formatPrice = (price) => {
  if (price === undefined || price === null) return "Sin precio";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(price);
};

const CartPage = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  useEffect(() => {
    document.title = "Carrito | Adopciones Kalo";
  }, []);

  const handleRemove = (item) => {
    Swal.fire({
      title: "Eliminar producto",
      text: `Quieres eliminar ${item.nombre} del carrito?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#9a4f4f",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeItem(item.idProducto));
      }
    });
  };

  const handleClear = () => {
    Swal.fire({
      title: "Vaciar carrito",
      text: "Se eliminaran todos los productos del carrito.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Vaciar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#9a4f4f",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart());
      }
    });
  };

  const handleCheckout = () => {
    Swal.fire({
      icon: "info",
      title: "Proximamente",
      text: "La pasarela de pago estara disponible muy pronto.",
    });
  };

  return (
    <section className="store-page">
      <div className="container cart-shell">
        <div className="cart-header">
          <h1 className="cart-title">Carrito de compras</h1>
          {items.length > 0 && (
            <button
              className="cart-clear-btn"
              onClick={handleClear}
              type="button"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Tu carrito esta vacio.</p>
            <Link className="cart-continue-link" to="/tienda">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-body">
              <div className="cart-items">
              {items.map((item) => (
                <article key={item.idProducto} className="cart-item">
                  <div
                    className="cart-item__image"
                    style={
                      item.imageUrl
                        ? {
                            backgroundImage: `url("${item.imageUrl}")`,
                          }
                        : undefined
                    }
                  />

                  <div className="cart-item__info">
                    <Link
                      className="cart-item__name"
                      to={`/tienda/${item.idProducto}`}
                    >
                      {item.nombre}
                    </Link>

                    <div className="cart-item__tags">
                      {item.categoria && (
                        <span className="store-tag">{item.categoria}</span>
                      )}
                      {item.marca && (
                        <span className="store-tag store-tag--brand">
                          {item.marca}
                        </span>
                      )}
                    </div>

                    <span className="cart-item__unit-price">
                      {formatPrice(item.precio)} c/u
                    </span>
                  </div>

                  <div className="cart-item__actions">
                    <div className="cart-qty">
                      <button
                        className="cart-qty__btn"
                        disabled={item.cantidad <= 1}
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              idProducto: item.idProducto,
                              cantidad: item.cantidad - 1,
                            })
                          )
                        }
                        type="button"
                      >
                        -
                      </button>
                      <span className="cart-qty__value">{item.cantidad}</span>
                      <button
                        className="cart-qty__btn"
                        disabled={item.cantidad >= (item.stock ?? 0)}
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              idProducto: item.idProducto,
                              cantidad: item.cantidad + 1,
                            })
                          )
                        }
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <strong className="cart-item__subtotal">
                      {formatPrice(item.precio * item.cantidad)}
                    </strong>

                    <button
                      className="cart-item__remove"
                      onClick={() => handleRemove(item)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>

              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>Total</span>
                  <strong className="cart-summary__total">
                    {formatPrice(total)}
                  </strong>
                </div>

                <button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  type="button"
                >
                  Proceder al pago
                </button>

                <Link className="cart-continue-link" to="/tienda">
                  Seguir comprando
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CartPage;
