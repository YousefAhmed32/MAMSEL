// ShoppingHeader.jsx
import {
  HousePlug,
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
  Heart,
  LogIn,
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
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { selectWishlistCount } from "@/store/shop/wishlist-slice";
import { setProductDetails } from "@/store/shop/products-slice";

// Helper function to get initials from username (supports Arabic and English)
function getInitials(userName) {
  if (!userName) return "??";
  const nameStr = String(userName).trim();
  if (!nameStr || nameStr.length === 0) return "??";
  const chars = Array.from(nameStr);
  if (chars.length === 0) return "??";
  return chars.slice(0, 2).join("") || "??";
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
        isMobile ? "gap-4" : "lg:flex-row gap-6 lg:items-center"
      }`}
    >
      {shoppingViewHeaderMenuItem.map((item) => (
        <Label
          key={item.id}
          onClick={() => handleNavigate(item)}
          className="relative group text-[15px] font-semibold cursor-pointer transition-all duration-300
                     text-white dark:text-white 
                     hover:text-gold-300 dark:hover:text-gold-300"
        >
          <span className="relative px-3 py-1 block z-10 transition-colors duration-300">
            {item.label}
            <span className="absolute top-1/2 right-0 h-0 w-[3px] rounded-full bg-gold-950 dark:bg-gold-300 transition-all duration-300 group-hover:h-full group-hover:top-0 group-hover:shadow-[0_0_8px_2px_rgba(210,176,101,0.6)]" />
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
        relative overflow-hidden border-2 border-gold-300 dark:border-gold-500
        text-white dark:text-white font-semibold rounded-lg px-4 py-2
        hover:text-gold-950 dark:hover:text-navy-950
        hover:bg-gold-300/20 dark:hover:bg-gold-500/20
        shadow-lg hover:shadow-gold-500/40 dark:hover:shadow-gold-400/40
        transition-all duration-300 ease-in-out
        hover:scale-105
        flex items-center gap-2 justify-center
      "
    >
      <span>تسجيل الدخول</span>
      <LogIn className="w-4 h-4 text-white dark:text-white group-hover:text-gold-950 dark:group-hover:text-navy-950 transition-colors" />
    </Button>
  );

  if (!user) {
    return (
      <div className={`flex ${isMobile ? "flex-col gap-4" : "lg:flex-row gap-4 items-center"}`}>
        {loginButton}

        {!isMobile && (
          <>
            <ThemeToggle />
            <Button
              onClick={() => navigate("/shop/wishlist")}
              variant="ghost"
              size="icon"
              className="relative hover:bg-gold-950/10 dark:hover:bg-gold-500/10 transition-all duration-300 group"
            >
              <Heart className="w-6 h-6 text-white dark:text-white group-hover:text-red-500 dark:group-hover:text-red-500 transition-colors duration-300" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md z-10">
                  {wishlistCount}
                </span>
              )}
            </Button>
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
      <ThemeToggle />

      <Button
        onClick={() => navigate("/shop/wishlist")}
        variant="ghost"
        size="icon"
        className="relative hover:bg-gold-950/10 dark:hover:bg-gold-500/10 transition-all duration-300 group"
      >
        <Heart className="w-6 h-6 text-white dark:text-white group-hover:text-red-500 dark:group-hover:text-red-500 transition-colors duration-300" />
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md z-10">
            {wishlistCount}
          </span>
        )}
      </Button>

      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gold-950/10 dark:hover:bg-gold-500/10 transition-all duration-300 group"
          >
            <ShoppingCart className="w-6 h-6 text-white dark:text-white group-hover:text-gold-950 dark:group-hover:text-gold-300 transition-colors duration-300" />
            {cartItems?.items?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-950 dark:bg-gold-300 text-navy-950 dark:text-navy-950 text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md glow-gold z-10">
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
          <Avatar className="bg-gold-950 dark:bg-gold-300 border-2 border-gold-400 dark:border-gold-500 hover:border-gold-300 dark:hover:border-gold-400 transition-all duration-300 cursor-pointer glow-gold hover:scale-105">
            <AvatarFallback className="text-navy-950 dark:text-navy-200 font-bold text-sm">
              {getInitials(user?.userName)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "start" : "end"}
          className="
            w-80 mt-3 rounded-2xl border-0 px-5 py-4
            bg-white/95 dark:bg-navy-950
            text-gray-900 dark:text-gray-100
            shadow-2xl backdrop-blur-md
            ring-1 ring-gold-950/20 dark:ring-gold-500/20
            animate-in fade-in slide-in-from-top-2
            transition-all duration-300
          "
        >
          <DropdownMenuLabel className="text-xs uppercase tracking-widest text-gold-600 dark:text-gold-300 mb-2">
            أهلاً بعودتك 👋
          </DropdownMenuLabel>

          <div className="mb-4 mt-4 flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-gold-400 dark:border-gold-500 shadow-gold-500/50 shadow-lg glow-gold">
              <AvatarFallback className="text-navy-950 dark:text-navy-950 font-bold text-xl dark:text-yellow-500">
                {getInitials(user?.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900 dark:text-white drop-shadow-md">
                {user?.userName}
              </span>
              <span className="text-xs text-gold-600 dark:text-gold-300">
                🌟 تم تسجيل الدخول
              </span>
            </div>
          </div>

          <DropdownMenuItem
            onClick={() => navigate("/shop/account")}
            className="
              group flex items-center gap-3 px-3 py-2 rounded-lg
              hover:bg-gold-950/10 dark:hover:bg-gold-500/10
              hover:shadow-md transition-all duration-200 cursor-pointer
            "
          >
            <UserCog className="h-5 w-5 text-gold-600 dark:text-gold-400 group-hover:scale-110 group-hover:text-gold-500 dark:group-hover:text-gold-300 transition-transform" />
            <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-gold-600 dark:group-hover:text-gold-300">
              إعدادات الحساب
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-3 border-t border-gold-950/20 dark:border-gold-500/20" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="
              group flex items-center gap-3 px-3 py-2 rounded-lg
              hover:bg-red-500/10 hover:shadow-md transition-all duration-200 cursor-pointer
            "
          >
            <LogOut className="h-5 w-5 text-red-500 group-hover:rotate-12 group-hover:text-red-400 transition-transform" />
            <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-red-400">
              تسجيل الخروج
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
    <header className="sticky top-0 z-50 w-full shadow-lg luxury-gradient border-b border-gold-950/10 dark:border-gold-500/10 backdrop-blur-sm">
      <div className="flex h-16 md:h-18 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link
          to="/shop/home"
          className="flex items-center gap-2 sm:gap-3 text-white dark:text-white text-lg sm:text-xl font-bold tracking-widest hover:opacity-90 group transition-all duration-300 flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gold-950/20 dark:bg-gold-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <img
              src="/assets/logo3.png"
              alt="عود الوجبة"
              className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded-full"
            />
          </div>
          <span className="glow-text hidden sm:inline">عود الوجبة</span>
          <span className="glow-text sm:hidden">عود</span>
        </Link>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* تسجيل الدخول خارج الموبايل menu */}
          {!isAuthenticated && (
            <HeaderRightContent isMobile={true} />
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white dark:text-white hover:bg-gold-950/10 dark:hover:bg-gold-500/10 transition-all duration-300"
              >
                <Menu className="w-6 h-6" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-xs pt-6 luxury-gradient border-l border-gold-950/20 dark:border-gold-500/20 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <SheetTitle className="text-xl font-bold text-white dark:text-white glow-text mb-4">
                  القائمة
                </SheetTitle>
                <MenuItems isMobile={true} />
                <div className="pt-4 border-t border-gold-950/20 dark:border-gold-500/20">
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
          <HeaderRightContent isMobile={false} />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
