import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  couponList: [],
  isLoading: false,
};


export const addCoupon = createAsyncThunk(
  "order/addCoupon",
  async (formData) => {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/coupons`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result?.data;
  }
);


export const fetchAllCoupons = createAsyncThunk(
  "order/fetchAllCoupons",
  async () => {
    const result = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupons`);
    return result?.data;
  }
);

export const editCoupon = createAsyncThunk(
  "order/editCoupon",
  async ({ id, formData }) => {
    const result = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/admin/coupons/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result?.data;
  }
);


export const deleteCoupon = createAsyncThunk(
  "order/deleteCoupon",
  async ({ id }) => {
    const result = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/admin/coupons/${id}`
    );
    return result?.data;
  }
);

// Slice
const AdminCouponSlice = createSlice({
  name: "adminCoupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.couponList = action.payload?.data || action.payload?.coupons || action.payload?.couponList || []; 
      })
      .addCase(fetchAllCoupons.rejected, (state) => {
        state.isLoading = false;
        state.couponList = [];
      });

   
  },
});

export default AdminCouponSlice.reducer;
