import axiosClient from "./axiosClient";

const VoucherService = {
    //admin
    
    createVoucher: (data) => axiosClient.post("/admin/vouchers", data),
    updateVoucher: (id, data) => axiosClient.put(`/admin/vouchers/${id}`, data),
    deleteVoucher: (id) => axiosClient.delete(`/admin/vouchers/${id}`),
   
    //client
    getAllVouchers: () => axiosClient.get("/client/vouchers"),
    applyVoucher: (code, orderTotal) => axiosClient.post("/vouchers/apply", { code, orderTotal }),

};

export default VoucherService;