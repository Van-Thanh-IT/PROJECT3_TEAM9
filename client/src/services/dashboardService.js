import axiosClient from "./axiosClient";

const DashboardService = {
    getSummaryTotal: () => 
        axiosClient.get("/admin/dashboard/summary-total"),

    getSummary: () => 
        axiosClient.get("/admin/dashboard/summary"),

    getRevenue: (range = "30days") => 
        axiosClient.get("/admin/dashboard/revenue", { params: { range } }),

    getOrderStatus: (range = "30days") => 
        axiosClient.get("/admin/dashboard/order-status", { params: { range } }),

    getTopProducts: (range = "30days") => 
        axiosClient.get("/admin/dashboard/top-products", { params: { range } }),

    getInventoryFlow: (range = "30days") => 
        axiosClient.get("/admin/dashboard/inventory-flow", { params: { range } }),

    getInventoryValue: () => 
        axiosClient.get("/admin/dashboard/inventory-value"),

    getNewUsers: (range = "30days") => 
        axiosClient.get("/admin/dashboard/new-users", { params: { range } }),

    getActiveUsers: (range = "30days") => 
        axiosClient.get("/admin/dashboard/active-users", { params: { range } }),

    getTopCustomers: (range = "30days") => 
        axiosClient.get("/admin/dashboard/top-customers", { params: { range } }),

    getVoucherUsage: (range = "30days") => 
        axiosClient.get("/admin/dashboard/voucher-usage", { params: { range } }),
};

export default DashboardService;