import { createAsyncThunk } from "@reduxjs/toolkit";
import CartService from "../../services/CartService"; 

// Lấy danh sách giỏ hàng
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const response = await CartService.getCart();
      return response.data.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thêm sản phẩm vào giỏ hàng
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (payload, thunkAPI) => {
    try {
      const response = await CartService.addCart(payload);
      localStorage.setItem("guestId", response.data.guest_id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (id, thunkAPI) => {
    try {
      await CartService.removeItem(id);
      return id; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updatequantity",
  async ({id, quantity}, thunkAPI) => {
    try {
      const response = await CartService.updateCartQuantity(id, quantity);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);