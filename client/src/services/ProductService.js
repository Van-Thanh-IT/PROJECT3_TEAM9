
import axiosClient from "./axiosClient";

const ProductService = {
    //product
    getAllProducts: () => axiosClient.get(`/admin/products`),
    getProductById: (id) => axiosClient.get(`/admin/products/${id}`),
    createProduct: (data) => axiosClient.post("/admin/products", data, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    updateProduct: (id, data) => axiosClient.post(`/admin/products/${id}`, data),
    toggleProductStatus: (id) => axiosClient.patch(`/admin/products/${id}/status`),

    //variant
    createVariant: (productId, data) => {
        console.log("nhận đc data",data);
        return axiosClient.post(`/admin/products/${productId}/variants`, data);
    },
    updateVariant: (productId, data) => axiosClient.put(`/admin/products/${productId}/variants`, data),
    softDeleteVariant: (variantId) => axiosClient.delete(`/admin/products/${variantId}/variants`),

    //image
    createImage: (productId, data) => axiosClient.post(`/admin/products/${productId}/images`, data,
        {
            headers: { "Content-Type": "multipart/form-data" }
        }
    ),
    softDeleteImage: (imageId) => axiosClient.delete(`/admin/products/${imageId}/images`),
    setPrimaryImage: (productId, imageId) => axiosClient.put(`/admin/products/${productId}/images/${imageId}/primary`),

    //client
    getProductHome: (page = 1) => axiosClient.get(`/client/products?page=${page}`),
    getProductDetail: (slug) => axiosClient.get(`/client/products/${slug}`),
    getBestSellingProducts: () => axiosClient.get(`/client/products/selling`),
    getProductReviewsForHome: () => axiosClient.get(`/client/products/reviews`),
    searchProduct: (params) => {
        return axiosClient.get('/client/products/search', { params });
    }

};

export default ProductService;