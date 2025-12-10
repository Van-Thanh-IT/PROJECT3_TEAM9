import { createAsyncThunk } from "@reduxjs/toolkit";
import VoucherService from "../../services/voucherService"; // Đường dẫn tới file service của bạn

// Helper function để xử lý lỗi đồng bộ với Brand
const handleError = (error, rejectWithValue) => {
  if (error.response) {
    const { data, status } = error.response;
    const isValidationErr = status === 422 || data?.code === 422;

    if (isValidationErr) {
      return rejectWithValue({
        errors: data.errors || {},
        message: data.message || 'Dữ liệu không hợp lệ',
      });
    }

    return rejectWithValue({
      type: 'general',
      message: data.message || 'Lỗi server',
    });
  }

  // 2. Lỗi mạng 
  return rejectWithValue({
    type: 'general',
    message: error.message || 'Không thể kết nối đến server.',
  });
};

// --- THUNKS ---

export const fetchVouchers = createAsyncThunk(
    "vouchers/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await VoucherService.getAllVouchers();
            return res.data.data || res.data; 
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

export const createVoucher = createAsyncThunk(
    "vouchers/create",
    async (data, { rejectWithValue }) => {
        try {
            const res = await VoucherService.createVoucher(data);
            return res.data; 
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

export const updateVoucher = createAsyncThunk(
    "vouchers/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await VoucherService.updateVoucher(id, data);
            return res.data; 
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

export const deleteVoucher = createAsyncThunk(
    "vouchers/delete",
    async (id, { rejectWithValue }) => {
        try {
            await VoucherService.deleteVoucher(id);
            return { id }; // Trả về ID để Reducer lọc khỏi mảng
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

// Thunk dành cho Client (Áp dụng mã)
export const applyVoucher = createAsyncThunk(
    "vouchers/apply",
    async ({ code, orderTotal }, { rejectWithValue }) => {
        try {
            const res = await VoucherService.applyVoucher(code, orderTotal);
            return res.data; 
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);