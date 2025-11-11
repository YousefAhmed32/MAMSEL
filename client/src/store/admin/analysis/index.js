
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

export const getAdminDashboardSummary = createAsyncThunk(
  '/order/getAdminDashboardSummary',
  async (timeframe = "monthly") => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/analysis/orders/get?timeframe=${timeframe}`);
    return response.data;
  }
);



    const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: {
    loading: false,
    error: null,
    summary: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdminDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data;
      })
      .addCase(getAdminDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default adminDashboardSlice.reducer;