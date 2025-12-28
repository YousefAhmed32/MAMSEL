import { Minus, Plus, Trash, X } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/utils/imageUtils";
import { useState, useEffect } from "react";
import { fetchProductDetails } from "@/store/shop/products-slice";

const UserCartItemsContent = ({ cartItem }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const [productDetails, setProductDetails] = useState(null);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch product details to get available sizes
  useEffect(() => {
    if (cartItem?.productId) {
      const product = productList.find(p => p._id === cartItem.productId);
      if (product && product.category === "Clothes" && product.attributes?.sizes) {
        setProductDetails(product);
      }
    }
  }, [cartItem?.productId, productList]);


  function handleUpdateQuantity(getCartItem, typeOfAction) {
    // Prevent multiple clicks
    if (isUpdating) return;

    // Get current cart items from Redux state (always up-to-date)
    const currentCartItems = cartItems?.items || cartItems || [];
    
    // Normalize productId for comparison
    const normalizeProductId = (id) => {
      if (!id) return null;
      if (typeof id === 'string') return id;
      if (id._id) return id._id.toString();
      return id.toString();
    };
    
    const targetProductId = normalizeProductId(getCartItem?.productId);
    const targetSize = getCartItem?.selectedSize || null;
    
    // Find the current item in the cart to get the latest quantity
    const currentItem = currentCartItems.find((item) => {
      const itemProductId = normalizeProductId(item.productId);
      const itemSize = item.selectedSize || null;
      return itemProductId === targetProductId && itemSize === targetSize;
    });

    // Use the quantity from Redux state (always current) instead of prop
    // Fallback to prop quantity if not found in state (shouldn't happen, but safety check)
    const currentQuantity = currentItem?.quantity ?? getCartItem?.quantity ?? 1;
    
    // Calculate new quantity
    let newQuantity;
    if (typeOfAction === "plus") {
      newQuantity = currentQuantity + 1;
      
      // Check stock limit
      const getCurrentProductIndex = productList.findIndex(
        product => normalizeProductId(product._id) === targetProductId
      );
      const getTotalStock = productList[getCurrentProductIndex]?.totalStock || 0;
      
      if (getTotalStock > 0 && newQuantity > getTotalStock) {
        toast({
          title: `You can add only ${currentQuantity} quantity for this product`,
          variant: "destructive",
        });
        return;
      }
    } else {
      // For minus, ensure quantity doesn't go below 1
      newQuantity = Math.max(1, currentQuantity - 1);
    }

    // Prevent updating if quantity hasn't changed (edge case)
    if (newQuantity === currentQuantity) {
      return;
    }

    setIsUpdating(true);
    
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: targetProductId,
        quantity: newQuantity,
        selectedSize: targetSize,
      })
    ).then((data) => {
      setIsUpdating(false);
      if (data?.payload?.success) {
        // State is automatically updated by Redux reducer, no need to fetch again
        // This prevents race conditions and ensures we always use the latest state
      } else {
        toast({
          title: "Error updating quantity",
          description: data?.payload?.message || "Please try again",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      setIsUpdating(false);
      console.error("Error updating quantity:", error);
      toast({
        title: "Error updating quantity",
        description: "An error occurred while updating the quantity. Please try again",
        variant: "destructive",
      });
    });
  }

  function handleSizeChange(newSize) {
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem?.productId,
        quantity: cartItem?.quantity,
        selectedSize: newSize,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        setShowSizeSelector(false);
        // Refresh cart items after size change
        dispatch(fetchCartItems(user?.id));
      } else {
        toast({
          title: "Error updating size",
          description: data?.payload?.message || "Please try again",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      console.error("Error updating size:", error);
      toast({
        title: "Error updating size",
        description: "An error occurred while updating the size. Please try again",
        variant: "destructive",
      });
    });
  }

  function handleCartItemDelete(getCartItem) {
    setIsDeleting(true);
    setTimeout(() => {
      dispatch(
        deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
      ).then((data) => {
        if (data?.payload?.success) {
          toast({
            title: "Cart item deleted successfully",
          });
          // Refresh cart items after deletion
          dispatch(fetchCartItems(user?.id));
        } else {
          toast({
            title: "Error deleting product",
            description: data?.payload?.message || "Please try again",
            variant: "destructive",
          });
        }
        setIsDeleting(false);
      }).catch((error) => {
        console.error("Error deleting item:", error);
        toast({
          title: "Error deleting product",
          description: "An error occurred while deleting the product. Please try again",
          variant: "destructive",
        });
        setIsDeleting(false);
      });
    }, 300);
  }

  const isClothesProduct = productDetails && productDetails.category === "Clothes";
  const availableSizes = productDetails?.attributes?.sizes || [];
  const itemPrice = cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price;
  const totalItemPrice = itemPrice * cartItem.quantity;
  const hasSale = cartItem?.salePrice > 0 && cartItem?.salePrice < cartItem?.price;

  return (
    <div
      className={`
        group relative
        flex gap-4 p-4 rounded-xl
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        hover:border-[#D4AF37]/50 dark:hover:border-[#D4AF37]/50
        hover:shadow-lg dark:hover:shadow-[#D4AF37]/10
        transition-all duration-300 ease-in-out
        ${isDeleting ? "opacity-0 scale-95 translate-x-4" : "opacity-100 scale-100 translate-x-0"}
      `}
    >
      {/* Product Image */}
      <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group-hover:scale-105 transition-transform duration-300">
        <img
          src={getImageUrl(cartItem.image)}
          alt={cartItem.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        {hasSale && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            Discount
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Product Title */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
            {cartItem?.title}
          </h3>
          
          {/* Groups */}
          {cartItem?.groups && Array.isArray(cartItem.groups) && cartItem.groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {cartItem.groups.slice(0, 2).map((group, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#D4AF37] rounded-full"
                >
                  {group}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Size Display and Selector for Clothes */}
        {isClothesProduct && availableSizes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Size:</span>
            {showSizeSelector ? (
              <div className="flex flex-wrap gap-1.5 items-center">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      transition-all duration-200
                      ${
                        cartItem?.selectedSize === size
                          ? "bg-[#D4AF37] text-[#0a0a0f] shadow-md scale-105"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#D4AF37]/20 dark:hover:bg-[#D4AF37]/20"
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowSizeSelector(false)}
                  className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSizeSelector(true)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-black/10 dark:bg-black/20 text-black border border-black/30 hover:bg-black/20 dark:hover:bg-black/30 transition-all hover:scale-105"
              >
                {cartItem?.selectedSize || "Select size"}
              </button>
            )}  
          </div>
        )}

        {/* Quantity Controls & Price */}
        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              disabled={cartItem?.quantity === 1 || isUpdating}
              onClick={() => handleUpdateQuantity(cartItem, "minus")}
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>
            <span className={`font-bold min-w-[2rem] text-center text-sm ${
              isUpdating 
                ? 'text-gray-400 dark:text-gray-600' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {isUpdating ? '...' : cartItem?.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              disabled={isUpdating}
              onClick={() => handleUpdateQuantity(cartItem, "plus")}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Price */}
          <div className="flex flex-col items-end">
            <p className="font-bold text-lg text-gold-primary dark:text-gold-primary">
              QR {totalItemPrice.toFixed(2)}
            </p>
            {hasSale && (
              <p className="text-xs text-gray-400 line-through">
                QR {(cartItem?.price * cartItem.quantity).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => handleCartItemDelete(cartItem)}
        className="absolute top-2 left-2 p-1.5 rounded-full
          bg-white dark:bg-gray-800
          text-gray-400 dark:text-gray-500
          hover:text-red-500 dark:hover:text-red-400
          hover:bg-red-50 dark:hover:bg-red-900/20
          opacity-0 group-hover:opacity-100
          transition-all duration-200
          shadow-md hover:scale-110"
        aria-label="Delete product"
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  );
};
export default UserCartItemsContent;
