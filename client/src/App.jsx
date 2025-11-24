import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "./components/auth/layout";

import AuthLogin from "./Pages/auth/login";
import AuthRegister from "./Pages/auth/register";

import AdminLayout from "./components/admin-view/layout";

import AdminDashboard from "./Pages/admin-view/dashboard";
import AdminFeatures from "./Pages/admin-view/feature";
import AdminBanners from "./Pages/admin-view/banners";
import AdminOrders from "./Pages/admin-view/orders";
import AdminProducts from "./Pages/admin-view/products";

import NotFound from "./Pages/not-found";
import ShoppingLayout from "./components/shopping-view/layout";
import ShoppingHome from "./Pages/shopping-view/home";
import ShoppingListing from "./Pages/shopping-view/listing";
import ShoppingAccount from "./Pages/shopping-view/account";
import ShoppingCheckout from "./Pages/shopping-view/checkout";
import ProductDetails from "./Pages/shopping-view/ProductDetails";
import Wishlist from "./Pages/shopping-view/Wishlist";

import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./Pages/unauth-page";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "./components/ui/skeleton";
import { fetchCartItems } from "./store/shop/cart-slice";

import PaypalReturnPage from "./Pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./Pages/shopping-view/payment-success";
import SearchProducts from "./Pages/shopping-view/search";
import AdminAnalysis from "./Pages/admin-view/analysis";
import AdminCoupon from "./Pages/admin-view/coupon";
import AdminUsers from "./Pages/admin-view/users";
import AdminReviews from "./Pages/admin-view/reviews";
import AdminSettings from "./Pages/admin-view/settings";
import AdminBrands from "./Pages/admin-view/brands";

function App() {
  const { user, isAuthenticated, isloading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [user, dispatch]);

  if (isloading)
    return <Skeleton className="h-[200px] bg-black w-[600px] rounded-full" />;

  return (
    <div className="flex flex-col overflow-hidden bg-background text-foreground">
      <Routes>

        {/* 🔥 اعمل redirect من / إلى /shop/home */}
        <Route path="/" element={<Navigate to="/shop/home" replace />} />

        {/* صفحات تسجيل الدخول - عامة */}
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        {/* صفحات الأدمن - محمية */}
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="analysis" element={<AdminAnalysis />} />
          <Route path="coupon" element={<AdminCoupon />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* صفحات الشوب */}
        <Route
          path="/shop/*"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          {/* صفحات عامة */}
          <Route index element={<ShoppingHome />} />
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="product/:productId" element={<ProductDetails />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="search" element={<SearchProducts />} />

          {/* صفحات محمية */}
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="checkout" element={<ShoppingCheckout />} />

          {/* صفحات الدفع */}
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
