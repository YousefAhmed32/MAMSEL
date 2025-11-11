
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"


const initialState={
    isLoading:true,
    reviews:[]
}

export const addReview = createAsyncThunk(
    "/order/addReview",
    async (data) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/shop/review/add`,
        data)
        return response.data
    })

    export const getReviews = createAsyncThunk(
    "/order/getReviews",
    async (id) => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shop/review/${id}`)
        return response.data
    })


const reviewSlice = createSlice({
    name:'reviewSlice',
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
        // Do not update state.reviews here! Let getReviews handle it
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data; 
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
    }
})

export default reviewSlice.reducer