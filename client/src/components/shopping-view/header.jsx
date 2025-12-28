// ShoppingHeader.jsx
import {
  HousePlug,
  LogOut,
  Menu,
  ShoppingBag,
  UserCog,
  Heart,
  LogIn,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItem } from "@/config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-warpper";
import { useEffect, useState, useRef } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { selectWishlistCount } from "@/store/shop/wishlist-slice";
import { setProductDetails, fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { Input } from "../ui/input";
import { getProductImageUrl } from "@/utils/imageUtils";

// Helper function to get initials from username (supports Arabic and English)
function getInitials(userName) {
  if (!userName) return "??";
  const nameStr = String(userName).trim();
  if (!nameStr || nameStr.length === 0) return "??";
  const chars = Array.from(nameStr);
  if (chars.length === 0) return "??";
  return chars.slice(0, 2).join("") || "??";
}

function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      
      // Calculate dropdown position based on button position
      if (searchContainerRef.current) {
        const rect = searchContainerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    }
  }, [isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (searchContainerRef.current) {
        const rect = searchContainerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    // Close search when clicking outside
    function handleClickOutside(event) {
      if (
        searchContainerRef.current && 
        searchDropdownRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        !searchDropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }

    if (isOpen) {
      // Use capture phase to catch events before they bubble
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("touchstart", handleClickOutside, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
        document.removeEventListener("touchstart", handleClickOutside, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await dispatch(
          fetchAllFilteredProducts({
            filtersParams: { keyword: searchQuery.trim() },
            sortParams: "price-lowtohigh",
          })
        ).unwrap();

        if (result?.success && result?.data) {
          setSearchResults(result.data.slice(0, 5)); // Limit to 5 results
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, dispatch]);

  function handleProductClick(productId) {
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/shop/product/${productId}`);
  }

  return (
    <div ref={searchContainerRef} className="relative z-[100]">
      {/* Search Icon Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group z-[100]"
      >
        <Search className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors duration-300" />
      </Button>

      {/* Search Input & Results Dropdown */}
      {isOpen && (
        <div 
          ref={searchDropdownRef}
          className="fixed w-[calc(100vw-2rem)] sm:w-[500px] lg:w-[500px] bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 rounded-lg shadow-2xl z-[9999] max-h-[600px] flex flex-col"
          style={{ 
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            right: `${Math.max(16, dropdownPosition.right)}px`,
            zIndex: 9999,
            isolation: 'isolate',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for a product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto flex-1">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
                <span className="mr-2 text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            ) : searchQuery.trim().length < 2 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
               search for at least 2 characters
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No results found
              </div>
            ) : (
              <div className="p-2">
                {searchResults.map((product) => (
                  <div
                    key={product._id || product.id}
                    onClick={() => handleProductClick(product._id || product.id)}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors duration-200 group"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.title || product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#D4AF37] transition-colors">
                        {product.title || product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-[#D4AF37]">
                          ${product.price}
                        </span>
                        {product.salePrice && product.salePrice < product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            ${product.salePrice}
                          </span>
                        )}
                      </div>
                      {/* Groups */}
                      {product.groups && Array.isArray(product.groups) && product.groups.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.groups.slice(0, 2).map((group, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full"
                            >
                              {group}
                            </span>
                          ))}
                          {product.groups.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                              +{product.groups.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItems({ isMobile = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  function handleNavigate(item) {
    sessionStorage.removeItem("filters");

    if (item.id === "search") {
      dispatch(setProductDetails());
      return; // Don't navigate, search is handled by SearchBar component
    }

    // Handle collection pages (corset, ramadan, giveaways)
    if (item.id === "corset" || item.id === "ramadan" || item.id === "giveaways") {
      navigate(item.path);
      return;
    }

    const currentFilter =
      item.id !== "home" && item.id !== "products" && item.id !== "search"
        ? { category: [item.id] }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter
      ? setSearchParams(new URLSearchParams(`?category=${item.id}`))
      : navigate(item.path);
  }

  return (
    <nav
  className={`flex flex-col ${
    isMobile ? "gap-4" : "lg:flex-row gap-8 lg:items-center"
  }`}
>
  {shoppingViewHeaderMenuItem
    .filter((item) => item.id !== "search")
    .map((item) => (
      <Label
        key={item.id}
        onClick={() => handleNavigate(item)}
        className="
          relative group cursor-pointer
          text-[13px] font-semibold uppercase tracking-widest
          text-gray-800 dark:text-gray-300
          transition-all duration-500
        "
      >
        {/* خلفية خفيفة جدًا */}
        <span
          className="
            absolute inset-0 rounded-xl
            bg-gradient-to-r from-gray-950/5 via-gray-950/10 to-gray-950/5
            opacity-0 group-hover:opacity-100
            blur-sm transition-all duration-500
          "
        />

        {/* النص */}
        <span
          className="
            relative z-10 px-5 py-2 block
            transition-all duration-300
            group-hover:text-gray-950 dark:group-hover:text-white
          "
        >
          {item.label}

          {/* الخط السفلي – فضائي فاضي */}
          <span
            className="
              absolute left-1/2 bottom-0 h-[1px] w-0
              bg-gradient-to-r from-transparent via-gray-950 to-transparent
              transition-all duration-500
              group-hover:w-full group-hover:left-0
              opacity-60
            "
          />
        </span>
      </Label>
    ))}
</nav>


  );
}

function HeaderRightContent({ isMobile = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const wishlistCount = useSelector(selectWishlistCount);
  const [openCartSheet, setOpenCartSheet] = useState(false);

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [user, dispatch]);

  function handleLogout() {
    dispatch(logoutUser());
  }

  const loginButton = (
    <Button
      onClick={() => navigate("/auth/login")}
      variant="outline"
      size={isMobile ? "sm" : "md"}
      className="
        border border-[gray-950] text-[gray-950] dark:text-[gray-950]
        font-medium rounded-sm px-6 py-2
        hover:bg-[gray-800] hover:text-[#0a0a0f] dark:hover:bg-[gray-950] dark:hover:text-[#0a0a0f]
        transition-all duration-300
        flex items-center gap-2 justify-center
      "
    >
      <span>Login</span>
      <LogIn className="w-4 h-4 transition-colors" />
    </Button>
  );

  if (!user) {
    return (
      <div className={`flex ${isMobile ? "flex-col gap-4" : "lg:flex-row gap-4 items-center"}`}>
        {loginButton}

        {!isMobile && (
          <>
            {/* <ThemeToggle />
            <Button
              onClick={() => navigate("/shop/wishlist")}
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
            >
              <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors duration-300" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#0a0a0f] text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center z-10">
                  {wishlistCount}
                </span>
              )}
            </Button> */}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isMobile ? "flex-col gap-4" : "lg:items-center lg:flex-row flex-col gap-4"
      }`}
    >
      {/* <ThemeToggle /> */}
{/* 
      <Button
        onClick={() => navigate("/shop/wishlist")}
        variant="ghost"
        size="icon"
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
      >
        <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors duration-300" />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#0a0a0f] text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center z-10">
            {wishlistCount}
          </span>
        )}
      </Button> */}

      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className=" relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
          >
            <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors duration-300" />
            {cartItems?.items?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#0a0a0f] text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center z-10">
                {cartItems?.items?.length || 0}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items || []}
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-[#D4AF37] border border-gray-300 dark:border-gray-700 hover:border-[#D4AF37] transition-all duration-300 cursor-pointer hover:scale-105">
            <AvatarFallback className="text-[#0a0a0f] font-semibold text-sm">
              {getInitials(user?.userName)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "start" : "end"}
          className="
            w-72 mt-3 rounded-sm border border-gray-200 dark:border-gray-800 px-4 py-3
            bg-white dark:bg-[#0f0f0f]
            text-gray-900 dark:text-gray-100
            shadow-lg backdrop-blur-md
            animate-in fade-in slide-in-from-top-2
            transition-all duration-300
          "
        >
          <DropdownMenuLabel className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Welcome Back
          </DropdownMenuLabel>

          <div className="mb-4 mt-2 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-gray-300 dark:border-gray-700">
              <AvatarFallback className="text-[#0a0a0f] font-semibold text-base bg-[#D4AF37]">
                {getInitials(user?.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.userName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Signed in
              </span>
            </div>
          </div>

          <DropdownMenuItem
            onClick={() => navigate("/shop/account")}
            className="
              group flex items-center gap-3 px-3 py-2 rounded-sm
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all duration-200 cursor-pointer
            "
          >
            <UserCog className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
            <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-[#D4AF37]">
              Account Settings
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2 border-t border-gray-200 dark:border-gray-800" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="
              group flex items-center gap-3 px-3 py-2 rounded-sm
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer
            "
          >
            <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors" />
            <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-red-600">
              Sign Out
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <header className="sticky top-0 z-[100] w-full bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300" style={{ isolation: 'isolate' }}>
      <div className="flex h-10 md:h-16 items-center justify-between px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <Link
          to="/shop/home"
          className="flex items-center gap-3 text-gray-900 dark:text-white text-xl sm:text-2xl font-serif font-semibold tracking-wide hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors duration-300 flex-shrink-0"
        >
         <div className="w-[120px] h-auto overflow-hidden flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <img
              src="/assets/mamsal-logo1.png"
              alt="Designer Store"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchBar />
          {/* تسجيل الدخول خارج الموبايل menu */}
          {!isAuthenticated && (
            <HeaderRightContent isMobile={true} />
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              >
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-xs pt-8 bg-white dark:bg-[#0f0f0f] border-l border-gray-200 dark:border-gray-800 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <SheetTitle className="text-xl font-serif font-semibold text-gray-900 dark:text-white mb-4">
                  Menu
                </SheetTitle>
                <MenuItems isMobile={true} />
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  {/* تسجيل الدخول داخل الموبايل menu */}
                  {!isAuthenticated && (
                    <HeaderRightContent isMobile={true} />
                  )}
                  {isAuthenticated && <HeaderRightContent isMobile={true} />}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Menu Items for large screens */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <MenuItems isMobile={false} />
        </div>

        {/* Header Right Content for large screens */}
        <div className="hidden lg:flex items-center gap-4">
          <SearchBar />
          <HeaderRightContent isMobile={false} />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
