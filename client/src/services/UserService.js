import axiosClient from "./axiosClient";

const UserService = {
    //admin
    getAllUsers: () => axiosClient.get("/admin/users"),
    getUserById: (id) => axiosClient.get(`/admin/users/${id}`),
    updateUserStatus: (id,status) => axiosClient.put(`/admin/users/${id}/status`, {status}),

    // manager staffs
    getAllStaffs: () => axiosClient.get("/admin/staffs"),
    getStaffById: (id) => axiosClient.get(`/admin/staffs/${id}`),
    createStaff: (data) => {
        return axiosClient.post("/admin/staffs", data, {
            headers: {
                "Content-Type": "multipart/form-data", // Bắt buộc để gửi file
            },
        });
    },
    updateStaff: (id, data) => {
        return axiosClient.post(`/admin/staffs/${id}?_method=PUT`, data, {
             headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
};

export default UserService;