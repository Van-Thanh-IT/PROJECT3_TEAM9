import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import {
    fetchSummaryTotal,
    fetchSummary,
    fetchRevenue,
    fetchOrderStatus,
    fetchTopProducts,
    fetchInventoryFlow,
    fetchInventoryValue,
    fetchNewUsers,
    fetchActiveUsers,
    fetchTopCustomers,
    fetchVoucherUsage,
} from "./dashboardThunks";

const initialState = {
    summaryTotal: null,
    summary: null,
    revenue: null,
    orderStatus: null,
    topProducts: [],
    inventoryFlow: null,
    inventoryValue: null,
    newUsers: [],
    activeUsers: [],
    topCustomers: [],
    voucherUsage: null,

    status: "idle",
    error: null,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.status = "idle";
        },
        resetDashboard: (state) => {
            Object.assign(state, initialState);
        }
    },

    extraReducers: (builder) => {
        builder
           .addCase(fetchSummaryTotal.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.summaryTotal = action.payload;
            })
            .addCase(fetchSummary.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.summary = action.payload;
            })
            .addCase(fetchRevenue.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.revenue = action.payload;
            })
            .addCase(fetchOrderStatus.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.orderStatus = action.payload;
            })
            .addCase(fetchTopProducts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.topProducts = action.payload;
            })
            .addCase(fetchInventoryFlow.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.inventoryFlow = action.payload;
            })
            .addCase(fetchInventoryValue.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.inventoryValue = action.payload;
            })
            .addCase(fetchNewUsers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.newUsers = action.payload;
            })
            .addCase(fetchActiveUsers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.activeUsers = action.payload;
            })
            .addCase(fetchTopCustomers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.topCustomers = action.payload;
            })
            .addCase(fetchVoucherUsage.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.voucherUsage = action.payload;
            });

        // --- pending chung ---
        builder.addMatcher(isPending, (state) => {
            state.status = "loading";
            state.error = null;
        });

        // --- lỗi chung ---
        builder.addMatcher(isRejected, (state, action) => {
            state.status = "failed";
            state.error =
                action.payload?.message ||
                action.error?.message ||
                "Đã xảy ra lỗi!";
        });
    },
});

export const { clearErrors, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
