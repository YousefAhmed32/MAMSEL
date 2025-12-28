import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { ShoppingBag } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  // Handle ESC key to close cart
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setOpenCartSheet(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [setOpenCartSheet]);

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const itemCount = cartItems?.length || 0;

  return (
    <SheetContent
      side="right"
      className="
        w-full max-w-full
        sm:w-[90vw] sm:max-w-md
        md:w-[85vw] md:max-w-lg
        lg:max-w-md
        h-full max-h-screen
        flex flex-col p-0 
        bg-white dark:bg-[#0f0f0f] 
        border-l border-gray-200 dark:border-gray-800
        shadow-2xl
        data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
        transition-all duration-500 ease-in-out
        overflow-hidden
      "
    >
      {/* Header Section - Fixed */}
      <SheetHeader className="
        flex-shrink-0
        px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4
        border-b border-gray-200 dark:border-gray-800 
        bg-gradient-to-b from-white to-gray-50 dark:from-[#0f0f0f] dark:to-[#1a1a1a]
        sticky top-0 z-10 mt-[50px]
      ">
        <div className="flex items-center justify-between">
       
        </div>
      </SheetHeader>

      {/* <SheetHeader className="
        flex-shrink-0
        px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4
        border-b border-gray-200 dark:border-gray-800 
        bg-gradient-to-b from-white to-gray-50 dark:from-[#0f0f0f] dark:to-[#1a1a1a]
        sticky top-0 z-10 mt-[50px]
      ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] dark:text-[#D4AF37]" />
            </div>
            <div>
              <SheetTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                سلة التسوق
              </SheetTitle>
              {itemCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {itemCount} {itemCount === 1 ? "منتج" : "منتجات"}
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetHeader> */}

      {/* Cart Items Section - Scrollable with proper height */}
      <div className="
        flex-1 
        min-h-0
        overflow-y-auto overflow-x-hidden
        px-4 sm:px-6 py-3 sm:py-4
        space-y-3 sm:space-y-4
        scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
        scrollbar-track-transparent hover:scrollbar-thumb-[#D4AF37]/50
        transition-all duration-300
      ">
        {cartItems && cartItems.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item.productId?._id || item.productId}
                className="animate-in fade-in slide-in-from-right"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: "300ms",
                }}
              >
                <UserCartItemsContent cartItem={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-8 sm:py-16 px-4">
            <div className="p-4 sm:p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 animate-pulse">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
             Cart is empty  
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
              Start shopping and add products to your cart
            </p>
          </div>
        )}
      </div>

      {/* Footer Section - Fixed at Bottom */}
      {cartItems && cartItems.length > 0 && (
        <div className="
          flex-shrink-0
          border-t border-gray-200 dark:border-gray-800 
          bg-white dark:bg-[#0f0f0f] 
          px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4
          shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
          sticky bottom-0 z-10
        ">
          {/* Total Amount */}
          <div className="flex items-center justify-between py-2">
            <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
              Total
            </span>
            <div className="flex flex-col items-end">
              <span className="text-xl sm:text-2xl font-bold text-gold-primary dark:text-gold-primary">
                QR {totalCartAmount.toFixed(2)}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Includes tax
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenCartSheet(false);
              setTimeout(() => {
                navigate("/shop/checkout");
              }, 200);
            }}
            className="
              w-full py-3 sm:py-4 h-auto
              bg-gold-primary hover:bg-gold-secondary 
              dark:bg-gold-primary dark:hover:bg-gold-secondary
              text-[#0a0a0f] dark:text-[#0a0a0f]
              text-base sm:text-lg font-bold rounded-xl 
              shadow-lg hover:shadow-xl
              hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-300 ease-in-out
              flex items-center justify-center gap-2
            "
          >
              <span>Continue to payment</span>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;
