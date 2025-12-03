import { createSlice } from "@reduxjs/toolkit";
import { fetchCart, addToCart, removeCartItem, updateCartQuantity } from "./cartThunks";

const initialState = {
  cartItems: [], 
  isLoading: false,
  error: null,
  totalAmount: 0, 
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Các action đồng bộ thường (nếu cần)
    clearCartState: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Xử lý fetchCart ---
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Xử lý addToCart ---
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems.push(action.payload); 
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Xử lý removeCartItem ---
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Lọc bỏ item có id trùng với id đã xóa (action.payload)
        state.cartItems = state.cartItems.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

     .addCase(updateCartQuantity.pending, (state) => {
  // state.isLoading = true; // bỏ dòng này
    })
    .addCase(updateCartQuantity.fulfilled, (state, action) => {
    // state.isLoading = false; // bỏ dòng này
    const { id, quantity } = action.payload;
    const item = state.cartItems.find(i => i.id === id);
    if (item) item.quantity = quantity;
    })
    .addCase(updateCartQuantity.rejected, (state, action) => {
    state.error = action.payload;
    });


  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;