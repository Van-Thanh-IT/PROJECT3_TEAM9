// src/redux/brand/brandSlice.js
import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import {
    fetchBrands,
    fetchTrashedBrands,
    createBrand,
    updateBrand,
    softDeleteBrand,
    restoreBrand,
} from "./brandThunks";

const initialState = {
    brands: [],          
    trash: [],           
    brandDetail: null,    
    
    status: "idle",      
    
    // Error management
    error: null,         
    validationErrors: null
};

const brandSlice = createSlice({
    name: "brand",
    initialState,
    reducers: {
        // Action để clear lỗi khi người dùng mở modal mới hoặc thay đổi input
        clearErrors: (state) => {
            state.error = null;
            state.validationErrors = null;
            state.status = "idle";
        },
        resetBrandDetail: (state) => {
            state.brandDetail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Xử lý logic thành công (Fulfilled) ---

            // 1. Get All
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.brands = action.payload; 
            })

            // 2. Get Trash
            .addCase(fetchTrashedBrands.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.trash = action.payload;
            })

            // 3. Create
            .addCase(createBrand.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.brands.unshift(action.payload); 
            })

            // 4. Update
            .addCase(updateBrand.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.brands.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.brands[index] = action.payload;
                }
            })

            // 5. Soft Delete
            .addCase(softDeleteBrand.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Xóa khỏi brands
                const deletedBrand = state.brands.find(b => b.id === action.payload.id);
                state.brands = state.brands.filter((b) => b.id !== action.payload.id);
                
                // (Tùy chọn) Thêm vào trash ngay lập tức nếu UI cần cập nhật realtime
                if (deletedBrand) {
                   state.trash.unshift(deletedBrand);
                }
            })

            // 6. Restore
            .addCase(restoreBrand.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Xóa khỏi trash
                state.trash = state.trash.filter((b) => b.id !== action.payload.id);
                // Thêm lại vào brands
                state.brands.push(action.payload);
            })

            // --- Kỹ thuật Clean Code: Sử dụng Matcher ---
            // Tự động bắt tất cả các action có đuôi /pending
            .addMatcher(isPending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })
            // Tự động bắt tất cả các action có đuôi /rejected
            .addMatcher(isRejected, (state, action) => {
                state.status = "failed";
                
                // Kiểm tra payload để phân loại lỗi
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

export const { clearErrors, resetBrandDetail } = brandSlice.actions;
export default brandSlice.reducer;