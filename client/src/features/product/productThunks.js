import { createAsyncThunk } from "@reduxjs/toolkit";
import ProductService from "../../services/ProductService";

// Helper xử lý lỗi (giống mẫu Brand)
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

// --- PRODUCT THUNKS ---

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ProductService.getAllProducts();
      return res.data.data || res.data; 
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await ProductService.getProductById(id);
      return res.data.data || res.data;
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ProductService.createProduct(data);
      return res.data.data || res.data;
    } catch (err) {
        console.error(err);
      return handleError(err, rejectWithValue);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await ProductService.updateProduct(id, data);
      return res.data.data || res.data;
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
);

export const toggleProductStatus = createAsyncThunk(
  "products/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const res = await ProductService.toggleProductStatus(id);
      return res.data.data || res.data;
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
);

// --- VARIANT THUNKS ---

export const createVariant = createAsyncThunk(
  "products/createVariant",
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      const res = await ProductService.createVariant(productId, formData);
      return res.data.data || res.data; 
    } catch (err) {
      console.error(err);
      return handleError(err, rejectWithValue);
    }
  }
);

export const updateVariant = createAsyncThunk(
  "products/updateVariant",
  async ({ variantId, formData }, { rejectWithValue }) => {
    try {
      const res = await ProductService.updateVariant(variantId, formData);
      return res.data.data || res.data; 
    } catch (err) {
        console.error(err);
      return handleError(err, rejectWithValue);
    }
  }
);

export const softDeleteVariant = createAsyncThunk(
  "products/softDeleteVariant",
  async (variantId, { rejectWithValue }) => {
    try {
      const res = await ProductService.softDeleteVariant(variantId);
      return { id: variantId, ...res.data };
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
);

// --- IMAGE THUNKS ---
export const createImage = createAsyncThunk(
  "products/createImage",
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const res = await ProductService.createImage(productId, data);
      return res.data.data || res.data; 
    } catch (err) {
        console.error(err);
      return handleError(err, rejectWithValue);
    }
  }
);

export const softDeleteImage = createAsyncThunk(
  "products/softDeleteImage",
  async (imageId, { rejectWithValue }) => {
    try {
      const res = await ProductService.softDeleteImage(imageId);
      return { id: imageId, ...res.data };
    } catch (err) {
        console.error(err);
      return handleError(err, rejectWithValue);
    }
  }
);

export const setPrimaryImage = createAsyncThunk(
  "products/setPrimaryImage",
  async ({ productId, imageId }, { rejectWithValue }) => {
    try {
      const res = await ProductService.setPrimaryImage(productId, imageId);
      return res.data.data || res.data; 
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
);


// client
export const fetchProductHome = createAsyncThunk(
  "products/productHome",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ProductService.getProductHome();
      return res.data.data || res.data; 
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
)

export const fetchProductDetail = createAsyncThunk(
  "products/productDetail",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await ProductService.getProductDetail(slug);
      return res.data.data || res.data; 
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
)