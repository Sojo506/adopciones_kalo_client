const InlineCartQuantityControl = ({
  quantity,
  onDecrement,
  onIncrement,
  disableIncrement = false,
  variant = "default",
}) => {
  return (
    <div className={`inline-cart-control inline-cart-control--${variant}`}>
      <span className="inline-cart-control__badge">Agregado</span>
      <div className="inline-cart-control__controls">
        <button
          aria-label="Quitar una unidad"
          className="inline-cart-control__btn"
          onClick={onDecrement}
          type="button"
        >
          -
        </button>
        <span className="inline-cart-control__value">{quantity}</span>
        <button
          aria-label="Agregar una unidad"
          className="inline-cart-control__btn"
          disabled={disableIncrement}
          onClick={onIncrement}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default InlineCartQuantityControl;
