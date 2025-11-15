import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock data for banners - يمكن استبدالها ببيانات حقيقية من API
const mockBanners = [
  {
    id: 1,
    type: "hero",
      title: "اكتشف مجموعة منتقاة بعناية من أرقى  العود العالمية",
    subtitle: "كل عود يحمل قصة فريدة",
    description: "عطور فاخرة بلا حدود",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&h=1080&fit=crop&crop=center",
    buttonText: "تسوق الآن",
    buttonLink: "/shop/listing",
    isActive: true,
    order: 1,
    createdAt: "2024-12-15",
    updatedAt: "2024-12-15"
  },
  {
    id: 2,
    type: "hero",
    title: "عطور نسائية أنيقة",
    subtitle: "للمرأة العصرية",
    description: "اكتشفي رائحتك المميزة",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1920&h=1080&fit=crop&crop=center",
    buttonText: "اكتشفي المجموعة",
    buttonLink: "/shop/listing?category=women",
    isActive: true,
    order: 2,
    createdAt: "2024-12-15",
    updatedAt: "2024-12-15"
  },
  {
    id: 3,
    type: "hero",
    title: "عطور رجالية قوية",
    subtitle: "للرجل المتميز",
    description: "رائحة تليق بشخصيتك",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1920&h=1080&fit=crop&crop=center",
    buttonText: "اكتشف المجموعة",
    buttonLink: "/shop/listing?category=men",
    isActive: true,
    order: 3,
    createdAt: "2024-12-15",
    updatedAt: "2024-12-15"
  }
];

const initialState = {
  banners: mockBanners,
  loading: false,
  error: null,
  selectedBanner: null
};

// Async thunks
export const fetchBanners = createAsyncThunk(
  'banner/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBanners;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBanner = createAsyncThunk(
  'banner/addBanner',
  async (bannerData, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newBanner = {
        ...bannerData,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      return newBanner;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banner/updateBanner',
  async ({ id, bannerData }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, bannerData: { ...bannerData, updatedAt: new Date().toISOString().split('T')[0] } };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banner/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  reducers: {
    setSelectedBanner: (state, action) => {
      state.selectedBanner = action.payload;
    },
    clearSelectedBanner: (state) => {
      state.selectedBanner = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add banner
      .addCase(addBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.push(action.payload);
      })
      .addCase(addBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex(banner => banner.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = { ...state.banners[index], ...action.payload.bannerData };
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter(banner => banner.id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedBanner, 
  clearSelectedBanner 
} = bannerSlice.actions;

export default bannerSlice.reducer;

