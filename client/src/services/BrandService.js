import axiosClient from "./axiosClient";

const BrandService = {
    getAllBrands: () => axiosClient.get("/admin/brands"),
    getBrandById: (id) => axiosClient.get(`/admin/brands/${id}`),
    createBrand: (data) => axiosClient.post("/admin/brands", data,{
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    updateBrand: (id, data) => axiosClient.post(`/admin/brands/${id}`, data,{
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    softDeleteBrand: (id) => axiosClient.delete(`/admin/brands/${id}`),
    getTrashedBrands: () => axiosClient.get("/admin/brands/trash"),
    restoreBrand: (id) => axiosClient.post(`/admin/brands/${id}/restore`)
};

export default BrandService;