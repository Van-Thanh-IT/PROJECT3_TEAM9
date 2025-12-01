import axiosClient from "./axiosClient";

const CategoryService = {
    getAllCategories: () =>  axiosClient.get("/admin/categories"),
    getCategoryById: (id) => axiosClient.get(`/admin/categories/${id}`),
    createCategory: (data) => axiosClient.post("/admin/categories", data, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
        updateCategory: (id, data) => axiosClient.post(`/admin/categories/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
    toggleCategoryStatus: (id) => axiosClient.patch(`/admin/categories/${id}/toggle`),
};
export default CategoryService;