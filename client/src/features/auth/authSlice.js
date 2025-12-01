import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "../../services/AuthService";

// Key lưu trong LocalStorage
const STORAGE_KEY = "access_token";

// =================================================================
// 1. THUNKS (Giữ nguyên logic gọi API, chỉ sửa nhẹ phần logout)
// =================================================================

// --- Đăng ký ---
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await AuthService.register(userData);
      return response.data;
    } catch (error) {
      let message = "Đã có lỗi xảy ra";
      if (error.response && error.response.data) {
        const { data } = error.response;
        if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            message = errorMessages[0];
        } else if (data.message) {
            message = data.message;
        }
      } else {
        message = error.message;
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Đăng nhập (Local) ---
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await AuthService.login(userData);
      if (response.data.access_token) {
        localStorage.setItem(STORAGE_KEY, response.data.access_token);
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Đăng nhập Google ---
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (token, thunkAPI) => {
    try {
      const response = await AuthService.loginWithGoogle(token);
      if (response.data.access_token) {
        localStorage.setItem(STORAGE_KEY, response.data.access_token);
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Google Login Failed");
    }
  }
);

// --- Đăng nhập Facebook ---
export const loginWithFacebook = createAsyncThunk(
  "auth/loginWithFacebook",
  async (token, thunkAPI) => {
    try {
      const res = await AuthService.loginWithFacebook(token);
      if (res.data.access_token) localStorage.setItem(STORAGE_KEY, res.data.access_token);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Facebook login failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await AuthService.forgotPassword(email);
      return res.data;
    } catch (error) {
      console.error(error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.response?.data?.errors.email[0]);
    }
  }
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, thunkAPI) => {
    try {
      const res = await AuthService.resetPassword(data);
      return res.data;
    } catch (error) {
      console.error(error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.response?.data?.errors.password[0]);
    }
  }
)

// --- Đăng xuất ---
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await AuthService.logout();
  } catch (error) {
    console.error(error);
  } finally {
    localStorage.removeItem(STORAGE_KEY);
  }
});

// --- Lấy thông tin user (F5 trang) ---
export const getMe = createAsyncThunk("auth/getMe", async (_, thunkAPI) => {
  try {
    const response = await AuthService.getMe();
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// =================================================================
// 2. SLICE (Cập nhật xử lý Roles và Permissions)
// =================================================================

const initialState = {
  user: null,
  roles: [],       
  permissions: [], 
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Register ---
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Đăng ký thành công! Vui lòng đăng nhập.";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- Login Local ---
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isLoggedIn = true;
        
        // CẬP NHẬT: Lấy đúng trường từ API trả về (khớp với respondWithToken bên Laravel)
        state.user = action.payload.user_info; 
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || []; // Nếu login có trả về permissions
        
        state.message = "Đăng nhập thành công";
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.roles = [];      
        state.permissions = []; 
        state.isLoggedIn = false;
      })

      // --- Login Google ---
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isLoggedIn = true;
        console.log(action.payload.roles);
        // CẬP NHẬT
        state.user = action.payload.user_info;
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- Login Facebook ---
      .addCase(loginWithFacebook.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isLoggedIn = true;
        
        // CẬP NHẬT
        state.user = action.payload.user_info;
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- Logout ---
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.roles = [];      
        state.permissions = []; 
        state.isLoggedIn = false;
        state.isSuccess = false;
        state.message = "";
      })

      // --- Get Me (Quan trọng nhất để load quyền) ---
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        
        // CẬP NHẬT: Khớp với API me() trả về { user, roles, permissions }
        state.user = action.payload.user; 
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.roles = [];
        state.permissions = [];
      })

      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;