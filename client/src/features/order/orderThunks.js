import { createAsyncThunk } from "@reduxjs/toolkit";
import OrderService from "../../services/orderService";

const handleError = (error, rejectWithValue) => {
  if (error.response) {
    const { data, status } = error.response;
    const isValidationErr = status === 422 || data?.code === 422;

    if (isValidationErr) {
      return rejectWithValue({
        errors: data.errors || {},
        message: data.message || "Dữ liệu không hợp lệ",
      });
    }

    return rejectWithValue({
      type: "general",
      message: data.message || "Lỗi server",
    });
  }

  return rejectWithValue({
    type: "general",
    message: error.message || "Không thể kết nối đến server.",
  });
};


// ADMIN
export const fetchAdminOrders = createAsyncThunk(
  "order/fetchAdminOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await OrderService.getAdminOrders();
      return response.data.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const fetchAdminOrderById = createAsyncThunk(
  "order/fetchAdminOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await OrderService.getAdminOrderById(id);
      return response.data.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);


// USER (CLIENT)
export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await OrderService.getUserOrders();
      return response.data.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const fetchUserOrderDetail = createAsyncThunk(
  "order/fetchUserOrderDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await OrderService.getUserOrderDetail(id);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await OrderService.createOrder(data);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async ({ id, reason}, { rejectWithValue }) => {
    try {
      const response = await OrderService.cancelOrder(id, reason);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);
