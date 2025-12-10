import axiosClient from "./axiosClient";

const InventoryService = {
    getAllInventories: () => axiosClient.get("/admin/inventories"),
    getInventoryNoteDetail: (noteId) => axiosClient.get(`/admin/inventories/detail/${noteId}`),
    importStock: (data) => axiosClient.post("/admin/inventories/import", data),
    exportStock: (data) => axiosClient.post("/admin/inventories/export", data),
    adjustStock: (data) => axiosClient.post("/admin/inventories/adjust", data),
    getVariantHistory: (variantId) => axiosClient.get(`/admin/inventories/history/${variantId}`),
};
export default InventoryService;