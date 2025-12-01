
import axios from "axios";
import { toast } from "react-toastify";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refreshToken",
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json", // Mặc định là JSON
  },
  timeout: 10000, // Timeout sau 10s để tránh treo app
});

// =================================================================
// 1. INTERCEPTOR REQUEST: Gắn Token vào mọi request
// =================================================================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response, // Trả về response.data nếu muốn gọn, hoặc để nguyên response
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi 401 (Unauthorized) và chưa từng retry
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Đánh dấu đã thử retry để tránh vòng lặp vô tận

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // Gọi API Refresh Token (Dùng instance axios thường để tránh lặp interceptor)
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          { token: refreshToken }
        );

        if (res.status === 200 && res.data.access_token) {
          const newAccessToken = res.data.access_token;

          // 1. Lưu token mới
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

          // 2. Cập nhật header cho instance hiện tại
          axiosClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          // 3. Cập nhật header cho request đang bị lỗi
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // 4. Gọi lại request cũ
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu Refresh Token cũng hết hạn hoặc lỗi -> Logout
        console.error("Refresh token failed:", refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
       toast.error("Bạn không có quyền thực hiện hành động này.");
    }

    return Promise.reject(error);
  }
);

// Hàm Logout chung để tái sử dụng
const handleLogout = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
  setTimeout(() => {
      window.location.replace("/login"); 
  }, 1000);
  
};

export default axiosClient;