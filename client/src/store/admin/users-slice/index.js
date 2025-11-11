import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const getAllUsers = createAsyncThunk(
  'adminUsers/getAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { role, status, search, page = 1, limit = 50 } = params;
      const queryParams = new URLSearchParams();
      
      if (role && role !== 'all') queryParams.append('role', role);
      if (status && status !== 'all') queryParams.append('status', status);
      if (search) queryParams.append('search', search);
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users?${queryParams.toString()}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const getUserDetails = createAsyncThunk(
  'adminUsers/getUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'adminUsers/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/status`,
        { status },
        { withCredentials: true }
      );
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const getUsersStats = createAsyncThunk(
  'adminUsers/getUsersStats',
  async (timeframe = '30d', { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users/stats/summary?timeframe=${timeframe}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users statistics');
    }
  }
);

const initialState = {
  users: [],
  userDetails: null,
  stats: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  },
  isLoading: false,
  error: null
};

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.users = [];
      })
      
      // Get user details
      .addCase(getUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetails = action.payload.data;
        state.error = null;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.userDetails = null;
      })
      
      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload.data;
        // Update user in the list
        const index = state.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        // Update user details if it's the same user
        if (state.userDetails && state.userDetails._id === updatedUser._id) {
          state.userDetails = { ...state.userDetails, ...updatedUser };
        }
        state.error = null;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get users stats
      .addCase(getUsersStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsersStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(getUsersStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserDetails, clearError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;

