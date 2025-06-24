
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
};


export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        formData,
        { withCredentials: true }
      );
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data || { message: "Network error" }
      );
    }
  }
);



export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        formData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
    }
  }
);


export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/logout', {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Network error" }
      );
    }
  }
);




export const checkAuth = createAsyncThunk(
  'auth/checkauth',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/auth/check-auth',
        {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Expires': '0',
          },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Network error' }
      );
    }
  }
);







const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = !action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;

      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;

      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;

      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;

      })
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;


