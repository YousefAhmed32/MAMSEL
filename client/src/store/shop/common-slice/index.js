import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
  featureImageListMobile: [],
}



export const getFeatureImage = createAsyncThunk(
  "order/getFeatureImage",
  async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/common/feature/get/desktop`);
    return response.data;
  }
);

export const getFeatureImageMobile = createAsyncThunk(
  "order/getFeatureImageMobile",
  async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/common/feature/get/mobile`);
    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "order/addFeatureImage",
  async ({ image, device }) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/common/feature/add`, {
      image,
      device, // ✅ include device: 'desktop' or 'mobile'
    });
    return response.data;
  }
);


export const addFeatureImageMobile = createAsyncThunk(
  "order/addFeatureImageMobile",
  async ({ image, device }) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/common/feature/add`, {
      image,
      device,
    });
    return response.data;
  }
);

export const deleteFeatureImages = createAsyncThunk(
  "order/deleteFeatureImages",
  async (id) => {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/common/feature/delete/${id}`);
    return { id, ...response.data };
  }
)

const commonFeature = createSlice({
  name: 'commonFeature',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getFeatureImage.pending, (state) => {
      state.isLoading = true;

    }).addCase(getFeatureImage.fulfilled, (state, action) => {
      state.isLoading = false;
      state.featureImageList = action.payload.data;

    }).addCase(getFeatureImage.rejected, (state) => {
      state.isLoading = false;
      state.featureImageList = []
    })
      .addCase(getFeatureImageMobile.pending, (state) => {
        state.isLoading = true;

      }).addCase(getFeatureImageMobile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageListMobile = action.payload.data;

      })
      .addCase(getFeatureImageMobile.rejected, (state) => {
        state.isLoading = false;
        state.featureImageListMobile = []
      }).addCase(deleteFeatureImages.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.featureImageList = state.featureImageList.filter(item => item._id !== id);
        state.featureImageListMobile = state.featureImageListMobile.filter(item => item._id !== id);
      })

  }

})

export default commonFeature.reducer