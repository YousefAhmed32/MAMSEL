import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for brand operations
export const fetchAllBrands = createAsyncThunk(
  'brands/fetchAllBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/brands`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب العلامات التجارية');
    }
  }
);

export const fetchActiveBrands = createAsyncThunk(
  'brands/fetchActiveBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/brands/active`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في جلب العلامات التجارية النشطة');
    }
  }
);

export const createBrand = createAsyncThunk(
  'brands/createBrand',
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/brands`, brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في إنشاء العلامة التجارية');
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, brandData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/brands/${id}`, brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تحديث العلامة التجارية');
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'brands/deleteBrand',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/brands/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في حذف العلامة التجارية');
    }
  }
);

export const toggleBrandStatus = createAsyncThunk(
  'brands/toggleBrandStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/brands/${id}/toggle`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطأ في تغيير حالة العلامة التجارية');
    }
  }
);

const initialState = {
  brands: [],
  activeBrands: [],
  loading: false,
  error: null,
  success: null
};

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all brands
      .addCase(fetchAllBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.data;
      })
      .addCase(fetchAllBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch active brands
      .addCase(fetchActiveBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBrands = action.payload.data;
      })
      .addCase(fetchActiveBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create brand
      .addCase(createBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands.push(action.payload.data);
        state.activeBrands.push(action.payload.data);
        state.success = action.payload.message;
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update brand
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBrand = action.payload.data;
        state.brands = state.brands.map(brand => 
          brand._id === updatedBrand._id ? updatedBrand : brand
        );
        state.activeBrands = state.activeBrands.map(brand => 
          brand._id === updatedBrand._id ? updatedBrand : brand
        );
        state.success = action.payload.message;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete brand
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = state.brands.filter(brand => brand._id !== action.payload.id);
        state.activeBrands = state.activeBrands.filter(brand => brand._id !== action.payload.id);
        state.success = action.payload.message;
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle brand status
      .addCase(toggleBrandStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBrandStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBrand = action.payload.data;
        state.brands = state.brands.map(brand => 
          brand._id === updatedBrand._id ? updatedBrand : brand
        );
        
        if (updatedBrand.isActive) {
          // Add to active brands if not already there
          const existsInActive = state.activeBrands.find(brand => brand._id === updatedBrand._id);
          if (!existsInActive) {
            state.activeBrands.push(updatedBrand);
          }
        } else {
          // Remove from active brands
          state.activeBrands = state.activeBrands.filter(brand => brand._id !== updatedBrand._id);
        }
        
        state.success = action.payload.message;
      })
      .addCase(toggleBrandStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = brandsSlice.actions;
export default brandsSlice.reducer;
