import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { getProductImageUrl } from "@/utils/imageUtils";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlistItem, selectIsInWishlist } from "@/store/shop/wishlist-slice";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

function ShoppingProductTitle({
  product,
  handleGetProductDetails,
  handleAddToCart,
}) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const productId = product?._id || product?.id;
  const isInWishlist = useSelector((state) => selectIsInWishlist(state, productId));

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    const wasInWishlist = isInWishlist;
    dispatch(toggleWishlistItem(product));
    toast({
      title: wasInWishlist ? "تم الحذف من المفضلة" : "تمت الإضافة للمفضلة",
      description: wasInWishlist 
        ? `تم حذف ${product?.title} من قائمة المفضلة`
        : `تم إضافة ${product?.title} إلى قائمة المفضلة`,
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm dark:shadow-lg overflow-hidden relative transition-all duration-300 hover:shadow-md dark:hover:shadow-xl">

        {/* Top Section - Image */}
        <div 
          onClick={() => handleGetProductDetails(product?._id)} 
          className="relative cursor-pointer z-10 flex-shrink-0"
        >
          <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-900">
            <img
              src={getProductImageUrl(product)}
              alt={product?.title}
              className="w-full h-[280px] object-cover transform group-hover:scale-105 transition-transform duration-500 relative z-10"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />

            {/* Badge */}
            {product?.totalStock === 0 ? (
              <Badge className="absolute top-3 left-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 text-white/90 shadow-md z-20 border border-gray-700">
                نفدت الكمية
              </Badge>
            ) : product?.totalStock < 10 ? (
              <Badge className="absolute top-3 left-3 bg-gray-800 dark:bg-gray-700 text-white/90 shadow-md z-20 border border-gray-600">
                متبقي {product?.totalStock} فقط
              </Badge>
            ) : product?.salePrice > 0 && product?.salePrice < product?.price ? (
              <Badge className="absolute top-3 left-3 bg-[#f56565] text-white shadow-md z-20 border border-[red-500]">
                خصم {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
              </Badge>
            ) : null}

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
              <Button
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGetProductDetails(product?._id);
                }}
                className="h-10 w-10 bg-white dark:bg-[#0a0a0a] hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white shadow-md hover:scale-105 transition-all duration-300"
                title="عرض التفاصيل"
              >
                <Eye className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) {
                    navigate("/auth/login", { state: { from: location.pathname } });
                    toast({
                      title: "يجب تسجيل الدخول أولاً",
                      description: "يرجى تسجيل الدخول لإضافة المنتج إلى السلة",
                      variant: "destructive"
                    });
                    return;
                  }
                  if (product?.totalStock > 0) {
                    handleAddToCart(product?._id, product?.totalStock);
                  }
                }}
                disabled={product?.totalStock === 0}
                className="h-10 w-10 bg-white dark:bg-[#0a0a0a] hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="أضف إلى السلة"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>

              {/* <Button
                size="icon"
                variant="outline"
                onClick={handleWishlistToggle}
                className={`h-10 w-10 shadow-md hover:scale-105 transition-all duration-300 border ${
                  isInWishlist
                    ? "bg-[#f56565] hover:bg-[#e53e3e] border-[#f56565] text-white"
                    : "bg-white dark:bg-[#0a0a0a] hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                }`}
                title={isInWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-300 ${
                    isInWishlist ? "fill-current text-white" : "fill-none"
                  }`}
                />
              </Button> */}
            </div>
          </div>
        </div>

        {/* Text Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {product?.title}
          </h2>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
            <span className="font-medium">
              {categoryOptionsMap[product?.category] || product?.category}
            </span>
            <span className="font-medium">
              {product?.brand && typeof product.brand === 'object' 
                ? (product.brand.name || product.brand.nameEn || product.brand._id)
                : (brandOptionsMap[product?.brand] || product?.brand || '')
              }
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < 4 
                    ? 'text-gray-900 fill-gray-900 dark:text-white dark:fill-white' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(4.0)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-800">
            {product?.salePrice > 0 && product?.salePrice < product?.price ? (
              <>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-through block">
                    QR{product?.price}
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    QR{product?.salePrice}
                  </span>
                </div>
                <Badge className="bg-[#f56565] text-white border border-[#f56565]">
                  خصم
                </Badge>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                QR{product?.price}
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer - Button */}
        <CardFooter className="p-5 pt-0">
          {product?.totalStock === 0 ? (
            <Button 
              className="w-full opacity-50 cursor-not-allowed bg-gray-400 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-700 text-white font-medium"
              disabled
            >
              نفدت الكمية
            </Button>
          ) : (
            <Button
              className="w-full bg-gray-900 dark:bg-white text-white/90 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              onClick={() => handleAddToCart(product?._id, product?.totalStock)}
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                أضف إلى السلة
              </span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default ShoppingProductTitle;
