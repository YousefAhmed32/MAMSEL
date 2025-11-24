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
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col bg-white dark:bg-gradient-to-br dark:from-navy-950/90 dark:to-black/90 backdrop-blur-xl border-2 border-gray-200 dark:border-gold-500/20 rounded-2xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden relative transition-all duration-300 hover:border-gold-500/50 dark:hover:border-gold-500/50 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(255,215,0,0.2)]">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-500/0 via-gold-500/20 to-gold-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none z-0" />

        {/* Top Section - Image */}
        <div 
          onClick={() => handleGetProductDetails(product?._id)} 
          className="relative cursor-pointer z-10 flex-shrink-0"
        >
          <div className="relative overflow-hidden bg-gray-100 dark:bg-navy-900">
            {/* Gradient glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 via-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

            <img
              src={getProductImageUrl(product)}
              alt={product?.title}
              className="w-full h-[280px] object-cover transform group-hover:scale-110 transition-transform duration-700 relative z-10"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />

            {/* Badge */}
            {product?.totalStock === 0 ? (
              <Badge className="absolute top-3 left-3 animate-pulse bg-red-600 text-white shadow-lg z-20 border-2 border-white/50">
                نفدت الكمية
              </Badge>
            ) : product?.totalStock < 10 ? (
              <Badge className="absolute top-3 left-3 bg-yellow-500 text-black shadow-lg z-20 border-2 border-white/50 font-bold">
                متبقي {product?.totalStock} فقط
              </Badge>
            ) : product?.salePrice > 0 && product?.salePrice < product?.price ? (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg z-20 border-2 border-white/50 font-bold">
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
                className="h-10 w-10 bg-white/95 dark:bg-navy-950/95 hover:bg-gold-500 hover:text-white border-2 border-white/50 dark:border-gold-500/30 text-gray-800 dark:text-gold-400 backdrop-blur-md shadow-xl hover:scale-110 transition-all duration-300"
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
                className="h-10 w-10 bg-white/95 dark:bg-navy-950/95 hover:bg-gold-500 hover:text-white border-2 border-white/50 dark:border-gold-500/30 text-gray-800 dark:text-gold-400 backdrop-blur-md shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="أضف إلى السلة"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={handleWishlistToggle}
                className={`h-10 w-10 backdrop-blur-md shadow-xl hover:scale-110 transition-all duration-300 border-2 ${
                  isInWishlist
                    ? "bg-red-500/95 hover:bg-red-600 border-red-500/50 text-white"
                    : "bg-white/95 dark:bg-navy-950/95 hover:bg-gold-500 hover:text-white border-white/50 dark:border-gold-500/30 text-gray-800 dark:text-gold-400"
                }`}
                title={isInWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-300 ${
                    isInWishlist ? "fill-current" : "fill-none"
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
            {product?.title}
          </h2>

          <div className="flex items-center justify-between text-xs text-gold-600 dark:text-gold-400 mb-3">
            <span className="font-semibold">
              {categoryOptionsMap[product?.category] || product?.category}
            </span>
            <span className="font-semibold">
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
                    ? 'text-gold-500 fill-gold-500 dark:text-gold-400 dark:fill-gold-400' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(4.0)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gold-500/20">
            {product?.salePrice > 0 && product?.salePrice < product?.price ? (
              <>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-through block">
                    QR{product?.price}
                  </span>
                  <span className="text-xl font-bold bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 dark:from-gold-400 dark:via-gold-300 dark:to-gold-400 bg-clip-text text-transparent">
                    QR{product?.salePrice}
                  </span>
                </div>
                <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                  خصم
                </Badge>
              </>
            ) : (
              <span className="text-xl font-bold bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 dark:from-gold-400 dark:via-gold-300 dark:to-gold-400 bg-clip-text text-transparent">
                QR{product?.price}
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer - Button */}
        <CardFooter className="p-5 pt-0">
          {product?.totalStock === 0 ? (
            <Button 
              className="w-full opacity-50 cursor-not-allowed bg-gray-400 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 text-white font-semibold"
              disabled
            >
              نفدت الكمية
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-gold-500 via-gold-600 to-gold-500 hover:from-gold-600 hover:via-gold-700 hover:to-gold-600 text-white dark:text-navy-950 font-bold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
              onClick={() => handleAddToCart(product?._id, product?.totalStock)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-2">
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
