import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import Swal from "sweetalert2";
import PayPalProvider, { isPayPalConfigured } from "../../components/payments/PayPalProvider";
import {
  selectCartItems,
  selectCartTotal,
  removeItem,
  updateQuantity,
  clearCart,
} from "../../store/cartSlice";
import {
  createStoreOrder,
  captureStoreOrder,
} from "../../api/storeCheckout";

const formatPrice = (price) => {
  if (price === undefined || price === null) return "Sin precio";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(price);
};

const PayPalCheckout = ({ total, items, onSuccess }) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <p className="cart-paypal-msg cart-paypal-msg--error">
        No se pudo cargar PayPal. Verifica tu conexion e intenta nuevamente.
      </p>
    );
  }

  if (isPending) {
    return <p className="cart-paypal-msg">Cargando PayPal...</p>;
  }

  return (
    <PayPalButtons
      style={{ layout: "vertical", shape: "rect", color: "gold", label: "pay" }}
      forceReRender={[total]}
      createOrder={async () => {
        const { orderId } = await createStoreOrder({ total });
        return orderId;
      }}
      onApprove={async (data) => {
        try {
          const result = await captureStoreOrder({
            orderId: data.orderID,
            items: items.map((i) => ({
              idProducto: i.idProducto,
              cantidad: i.cantidad,
            })),
          });
          onSuccess(result);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "No se pudo completar la compra",
            text:
              err?.response?.data?.message ||
              "El pago fue procesado pero hubo un error al registrar la compra. Contacta al equipo de Kalo.",
          });
        }
      }}
      onError={() => {
        Swal.fire({
          icon: "error",
          title: "Error en el pago",
          text: "Hubo un problema al procesar tu pago con PayPal. Intenta nuevamente.",
        });
      }}
    />
  );
};

const CartPage = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const [checkoutDone, setCheckoutDone] = useState(null);

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

  const handleSuccess = (result) => {
    dispatch(clearCart());
    setCheckoutDone(result);
    Swal.fire({
      icon: "success",
      title: "Compra exitosa",
      text: "Tu factura fue enviada a tu correo electronico.",
    });
  };

  const handleDownloadPdf = () => {
    if (!checkoutDone?.pdfBase64) return;
    const byteChars = atob(checkoutDone.pdfBase64);
    const byteNumbers = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura-${checkoutDone.idFactura}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (checkoutDone) {
    return (
      <section className="store-page">
        <div className="container cart-shell">
          <div className="cart-success">
            <div className="cart-success__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>Compra realizada con exito</h2>
            <p>Factura <strong>#{checkoutDone.idFactura}</strong></p>
            <p className="cart-success__hint">Se envio una copia de la factura a tu correo electronico.</p>
            <div className="cart-success__actions">
              <button
                className="cart-checkout-btn"
                onClick={handleDownloadPdf}
                type="button"
              >
                Descargar factura PDF
              </button>
              <Link className="cart-continue-link" to="/tienda">
                Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

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

                {isPayPalConfigured ? (
                  <PayPalProvider>
                    <PayPalCheckout
                      total={total}
                      items={items}
                      onSuccess={handleSuccess}
                    />
                  </PayPalProvider>
                ) : (
                  <p className="cart-paypal-msg cart-paypal-msg--error">
                    PayPal no esta configurado en este ambiente.
                  </p>
                )}

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
