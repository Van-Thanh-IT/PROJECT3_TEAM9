import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import goshipService from "../../services/goshipService";

// --- THUNKS ---

// 1. Lấy danh sách thành phố
export const fetchCities = createAsyncThunk(
  "goship/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await goshipService.getCities();
      return response.data; // Hoặc response nếu axios config trả về data trực tiếp
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi lấy danh sách thành phố");
    }
  }
);

// 2. Lấy danh sách quận huyện
export const fetchDistricts = createAsyncThunk(
  "goship/fetchDistricts",
  async (cityCode, { rejectWithValue }) => {
    try {
      const response = await goshipService.getDistricts(cityCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi lấy danh sách quận huyện");
    }
  }
);

// 3. Lấy danh sách phường xã
export const fetchWards = createAsyncThunk(
  "goship/fetchWards",
  async (districtCode, { rejectWithValue }) => {
    try {
      const response = await goshipService.getWards(districtCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi lấy danh sách phường xã");
    }
  }
);

// 4. Tính phí ship
export const calculateShippingFee = createAsyncThunk(
  "goship/calculateShippingFee",
  async (data, { rejectWithValue }) => {
    try {
      const response = await goshipService.calculateFee(data);
      // Backend trả về: { status: "success", data: { ...GHN_data... } }
      return response.data.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi tính phí vận chuyển");
    }
  }
);

// --- SLICE ---

const initialState = {
  cities: [],
  districts: [],
  wards: [],
  shippingFeeInfo: null,
  status: "idle", 
  error: null,
};

const goshipSlice = createSlice({
  name: "goship",
  initialState,
  reducers: {
    // Reset quận/huyện/xã khi chọn lại thành phố
    resetLocation: (state) => {
      state.districts = [];
      state.wards = [];
      state.shippingFeeInfo = null;
    },
    // Reset phường/xã khi chọn lại quận
    resetWards: (state) => {
      state.wards = [];
      state.shippingFeeInfo = null;
    },
    resetShippingFee: (state) => {
      state.shippingFeeInfo = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Cities
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload.data; // Goship API thường trả về mảng trong key data
      })
      // Districts
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.districts = action.payload.data;
      })
      // Wards
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.wards = action.payload.data;
      })
      // Calculate Fee
      .addCase(calculateShippingFee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(calculateShippingFee.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.shippingFeeInfo = action.payload; // Dữ liệu GHN đã lọc
      })
      .addCase(calculateShippingFee.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.shippingFeeInfo = null;
      });
  },
});

export const { resetLocation, resetWards, resetShippingFee } = goshipSlice.actions;
export default goshipSlice.reducer;