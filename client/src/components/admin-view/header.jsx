import { AlignJustify, LogOut, Settings, Bell, Home, Search, RefreshCw, Package, ShoppingCart, Users, Ticket, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutUser } from "@/store/auth-slice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "../ui/theme-toggle";
import NotificationSystem from "../ui/notification-system";
import OrderNotifications from "../ui/order-notifications";
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

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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

  function handleLogout() {
    dispatch(logoutUser());
  }

  function handleRefresh() {
    window.location.reload();
  }

  function getPageTitle() {
    const path = location.pathname;
    const titles = {
      '/admin/dashboard': 'لوحة التحكم',
      '/admin/analysis': 'التحليلات',
      '/admin/banners': 'إدارة البنرات',
      '/admin/products': 'إدارة المنتجات',
      '/admin/orders': 'إدارة الطلبات',
      '/admin/users': 'إدارة المستخدمين',
      '/admin/coupon': 'إدارة الكوبونات',
    };
    return titles[path] || 'لوحة التحكم';
  }

  // Load orders and coupons when search opens
  useEffect(() => {
    if (isSearchOpen) {
      // Fetch orders if not loaded
      if (!orderList || orderList.length === 0) {
        dispatch(getAllOrdersForAdmin());
      }
      // Fetch coupons if not loaded
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

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
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
          
          // Handle different response formats
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
          // Fallback to direct API call if dispatch fails
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

        // Search Orders (from local state or fetch if needed)
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

        // Search Coupons (from local state)
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
        // You can add logic to highlight the product in the products page
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
    <header className="sticky top-0 z-50 flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 bg-background/95 dark:bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <Button
          onClick={() => setOpen(true)}
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/20"
        >
          <AlignJustify className="w-5 h-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/20 hidden sm:flex"
          >
            <Home className="w-4 h-4" />
          </Button>
          
          <div className="hidden md:block min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{getPageTitle()}</h1>
          </div>
          
          {/* Mobile title */}
          <div className="md:hidden">
            <h1 className="text-base font-bold text-foreground truncate max-w-[120px]">{getPageTitle()}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
        {/* Search */}
        <DropdownMenu open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="relative h-9 w-full sm:w-[200px] md:w-[300px] justify-start text-sm text-muted-foreground border-border hover:bg-muted"
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">ابحث عن منتج، طلب، مستخدم...</span>
              <span className="sm:hidden">بحث</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[90vw] sm:w-[400px] md:w-[500px] p-0 max-h-[500px] overflow-y-auto" 
            align="end"
            sideOffset={5}
          >
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  placeholder="ابحث عن منتج، طلب، مستخدم، أو كوبون..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 bg-background border-border text-foreground"
                  style={{ 
                    paddingRight: '2.5rem', 
                    paddingLeft: searchQuery ? '2.5rem' : '0.75rem' 
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-7 w-7 z-20 hover:bg-muted rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSearchQuery("");
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }}
                    type="button"
                    title="مسح البحث"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="mr-2 text-muted-foreground">جاري البحث...</span>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  ابدأ الكتابة للبحث (حد أدنى حرفين)
                </div>
              ) : totalResults === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  لم يتم العثور على نتائج
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Products Results */}
                  {searchResults.products.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        المنتجات ({searchResults.products.length})
                      </div>
                      {searchResults.products.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleResultClick('product', product)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        >
                          <Package className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{product.title || product.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{product.category}</div>
                          </div>
                          <div className="text-sm font-semibold text-primary flex-shrink-0">${product.price}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Orders Results */}
                  {searchResults.orders.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        الطلبات ({searchResults.orders.length})
                      </div>
                      {searchResults.orders.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => handleResultClick('order', order)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">
                              طلب #{order._id?.toString().slice(-8)}
                            </div>
                            <div className="text-xs text-muted-foreground">
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
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        المستخدمين ({searchResults.users.length})
                      </div>
                      {searchResults.users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleResultClick('user', user)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        >
                          <Users className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{user.userName || user.name || user.email}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0">{user.role || 'user'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coupons Results */}
                  {searchResults.coupons.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        الكوبونات ({searchResults.coupons.length})
                      </div>
                      {searchResults.coupons.map((coupon) => (
                        <div
                          key={coupon._id}
                          onClick={() => handleResultClick('coupon', coupon)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        >
                          <Ticket className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{coupon.code}</div>
                            <div className="text-xs text-muted-foreground">
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

        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/20"
          title="تحديث"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        <ThemeToggle />
        
        <div className="hidden sm:block">
          <NotificationSystem />
        </div>
        
        <div className="hidden sm:block">
          <OrderNotifications />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 dark:hover:bg-primary/20 hidden md:flex"
          title="الإعدادات"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <div className="hidden xl:flex items-center gap-2 text-muted-foreground">
          <span className="text-sm whitespace-nowrap">مرحباً، {user?.userName}</span>
        </div>

        <Button
          onClick={handleLogout}
          variant="destructive"
          size="sm"
          className="hidden sm:inline-flex gap-2 items-center h-9 px-3 sm:px-4 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">تسجيل الخروج</span>
        </Button>
        
        {/* Mobile logout button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          size="icon"
          className="sm:hidden h-9 w-9"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
