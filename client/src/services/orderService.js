import axiosClient from "./axiosClient";

const OrderService = {

    // ADMIN
    getAdminOrders: () => axiosClient.get("/admin/orders"),
    getAdminOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),

    // USER (CLIENT)
    createOrder: (data) => axiosClient.post("/client/order", data),
    getUserOrders: () => axiosClient.get(`/users/me/orders`),
    getUserOrderDetail: (id) => axiosClient.get(`/users/me/orders/${id}`),
    cancelOrder: (id, reason) => axiosClient.delete(`/users/me/orders/${id}/cancel`,{
         data: { reason }
    }),
};

export default OrderService;
