import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  const path = location.pathname;

  // ❌ مفيش أي تحويل من "/" دلوقتي — الموقع يفتح طبيعي
  // Public routes that don't require login
  const publicRoutes = [
    "/",
    "/shop/home",
    "/auth/login",
    "/auth/register",
    "/paypal-return",
    "/payment-success"
  ];

  const isPublic = publicRoutes.some(route => path.startsWith(route));

  // If user is NOT logged in and tries to access private route → redirect to login
  if (!isAuthenticated && !isPublic) {
    return <Navigate to="/auth/login" state={{ from: path }} replace />;
  }

  // If user IS logged in and tries to go to login/register → redirect him to his dashboard
  if (isAuthenticated && (path.includes("/login") || path.includes("/register"))) {
    const savedPath = location.state?.from;

    if (savedPath && !savedPath.includes("/auth")) {
      return <Navigate to={savedPath} replace />;
    }

    return user?.role === "admin"
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/shop/home" replace />;
  }

  // User is NOT admin but tries to access admin routes → block
  if (isAuthenticated && user?.role !== "admin" && path.includes("/admin")) {
    return <Navigate to="/unauth-page" />;
  }

  // Admin tries to access shop pages
  if (isAuthenticated && user?.role === "admin" && path.includes("/shop")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
