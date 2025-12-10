import { createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import {
    fetchUsers,
    fetchStaffs,
    fetchStaffById,
    fetchUserById,
    modifyUserStatus,
    updateInfo,
    addStaff,
    editStaff
} from './userThunks';

const initialState = {
  users: [],
  staffs: [],
  currentUser: null,
  currentStaff: null,
  status: 'idle',         
  error: null,
  validationErrors: null,
  message: '',              
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = null;
      state.status = 'idle';
      state.message = '';
    },
    resetCurrentItems: (state) => {
      state.currentUser = null;
      state.currentStaff = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FULFILLED ---
      // USERS
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(modifyUserStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const user = state.users.find(u => u.id === action.payload.id);
        if (user) user.status = action.payload.status;
      })

      // STAFFS
      .addCase(fetchStaffs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staffs = action.payload;
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentStaff = action.payload;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staffs.push(action.payload);
        state.message = 'Thêm nhân viên thành công';
      })
      .addCase(editStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.staffs.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.staffs[index] = action.payload;
        state.currentStaff = action.payload;
        state.message = 'Cập nhật nhân viên thành công';
      })
      .addCase(updateInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = 'Cập nhật thông tin cá nhân thành công';
      })

      // --- MATCHERS ---
    .addMatcher(isPending, (state) => {
            state.status = "loading";
            state.error = null;
            state.validationErrors = null;
        })
        .addMatcher(isRejected, (state, action) => {
            state.status = "failed";
                
                // Kiểm tra payload để phân loại lỗi
             if (action.payload?.errors) {
                state.validationErrors = action.payload.errors;
            } else if (action.payload?.message) {
                state.error = action.payload.message;
            } else {
                state.error = action.error.message || "Đã có lỗi xảy ra";
            }
        });
  },
});

export const { clearErrors, resetCurrentItems } = userSlice.actions;
export default userSlice.reducer;
