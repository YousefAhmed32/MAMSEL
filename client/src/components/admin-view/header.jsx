import { AlignJustify, LogOut, Settings, Bell, Home, Search, RefreshCw, Package, ShoppingCart, Users, Ticket, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutUser } from "@/store/auth-slice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "../ui/theme-toggle";
import NotificationSystem from "../ui/notification-system";
import OrderNotifications from "../ui/order-notifications";
import LanguageSwitcher from "./language-switcher";
import { useState, useEffect, useRef } from "react";
import { getAllUsers } from "@/store/admin/users-slice";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice.js";
import { fetchAllCoupons } from "@/store/admin/coupon";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { orderList } = useSelector((state) => state.adminOrder);
  const { couponList } = useSelector((state) => state.adminCoupon);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    products: [],
    orders: [],
    users: [],
    coupons: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  async function handleLogout() {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  }

  function handleRefresh() {
    window.location.reload();
  }

  function getPageTitle() {
    const path = location.pathname;
    const titles = {
      '/admin/dashboard': t('header.pageTitles.dashboard'),
      '/admin/analysis': t('header.pageTitles.analysis'),
      '/admin/banners': t('header.pageTitles.banners'),
      '/admin/products': t('header.pageTitles.products'),
      '/admin/orders': t('header.pageTitles.orders'),
      '/admin/users': t('header.pageTitles.users'),
      '/admin/coupon': t('header.pageTitles.coupon'),
      '/admin/brands': t('header.pageTitles.brands'),
    };
    return titles[path] || t('header.pageTitles.dashboard');
  }

  // Helper function to get initials
  function getInitials(userName) {
    if (!userName) return "AD";
    const nameStr = String(userName).trim();
    if (!nameStr || nameStr.length === 0) return "AD";
    const chars = Array.from(nameStr);
    if (chars.length === 0) return "AD";
    return chars.slice(0, 2).join("").toUpperCase() || "AD";
  }

  // Load orders and coupons when search opens
  useEffect(() => {
    if (isSearchOpen) {
      if (!orderList || orderList.length === 0) {
        dispatch(getAllOrdersForAdmin());
      }
      if (!couponList || couponList.length === 0) {
        dispatch(fetchAllCoupons());
      }
    }
  }, [isSearchOpen, dispatch, orderList, couponList]);

  // Search function
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ products: [], orders: [], users: [], coupons: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const query = searchQuery.trim().toLowerCase();
        const results = {
          products: [],
          orders: [],
          users: [],
          coupons: []
        };

        // Search Products
        try {
          const productsResponse = await dispatch(
            fetchAllFilteredProducts({ 
              filtersParams: { keyword: query }, 
              sortParams: 'price-lowtohigh' 
            })
          );
          
          if (productsResponse.payload) {
            const payload = productsResponse.payload;
            if (payload.success && payload.data && Array.isArray(payload.data)) {
              results.products = payload.data.slice(0, 5);
            } else if (Array.isArray(payload.data)) {
              results.products = payload.data.slice(0, 5);
            } else if (Array.isArray(payload)) {
              results.products = payload.slice(0, 5);
            }
          }
        } catch (error) {
          console.error('Error searching products:', error);
          try {
            const productsResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/shop/search/${encodeURIComponent(query)}`,
              { withCredentials: true }
            );
            if (productsResponse.data?.success && productsResponse.data?.data) {
              results.products = Array.isArray(productsResponse.data.data) 
                ? productsResponse.data.data.slice(0, 5)
                : [];
            }
          } catch (fallbackError) {
            console.error('Fallback search also failed:', fallbackError);
          }
        }

        // Search Orders
        const currentOrderList = orderList || [];
        if (currentOrderList.length > 0) {
          results.orders = currentOrderList
            .filter(order => {
              if (!order || !order._id) return false;
              const orderId = order._id.toString().toLowerCase();
              const status = (order.orderStatus || '').toLowerCase();
              const paymentMethod = (order.payment?.method || '').toLowerCase();
              const userId = (order.userId?.toString() || '').toLowerCase();
              return orderId.includes(query) || 
                     status.includes(query) || 
                     paymentMethod.includes(query) ||
                     userId.includes(query);
            })
            .slice(0, 5);
        }

        // Search Users
        try {
          const usersResponse = await dispatch(getAllUsers({ search: query, limit: 5 }));
          if (usersResponse.payload?.users && Array.isArray(usersResponse.payload.users)) {
            results.users = usersResponse.payload.users;
          } else if (usersResponse.payload?.data && Array.isArray(usersResponse.payload.data)) {
            results.users = usersResponse.payload.data;
          }
        } catch (error) {
          console.error('Error searching users:', error);
        }

        // Search Coupons
        const currentCouponList = couponList || [];
        if (currentCouponList.length > 0) {
          results.coupons = currentCouponList
            .filter(coupon => {
              if (!coupon) return false;
              const code = (coupon.code || '').toLowerCase();
              return code.includes(query);
            })
            .slice(0, 5);
        }

        setSearchResults(results);
        setIsSearching(false);
      } catch (error) {
        console.error('Search error:', error);
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, dispatch, orderList, couponList]);

  const handleResultClick = (type, item) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    
    switch (type) {
      case 'product':
        navigate(`/admin/products`);
        break;
      case 'order':
        navigate(`/admin/orders`);
        break;
      case 'user':
        navigate(`/admin/users`);
        break;
      case 'coupon':
        navigate(`/admin/coupon`);
        break;
      default:
        break;
    }
  };

  const totalResults = searchResults.products.length + 
                      searchResults.orders.length + 
                      searchResults.users.length + 
                      searchResults.coupons.length;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <Button
          onClick={() => setOpen(true)}
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/20 transition-all duration-200 hover:scale-110"
        >
          <AlignJustify className="w-5 h-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex items-center gap-3 min-w-0">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/20 transition-all duration-200 hover:scale-110 hidden sm:flex"
          >
            <Home className="w-4 h-4" />
          </Button>
          
          <div className="hidden md:block min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="md:hidden">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
              {getPageTitle()}
            </h1>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search */}
        <DropdownMenu open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="relative h-10 w-full sm:w-[240px] md:w-[320px] justify-start text-sm text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-[#D4AF37]/50 dark:hover:border-[#D4AF37]/50 transition-all duration-200 group"
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
            >
              <Search className="mr-2 h-4 w-4 group-hover:text-[#D4AF37] transition-colors" />
              <span className="hidden sm:inline">{t('header.search.placeholder')}</span>
              <span className="sm:hidden">{t('header.search.placeholderMobile')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[90vw] sm:w-[420px] md:w-[520px] p-0 max-h-[500px] overflow-y-auto bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-800 shadow-xl" 
            align="end"
            sideOffset={5}
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  placeholder={t('header.search.placeholderFull')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                  style={{ 
                    paddingRight: '2.5rem', 
                    paddingLeft: searchQuery ? '2.5rem' : '0.75rem' 
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-7 w-7 z-20 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSearchQuery("");
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
                  <span className="mr-2 text-gray-500 dark:text-gray-400">{t('header.search.searching')}</span>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('header.search.minChars')}
                </div>
              ) : totalResults === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('header.search.noResults')}
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Products Results */}
                  {searchResults.products.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('header.search.products')} ({searchResults.products.length})
                      </div>
                      {searchResults.products.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleResultClick('product', product)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 group"
                        >
                          <Package className="h-4 w-4 text-[#D4AF37] flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">{product.title || product.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.category}</div>
                          </div>
                          <div className="text-sm font-semibold text-[#D4AF37] flex-shrink-0">${product.price}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Orders Results */}
                  {searchResults.orders.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('header.search.orders')} ({searchResults.orders.length})
                      </div>
                      {searchResults.orders.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => handleResultClick('order', order)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 group"
                        >
                          <ShoppingCart className="h-4 w-4 text-[#D4AF37] flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {t('header.search.order')} #{order._id?.toString().slice(-8)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.orderStatus || 'pending'} • ${order.totalAmount || order.total || 0}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Users Results */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('header.search.users')} ({searchResults.users.length})
                      </div>
                      {searchResults.users.map((userItem) => (
                        <div
                          key={userItem._id}
                          onClick={() => handleResultClick('user', userItem)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 group"
                        >
                          <Users className="h-4 w-4 text-[#D4AF37] flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">{userItem.userName || userItem.name || userItem.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{userItem.email}</div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{userItem.role || 'user'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coupons Results */}
                  {searchResults.coupons.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        الكوبونات ({searchResults.coupons.length})
                      </div>
                      {searchResults.coupons.map((coupon) => (
                        <div
                          key={coupon._id}
                          onClick={() => handleResultClick('coupon', coupon)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 group"
                        >
                          <Ticket className="h-4 w-4 text-[#D4AF37] flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">{coupon.code}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {coupon.discountType === 'percent' ? `${coupon.amount}%` : `$${coupon.amount}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/20 transition-all duration-200 hover:scale-110"
          title={t('header.refresh')}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Language Switcher */}
        {/* <LanguageSwitcher /> */}

        {/* Theme Toggle */}
        {/* <ThemeToggle /> */}
        
        {/* Notifications */}
        <div className="hidden sm:block">
          <NotificationSystem />
        </div>
        
        <div className="hidden sm:block">
          <OrderNotifications />
        </div>
        
        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/20 transition-all duration-200 hover:scale-110 hidden md:flex"
          title={t('header.settings')}
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* User Avatar */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
          <Avatar className="h-8 w-8 border-2 border-[#D4AF37]/30">
            <AvatarFallback className="bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#D4AF37] font-semibold text-xs">
              {getInitials(user?.userName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {user?.userName || 'Admin'}
          </span>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          size="sm"
          className="hidden sm:inline-flex gap-2 items-center h-10 px-4 text-sm hover:scale-105 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">{t('header.logout')}</span>
        </Button>
        
        {/* Mobile logout button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          size="icon"
          className="sm:hidden h-10 w-10"
          title={t('header.logout')}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
