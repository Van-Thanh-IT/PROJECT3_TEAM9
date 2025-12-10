import { createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../../services/UserService';

// Hàm xử lý lỗi chung
const handleError = (error, rejectWithValue) => {
  if (error.response) {
    const { data, status } = error.response;
    if (status === 422 || data?.code === 422) {
      return rejectWithValue({ type: 'validation', errors: data.errors || {}, message: data.message });
    }
    return rejectWithValue({ type: 'general', message: data.message || 'Lỗi server' });
  }
  return rejectWithValue({ type: 'general', message: error.message || 'Không thể kết nối server' });
};

// --- USER THUNKS ---
export const fetchUsers = createAsyncThunk('user/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await UserService.getAllUsers();
    return res.data.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const fetchUserById = createAsyncThunk('user/fetchUserById', async (id, { rejectWithValue }) => {
  try {
    const res = await UserService.getUserById(id);
    return res.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const modifyUserStatus = createAsyncThunk(
  'user/modifyUserStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await UserService.updateUserStatus(id, status);
      return { id, status };
    } catch (err) {
      return handleError(err, rejectWithValue);
    }
  }
);

// --- STAFF THUNKS ---
export const fetchStaffs = createAsyncThunk('user/fetchStaffs', async (_, { rejectWithValue }) => {
  try {
    const res = await UserService.getAllStaffs();
    return res.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const fetchStaffById = createAsyncThunk('user/fetchStaffById', async (id, { rejectWithValue }) => {
  try {
    const res = await UserService.getStaffById(id);
    return res.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const addStaff = createAsyncThunk('user/addStaff', async (data, { rejectWithValue }) => {
  try {
    const res = await UserService.createStaff(data);
    return res.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const editStaff = createAsyncThunk('user/editStaff', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await UserService.updateStaff(id, data);
    return res.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

// --- Cập nhật thông tin cá nhân ---
export const updateInfo = createAsyncThunk('user/updateInfo', async (data, { rejectWithValue }) => {
  try {
    const res = await UserService.updateInfoProfile(data);
    return res.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});
