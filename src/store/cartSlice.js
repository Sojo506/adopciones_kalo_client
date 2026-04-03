import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "cartItems";

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota exceeded – silently ignore */
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addItem(state, action) {
      const product = action.payload;
      const existing = state.items.find(
        (i) => i.idProducto === product.idProducto
      );

      if (existing) {
        const maxStock = product.stock ?? existing.stock ?? 0;
        if (existing.cantidad < maxStock) {
          existing.cantidad += 1;
        }
      } else {
        state.items.push({
          idProducto: product.idProducto,
          nombre: product.nombre,
          precio: product.precio,
          imageUrl: product.imageUrl,
          categoria: product.categoria,
          marca: product.marca,
          stock: product.stock,
          cantidad: 1,
        });
      }

      persistCart(state.items);
    },

    removeItem(state, action) {
      state.items = state.items.filter(
        (i) => i.idProducto !== action.payload
      );
      persistCart(state.items);
    },

    updateQuantity(state, action) {
      const { idProducto, cantidad } = action.payload;
      const itemIndex = state.items.findIndex((i) => i.idProducto === idProducto);

      if (itemIndex === -1) {
        persistCart(state.items);
        return;
      }

      if (cantidad <= 0) {
        state.items.splice(itemIndex, 1);
        persistCart(state.items);
        return;
      }

      state.items[itemIndex].cantidad = cantidad;

      persistCart(state.items);
    },

    clearCart(state) {
      state.items = [];
      persistCart(state.items);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.cantidad, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

export default cartSlice.reducer;
