import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  orderId: null,
  error: null,
  couponDiscount: null,
  validatedCoupon: null
};

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Create new order with payment proof
 */
export const createCheckoutOrder = createAsyncThunk(
  'checkout/createOrder',
  async ({ orderData, transferImage }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append order data as JSON string
      formData.append('items', JSON.stringify(orderData.items));
      formData.append('address', JSON.stringify(orderData.address));
      formData.append('paymentMethod', orderData.paymentMethod);
      
      if (orderData.couponCode) {
        formData.append('couponCode', orderData.couponCode);
      }
      
      // Transfer payment method requires additional fields
      if (orderData.paymentMethod === 'Transfer') {
        formData.append('transferFullName', orderData.transferFullName || '');
        formData.append('transferAmount', orderData.transferAmount || '');
        
        // Append transfer image file (MUST be present for Transfer method)
        if (transferImage && transferImage instanceof File) {
          formData.append('transferImage', transferImage);
          console.log('✅ Transfer image appended:', transferImage.name, transferImage.size);
        } else {
          console.error('❌ Transfer image is missing or invalid:', transferImage);
        }
      }
      
      // Debug: Log FormData contents
      console.log('📤 Sending FormData with fields:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  - ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`);
        } else {
          console.log(`  - ${pair[0]}: ${typeof pair[1] === 'string' ? pair[1].substring(0, 50) : pair[1]}`);
        }
      }
      
      const response = await axios.post(
        `${API_BASE}/api/orders`,
        formData,
        {
          // Don't set Content-Type - let axios set it automatically with boundary
          headers: {
            // 'Content-Type': 'multipart/form-data', // Remove this - axios will set it automatically
          },
          withCredentials: true
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to create order' }
      );
    }
  }
);

/**
 * Validate coupon code
 */
export const validateCoupon = createAsyncThunk(
  'checkout/validateCoupon',
  async ({ code, orderAmount, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/coupons/validate`,
        { code, orderAmount, userId },
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Coupon validation failed' }
      );
    }
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    resetCheckout: (state) => {
      state.orderId = null;
      state.error = null;
      state.couponDiscount = null;
      state.validatedCoupon = null;
    },
    clearCoupon: (state) => {
      state.couponDiscount = null;
      state.validatedCoupon = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createCheckoutOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCheckoutOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderId = action.payload.data?.orderId || action.payload.orderId;
        state.error = null;
      })
      .addCase(createCheckoutOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create order';
      })
      
      // Validate coupon
      .addCase(validateCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.couponDiscount = action.payload.data?.discountAmount || 0;
        state.validatedCoupon = action.payload.data;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.couponDiscount = null;
        state.validatedCoupon = null;
      });
  }
});

export const { resetCheckout, clearCoupon } = checkoutSlice.actions;
export default checkoutSlice.reducer;

