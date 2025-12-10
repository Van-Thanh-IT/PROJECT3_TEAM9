import { createSlice, isRejected } from "@reduxjs/toolkit";
import { 
    fetchAdminOrders,
    fetchAdminOrderById,
    fetchUserOrders,
    fetchUserOrderDetail,
    placeOrder,
    cancelOrder
} from "./orderThunks";

const initialState = {
    // USER
    userOrders: [],
    userOrderDetail: null,

    // ADMIN
    adminOrders: [],
    adminOrderDetail: null,

    status: "idle",
    error: null,
    validationErrors: null,
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.validationErrors = null;
            state.status = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            // -------------------------
            // FULFILLED
            // -------------------------
            .addCase(placeOrder.fulfilled, (state) => {
                state.status = "succeeded";
            })

            .addCase(fetchAdminOrderById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.adminOrderDetail = action.payload;
            })

            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.adminOrders = action.payload;
            })

            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.userOrders = action.payload;
            })

            .addCase(fetchUserOrderDetail.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.userOrderDetail = action.payload;
            })

            .addCase(cancelOrder.fulfilled, (state) => {
                state.status = "succeeded";
            })

            // -------------------------
            // PENDING (liệt kê hết)
            // -------------------------
            .addCase(placeOrder.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })
            .addCase(fetchAdminOrders.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })
            .addCase(fetchAdminOrderById.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })
            .addCase(fetchUserOrders.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })
            .addCase(fetchUserOrderDetail.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })

            .addCase(cancelOrder.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.validationErrors = null;
            })

            // -------------------------
            // REJECTED (giữ nguyên matcher)
            // -------------------------
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

export const { clearErrors } = orderSlice.actions;
export default orderSlice.reducer;
