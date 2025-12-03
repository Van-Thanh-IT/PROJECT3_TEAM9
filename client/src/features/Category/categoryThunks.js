import { createAsyncThunk } from "@reduxjs/toolkit";
import CategoryService from "../../services/CategoryService";

const handleError = (error, rejectWithValue) => {
  // 1. Lỗi có phản hồi từ server (Response)
  if (error.response) {
    const { data, status } = error.response;
    const isValidationErr = status === 422 || data?.code === 422;

    if (isValidationErr) {
      return rejectWithValue({
        type: 'validation',
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

export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await CategoryService.getAllCategories();
            return response.data.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const fetchCategoryById = createAsyncThunk(
    "category/fetchCategoryById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await CategoryService.getCategoryById(id);
            return response.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const createCategory = createAsyncThunk(
    "category/createCategory",
    async (data, { rejectWithValue }) => {
        try {
            const response = await CategoryService.createCategory(data);
            return response.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await CategoryService.updateCategory(id, data);
            return response.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);

export const toggleCategoryStatus = createAsyncThunk(
    "category/toggleStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await CategoryService.toggleCategoryStatus(id);
            return response.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    }
);


// client
export const fetchProductsByCategorySlug = createAsyncThunk(
    "category/fetchProductsByCategory",
    async(slug, {rejectWithValue}) => {
         try {
            const response = await CategoryService.getProductsByCategorySlug(slug);
            return response.data;
        } catch (error) {
            return handleError(error, rejectWithValue);
        }
    } 
)