import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



const initialState = {
    isLoading: false,
    productList: [],
    productDetails: null,
    brands: [],
    groups: [],
    priceRange: { minPrice: 0, maxPrice: 1000 }
}




export const fetchAllFilteredProducts = createAsyncThunk(
  'products/fetchAllProduct',
  async ({ filtersParams, sortParams }) => {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(filtersParams)) {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value !== null && value !== undefined && value !== '') {
        // Handle non-array values like minPrice, maxPrice
        params.set(key, value);
      }
    }
    
    if (sortParams) {
      params.set("sortBy", sortParams);
    }
    
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/products/get?${params.toString()}`
    );
    
    return result?.data;
  }
);

export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async () => {
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/products/brands`
    );
    return result?.data;
  }
);

export const fetchPriceRange = createAsyncThunk(
  'products/fetchPriceRange',
  async () => {
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/products/price-range`
    );
    return result?.data;
  }
);

export const fetchGroups = createAsyncThunk(
  'products/fetchGroups',
  async () => {
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/products/groups`
    );
    return result?.data;
  }
);



export const fetchProductDetails = createAsyncThunk(
  'pro ducts/fetchProductDetails',
  async (id) => {
  
    
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/products/get/${id}`
    );
    
    return result?.data;
  }
);


const shoppingProductSlice = createSlice({
  name: 'shoppingProducts',
  initialState,
  reducers: {
    setProductDetails: (state)=>{
      state.productDetails = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        console.log(action.payload)
        state.isLoading = false;
        state.productList = action.payload.data
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = []
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        console.log(action.payload)
        state.isLoading = false;
        state.productDetails = action.payload.data
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload.data || []
      })
      .addCase(fetchPriceRange.fulfilled, (state, action) => {
        state.priceRange = action.payload.data || { minPrice: 0, maxPrice: 1000 }
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.groups = action.payload.data || []
      })
  }
})

export const { setProductDetails } = shoppingProductSlice.actions
export default shoppingProductSlice.reducer
