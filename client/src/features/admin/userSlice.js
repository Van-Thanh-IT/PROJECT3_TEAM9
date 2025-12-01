import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../../services/UserService';

// --- THUNKS (Xử lý API) ---

const handleError = (error, rejectWithValue) => {
  // 1. Lỗi có phản hồi từ server (Response)
  if (error.response) {
    const { data, status } = error.response;

    // Logic: Check HTTP status 422 HOẶC check code: 422 bên trong data (như trong ảnh)
    const isValidationErr = status === 422 || data?.code === 422;

    if (isValidationErr) {
      return rejectWithValue({
        type: 'validation',
        errors: data.errors || {}, // Lấy object errors từ ảnh
        message: data.message || 'Dữ liệu không hợp lệ',
      });
    }

    // Các lỗi khác
    return rejectWithValue({
      type: 'general',
      message: data.message || 'Lỗi server',
    });
  }

  // 2. Lỗi mạng / không có response
  return rejectWithValue({
    type: 'general',
    message: error.message || 'Không thể kết nối đến server.',
  });
};

// ================= USER THUNKS =================
export const fetchUsers = createAsyncThunk(
  'management/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllUsers();
      return response.data.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'management/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await UserService.getUserById(id);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const modifyUserStatus = createAsyncThunk(
  'management/modifyUserStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await UserService.updateUserStatus(id, status);
      return { id, status };
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

// ================= STAFF THUNKS =================
export const fetchStaffs = createAsyncThunk(
  'management/fetchStaffs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllStaffs();
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const fetchStaffById = createAsyncThunk(
  'management/fetchStaffById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await UserService.getStaffById(id);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

export const addStaff = createAsyncThunk(
  'management/addStaff',
  async (data, { rejectWithValue }) => {
    try {
      const response = await UserService.createStaff(data);
      return response.data;
    } catch (error) {
      console.error(error);
      // Ở đây sẽ bắt được lỗi validation 422 từ PHP
      return handleError(error, rejectWithValue);
    }
  }
);

export const editStaff = createAsyncThunk(
  'management/editStaff',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await UserService.updateStaff(id, data);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  }
);

// Hàm này giúp tái sử dụng logic xử lý lỗi cho 100 cái thunk
const handleRejected = (state, action) => {
  state.isLoading = false;
  state.isSubmitting = false; // Tắt loading submit form
  
  const payload = action.payload;
  
  if (payload?.type === 'validation') {
    // Nếu là lỗi validation, lưu vào biến riêng để hiển thị ở input
    state.validationErrors = payload.errors;
    state.message = payload.message; // "Dữ liệu không hợp lệ"
  } else {
    // Lỗi chung (500, mạng...)
    state.error = payload?.message || 'Có lỗi xảy ra';
  }
};

// --- SLICE ---

const initialState = {
  users: [],
  staffs: [],
  currentUser: null, // Lưu chi tiết 1 user khi getById
  currentStaff: null, // Lưu chi tiết 1 staff khi getById
  
  isLoading: false,      // Dùng cho việc fetch danh sách (GET)
  isSubmitting: false,   // Dùng cho việc submit form (POST, PUT) - quan trọng cho UX
  
  error: null,           // Lỗi chung (String)
  validationErrors: {},  // Lỗi validation từng trường (Object: { email: ['Email sai'], ... })
  message: '',           // Thông báo thành công (Toast)
};

const managementSlice = createSlice({
  name: 'user', // Đổi tên thành management cho chuẩn với file
  initialState,
  reducers: {
   clearErrors: (state) => {
      state.validationErrors = {};
      state.error = null;
      state.message = '';
    },
    resetCurrentItems: (state) => {
      state.currentUser = null;
      state.currentStaff = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 1. Fetch Users
      .addCase(fetchUsers.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, handleRejected)

      // 2. Fetch User By ID
      .addCase(fetchUserById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, handleRejected)

      // 3. Update User Status
     .addCase(modifyUserStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const user = state.users.find(s => s.id === id);
        if (user) user.status = status; 
      })

      .addCase(modifyUserStatus.rejected, handleRejected)

      // 4. Fetch Staffs
      .addCase(fetchStaffs.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchStaffs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffs = action.payload;
      })
      .addCase(fetchStaffs.rejected, handleRejected)

      // 5. Fetch Staff By ID
      .addCase(fetchStaffById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStaff = action.payload;
      })
      .addCase(fetchStaffById.rejected, handleRejected)

      // 6. Add Staff (Quan trọng: Xử lý loading submit và validation)
      // --- ADD STAFF ---
      .addCase(addStaff.pending, (state) => {
        state.isSubmitting = true;
        state.validationErrors = {}; // Reset lỗi cũ khi bắt đầu submit mới
        state.error = null;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.staffs.push(action.payload);
        state.message = 'Thêm nhân viên thành công';
      })
      .addCase(addStaff.rejected, (state, action) => {
        state.isSubmitting = false;
        const payload = action.payload;
        
        if (payload?.type === 'validation') {
          state.validationErrors = payload.errors; // Đẩy lỗi vào store
        } else {
          state.error = payload?.message;
        }
      })

      // 7. Edit Staff
      .addCase(editStaff.pending, (state) => { 
        state.isSubmitting = true; 
        state.validationErrors = {}; 
        state.error = null;
      })
      .addCase(editStaff.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Cập nhật mảng danh sách
        const index = state.staffs.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.staffs[index] = action.payload;
        // Cập nhật current item
        state.currentStaff = action.payload;
        state.message = 'Cập nhật nhân viên thành công';
      })
      
      .addCase(editStaff.rejected, handleRejected)
  },
});

// Hàm xử lý lỗi helper phải được định nghĩa trước hoặc nhúng vào trong file
// Ở ví dụ trên, tôi đã tách logic handleRejected để code gọn hơn.

export const { clearErrors, resetCurrentItems } = managementSlice.actions;
export default managementSlice.reducer;