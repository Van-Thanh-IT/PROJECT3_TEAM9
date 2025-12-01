
import { createAsyncThunk } from "@reduxjs/toolkit";
import BrandService from "../../services/BrandService";


const handleError = (error, rejectWithValue) => {
  // 1. Lỗi có phản hồi từ server (Response)
  if (error.response) {
    const { data, status } = error.response;
    const isValidationErr = status === 422 || data?.code === 422;

    if (isValidationErr) {
      return rejectWithValue({
        errors: data.errors || {}, 
        message: data.message || 'Dữ liệu không hợp lệ',
      });
    }

    // Các lỗi khác
    return rejectWithValue({
      type: 'general',
      message: data.message || 'Lỗi server',
    });
  }

  // 2. Lỗi mạng / không có response
  return rejectWithValue({
    type: 'general',
    message: error.message || 'Không thể kết nối đến server.',
  });
};


export const fetchBrands = createAsyncThunk(
    "brands/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await BrandService.getAllBrands();
            return res.data.data;
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

export const fetchTrashedBrands = createAsyncThunk(
    "brands/fetchTrashed",
    async (_, { rejectWithValue }) => {
        try {
            const res = await BrandService.getTrashedBrands();
            return res.data.data;
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

export const createBrand = createAsyncThunk(
    "brands/create",
    async (data, { rejectWithValue }) => {
        try {
            const res = await BrandService.createBrand(data);
            return res.data; 
        } catch (err) {
            console.error(err);
            return handleError(err, rejectWithValue);
        }
    }
);

export const updateBrand = createAsyncThunk(
    "brands/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await BrandService.updateBrand(id, data);
            return res.data; 
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

export const softDeleteBrand = createAsyncThunk(
    "brands/softDelete",
    async (id, { rejectWithValue }) => {
        try {
            const res = await BrandService.softDeleteBrand(id);
            // Trả về id để reducer biết mà xóa khỏi list
            return { id, ...res.data }; 
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);

export const restoreBrand = createAsyncThunk(
    "brands/restore",
    async (id, { rejectWithValue }) => {
        try {
            const res = await BrandService.restoreBrand(id);
            return res.data; 
        } catch (err) {
            return handleError(err, rejectWithValue);
        }
    }
);