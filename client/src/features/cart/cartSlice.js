import { createSlice } from "@reduxjs/toolkit";
import { fetchCart, addToCart, removeCartItem, updateCartQuantity } from "./cartThunks";

// Hàm tính tổng số lượng SP trong giỏ
const calculateTotalQuantity = (items) => {
  return items.reduce((sum, item) => sum + Number(item.quantity), 0);
};

const initialState = {
  cartItems: [],
  isLoading: false,
  error: null,
  totalAmount: 0,
  totalQuantity: 0, // 👈 thêm trường để hiển thị trên Header
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.items || [];
        state.totalQuantity = calculateTotalQuantity(state.cartItems);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems.push(action.payload);
        state.totalQuantity = calculateTotalQuantity(state.cartItems);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;

        state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
        state.totalQuantity = calculateTotalQuantity(state.cartItems);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

  
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const { id, quantity } = action.payload;

        const item = state.cartItems.find(i => i.id === id);
        if (item) item.quantity = quantity;
        state.totalQuantity = calculateTotalQuantity(state.cartItems);
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
