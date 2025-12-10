import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import {
    fetchVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    applyVoucher
} from "./voucherThunks";

const initialState = {
    vouchers: [],          // Danh sách voucher quản lý (Admin)
    voucherDetail: null,   // Chi tiết voucher đang xem/sửa
    
    // Client State (nếu cần dùng chung trong slice này)
    appliedVoucher: null,  // Voucher đã áp dụng thành công cho đơn hàng
    
    // Status management
    status: "idle",      
    
    // Error management
    error: null,           // Lỗi chung (string)
    validationErrors: null // Lỗi validation (object)
};

const voucherSlice = createSlice({
    name: "voucher",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.validationErrors = null;
            state.status = "idle";
        },
        resetVoucherDetail: (state) => {
            state.voucherDetail = null;
        },
        // Action để xóa voucher đã áp dụng (dùng cho Client khi user muốn gỡ mã)
        removeAppliedVoucher: (state) => {
            state.appliedVoucher = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- 1. Fetch All ---
            .addCase(fetchVouchers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.vouchers = action.payload;
            })

            // --- 2. Create ---
            .addCase(createVoucher.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Thêm voucher mới vào đầu danh sách
                state.vouchers.unshift(action.payload);
            })

            // --- 3. Update ---
            .addCase(updateVoucher.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.vouchers.findIndex((v) => v.id === action.payload.id);
                if (index !== -1) {
                    state.vouchers[index] = action.payload;
                }
            })

            // --- 4. Delete ---
            .addCase(deleteVoucher.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.vouchers = state.vouchers.filter((v) => v.id !== action.payload.id);
            })

            // --- 5. Apply Voucher (Client) ---
            .addCase(applyVoucher.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.appliedVoucher = action.payload; 
            })

         
            
            // Xử lý Loading
            .addMatcher(isPending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })
            
            // Xử lý Error (bao gồm Validation Error)
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

export const { clearErrors, resetVoucherDetail, removeAppliedVoucher } = voucherSlice.actions;
export default voucherSlice.reducer;