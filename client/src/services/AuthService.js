import axiosClient from "./axiosClient";
const AuthService = {
    login: (data) => axiosClient.post("/auth/login", data,{
        params:{
           guest_id: localStorage.getItem("guestId")
        }
    }),
    loginWithGoogle: (token) =>axiosClient.post("/auth/google/login",
            { token },
            {
            params: {
                guest_id: localStorage.getItem("guestId"),
            },
            }
        ),

    loginWithFacebook: (token) =>
    axiosClient.post(
        "/auth/facebook/login",
        { token },
        {
        params: {
            guest_id: localStorage.getItem("guestId"),
        },
        }
    ),
    register: (data) => axiosClient.post("/auth/register", data),
    logout: () => axiosClient.post("/auth/logout"),
    forgotPassword: (email) => {
        console.log(email);
        return axiosClient.post("/auth/forgot-password", { email });
    },
    resetPassword: (data) => axiosClient.post("/auth/reset-password", data),
    getMe: () => axiosClient.post("/auth/me"),
}

export default AuthService;