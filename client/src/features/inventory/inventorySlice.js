import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import {
    getAllInventories,
    getInventoryNoteDetail,
    importStock,
    exportStock,
    adjustStock,
    getVariantHistory
} from "./inventoryThunks";

const initialState = {
    // Dữ liệu chính
    inventoryNotes: [],     
    currentNote: null,      
    variantHistory: [],     

    // Trạng thái UI
    status: "idle",          
    error: null,            
    successMessage: null,   
};

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        // Reset lỗi và thông báo
        clearInventoryState: (state) => {
            state.error = null;
            state.successMessage = null;
            state.status = "idle";
        },
        // Reset chi tiết phiếu khi thoát modal/trang
        resetCurrentNote: (state) => {
            state.currentNote = null;
        },
        // Reset lịch sử khi đổi sản phẩm khác
        resetVariantHistory: (state) => {
            state.variantHistory = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // --- 1. GET ALL INVENTORIES (Danh sách phiếu) ---
            .addCase(getAllInventories.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.inventoryNotes = action.payload.data || action.payload; 
            })

            // --- 2. GET DETAIL (Chi tiết phiếu) ---
            .addCase(getInventoryNoteDetail.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.currentNote = action.payload;
            })

            // --- 3. IMPORT STOCK (Nhập kho) ---
            .addCase(importStock.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.successMessage = "Nhập kho thành công!";
                // Thêm phiếu mới vào đầu danh sách (để cập nhật UI ngay lập tức)
                state.inventoryNotes.unshift(action.payload);
            })

            // --- 4. EXPORT STOCK (Xuất kho) ---
            .addCase(exportStock.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.successMessage = "Xuất kho thành công!";
                state.inventoryNotes.unshift(action.payload);
            })

            // --- 5. ADJUST STOCK (Kiểm kê/Điều chỉnh) ---
            .addCase(adjustStock.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.successMessage = "Điều chỉnh kho thành công!";
                state.inventoryNotes.unshift(action.payload);
            })

            // --- 6. GET VARIANT HISTORY (Lịch sử SP) ---
            .addCase(getVariantHistory.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.variantHistory = action.payload;
            })

            // --- XỬ LÝ CHUNG CHO LOADING (PENDING) ---
            .addMatcher(isPending, (state) => {
                state.status = "loading";
                state.error = null;
                state.successMessage = null;
            })

            // --- XỬ LÝ CHUNG CHO LỖI (REJECTED) ---
            .addMatcher(isRejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || action.payload || action.error.message;
            });
    },
});

export const { clearInventoryState, resetCurrentNote, resetVariantHistory } = inventorySlice.actions;
export default inventorySlice.reducer;