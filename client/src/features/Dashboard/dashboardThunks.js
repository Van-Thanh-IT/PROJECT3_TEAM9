import { createAsyncThunk } from "@reduxjs/toolkit";
import DashboardService from "../../services/dashboardService";

export const fetchSummaryTotal = createAsyncThunk(
    "dashboard/fetchSummaryTotal",
    async () => {
        const res = await DashboardService.getSummaryTotal();
        return res.data.data;
    }
);

// Tổng quan (Không cần tham số)
export const fetchSummary = createAsyncThunk(
    "dashboard/fetchSummary",
    async () => {
        const res = await DashboardService.getSummary();
        return res.data.data;
    }
);

// Doanh thu
export const fetchRevenue = createAsyncThunk(
    "dashboard/fetchRevenue",
    async (range) => {
        const res = await DashboardService.getRevenue(range);
        return res.data.data;
    }
);

// Trạng thái đơn hàng
export const fetchOrderStatus = createAsyncThunk(
    "dashboard/fetchOrderStatus",
    async (range) => {
        const res = await DashboardService.getOrderStatus(range);
        return res.data.data;
    }
);

// Top sản phẩm bán chạy
export const fetchTopProducts = createAsyncThunk(
    "dashboard/fetchTopProducts",
    async (range) => {
        const res = await DashboardService.getTopProducts(range);
        return res.data.data;
    }
);


// Biến động kho
export const fetchInventoryFlow = createAsyncThunk(
    "dashboard/fetchInventoryFlow",
    async (range) => {
        const res = await DashboardService.getInventoryFlow(range);
        return res.data.data;
    }
);

// Giá trị tồn kho (Không cần tham số)
export const fetchInventoryValue = createAsyncThunk(
    "dashboard/fetchInventoryValue",
    async () => {
        const res = await DashboardService.getInventoryValue();
        return res.data.data;
    }
);

// User mới
export const fetchNewUsers = createAsyncThunk(
    "dashboard/fetchNewUsers",
    async (range) => {
        const res = await DashboardService.getNewUsers(range);
        return res.data.data;
    }
);

// User hoạt động
export const fetchActiveUsers = createAsyncThunk(
    "dashboard/fetchActiveUsers",
    async (range) => {
        const res = await DashboardService.getActiveUsers(range);
        return res.data.data;
    }
);

// Top khách hàng
export const fetchTopCustomers = createAsyncThunk(
    "dashboard/fetchTopCustomers",
    async (range) => {
        const res = await DashboardService.getTopCustomers(range);
        return res.data.data;
    }
);

// Thống kê dùng voucher
export const fetchVoucherUsage = createAsyncThunk(
    "dashboard/fetchVoucherUsage",
    async (range) => {
        const res = await DashboardService.getVoucherUsage(range);
        return res.data.data;
    }
);