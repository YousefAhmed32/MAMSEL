import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
};

export const addNewProduct = createAsyncThunk(
  'products/addNewProduct',
  async (formData) => {
    // Create FormData object for multipart/form-data
    const data = new FormData();
    
    // Append product fields
    if (formData.title) data.append('title', formData.title);
    if (formData.description) data.append('description', formData.description);
    if (formData.price) data.append('price', formData.price);
    if (formData.category) data.append('category', formData.category);
    if (formData.brand) data.append('brand', formData.brand);
    if (formData.salePrice) data.append('salePrice', formData.salePrice);
    if (formData.totalStock) data.append('totalStock', formData.totalStock);
    if (formData.size) data.append('size', formData.size);
    if (formData.fragranceType) data.append('fragranceType', formData.fragranceType);
    if (formData.gender) data.append('gender', formData.gender);
    
    // Handle image files
    // If formData has image files (from File objects), append them
    if (formData.imageFiles && Array.isArray(formData.imageFiles)) {
      formData.imageFiles.forEach((file) => {
        if (file instanceof File) {
          data.append('images', file);
        }
      });
    }
    
    // If formData has a single image file
    if (formData.imageFile && formData.imageFile instanceof File) {
      data.append('images', formData.imageFile);
    }
    
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/products/add`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return result?.data;
  }
);

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ id, formData }) => {
    // Create FormData object for multipart/form-data
    const data = new FormData();
    
    // Append product fields
    if (formData.title !== undefined) data.append('title', formData.title);
    if (formData.description !== undefined) data.append('description', formData.description);
    if (formData.price !== undefined) data.append('price', formData.price);
    if (formData.category !== undefined) data.append('category', formData.category);
    if (formData.brand !== undefined) data.append('brand', formData.brand);
    if (formData.salePrice !== undefined) data.append('salePrice', formData.salePrice);
    if (formData.totalStock !== undefined) data.append('totalStock', formData.totalStock);
    if (formData.size !== undefined) data.append('size', formData.size);
    if (formData.fragranceType !== undefined) data.append('fragranceType', formData.fragranceType);
    if (formData.gender !== undefined) data.append('gender', formData.gender);
    if (formData.keepOldImages !== undefined) data.append('keepOldImages', formData.keepOldImages);
    
    // Handle image files if provided
    if (formData.imageFiles && Array.isArray(formData.imageFiles)) {
      formData.imageFiles.forEach((file) => {
        if (file instanceof File) {
          data.append('images', file);
        }
      });
    }
    
    if (formData.imageFile && formData.imageFile instanceof File) {
      data.append('images', formData.imageFile);
    }
    
    const result = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/admin/products/edit/${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return result?.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId) => {
    // Handle both object format { id } and direct ID
    const id = typeof productId === 'object' ? productId.id : productId;
    
    const result = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/admin/products/delete/${id}`
    );
    return result?.data;
  }
);

export const fetchAllProduct = createAsyncThunk(
  'products/fetchAllProduct',
  async (formData) => {
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/admin/products/get`,
      formData
    );
    return result?.data;
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProduct.fulfilled, (state, action) => {
        console.log(action.payload);
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllProduct.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      });
  },
});

export default AdminProductsSlice.reducer;
