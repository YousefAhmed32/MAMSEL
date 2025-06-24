import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
};

export const addNewProduct = createAsyncThunk(
  'products/addNewProduct',
  async (formData) => {
    const result = await axios.post(
      'http://localhost:5000/api/admin/products/add',
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

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ id, formData }) => {
    const result = await axios.put(
      `http://localhost:5000/api/admin/products/edit/${id}`,
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

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async ({ id }) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/products/delete/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result?.data;
  }
);

export const fetchAllProduct = createAsyncThunk(
  'products/fetchAllProduct',
  async (formData) => {
    const result = await axios.get(
      'http://localhost:5000/api/admin/products/get',
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
