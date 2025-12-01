import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  createVariant,
  updateVariant,
  softDeleteVariant,
  createImage,
  softDeleteImage,
  setPrimaryImage,
  fetchProductHome
} from "./productThunks";

const initialState = {
  products: [],
  productDetail: null,
  productHome: [], 

  // Status management
  status: "idle",

  // Error management
  error: null,
  validationErrors: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = null;
      state.status = "idle";
    },
    resetProductDetail: (state) => {
      state.productDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- PRODUCT ACTIONS ---

      // 1. Fetch All
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload;
      })

      // 2. Fetch By ID
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.productDetail = action.payload;
      })

      // 3. Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products.unshift(action.payload);
      })

      // 4. Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Cập nhật trong danh sách
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        // Cập nhật trong detail nếu đang xem đúng sản phẩm đó
        if (state.productDetail && state.productDetail.id === action.payload.id) {
            const currentVariants = state.productDetail.variants;
            const currentImages = state.productDetail.images;
            state.productDetail = {
                ...action.payload,
                variants: currentVariants,
                images: currentImages
            };
        }
      })

      // 5. Toggle Product Status
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      // --- VARIANT ACTIONS (Tác động vào productDetail) ---

      .addCase(createVariant.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.productDetail) {
            // Đảm bảo mảng variants tồn tại
            if (!state.productDetail.variants) state.productDetail.variants = [];
            state.productDetail.variants.push(action.payload);
        }
      })

      .addCase(updateVariant.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.productDetail && state.productDetail.variants) {
            const index = state.productDetail.variants.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.productDetail.variants[index] = action.payload;
            }
        }
      })

      .addCase(softDeleteVariant.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.productDetail && state.productDetail.variants) {
            state.productDetail.variants = state.productDetail.variants.filter(
                v => v.id !== action.payload.id
            );
        }
      })

      // --- IMAGE ACTIONS (Tác động vào productDetail) ---

      .addCase(createImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.productDetail) {
            if (!state.productDetail.images) state.productDetail.images = [];
            state.productDetail.images.push(action.payload);
        }
      })

      .addCase(softDeleteImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.productDetail && state.productDetail.images) {
            state.productDetail.images = state.productDetail.images.filter(
                img => img.id !== action.payload.id
            );
        }
      })

      .addCase(setPrimaryImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.productDetail && state.productDetail.images) {
            state.productDetail.images.forEach(img => img.isPrimary = false);
            state.productDetail.images.find(img => img.id === action.payload.id).isPrimary = true;
        }
      })

      .addCase(fetchProductHome.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.productHome = action.payload;

      })

      // --- MATCHER (Pending & Rejected chung cho tất cả) ---
      .addMatcher(isPending, (state) => {
        state.status = "loading";
        state.error = null;
        state.validationErrors = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.status = "failed";
        if (action.payload?.errors) {
          state.validationErrors = action.payload.errors;
        } else if (action.payload?.message) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || "Đã có lỗi xảy ra";
        }
      });
  },
});

export const { clearErrors, resetProductDetail } = productSlice.actions;
export default productSlice.reducer;