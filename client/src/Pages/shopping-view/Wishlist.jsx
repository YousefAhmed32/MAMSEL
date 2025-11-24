import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Eye } from "lucide-react";
import { selectWishlistItems, removeFromWishlist, clearWishlist } from "@/store/shop/wishlist-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { getProductImageUrl } from "@/utils/imageUtils";
import { useToast } from "@/hooks/use-toast";
import { brandOptionsMap, categoryOptionsMap } from "@/config";

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector(selectWishlistItems);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast({
      title: "تم الحذف من المفضلات",
      description: "تم إزالة المنتج من قائمة المفضلات الخاصة بك",
    });
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    toast({
      title: "تم مسح قائمة المفضلات",
      description: "تم إزالة جميع العناصر من قائمة المفضلات",
    });
  };

  const handleAddToCart = (productId, totalStock) => {
    if (!user?.id) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول لإضافة المنتجات إلى السلة",
        variant: "destructive",
      });
      return;
    }

    dispatch(addToCart({ userId: user.id, productId, quantity: 1 })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user.id));
          toast({
            title: "تمت الإضافة للسلة",
            description: "تم إضافة المنتج إلى سلة التسوق الخاصة بك",
          });
        }
      }
    );
  };

  const handleProductClick = (productId) => {
    dispatch(fetchProductDetails(productId));
    navigate(`/shop/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                  <Heart className="h-8 w-8 text-red-500 fill-current" />
                  قائمة المفضلات
                </h1>
                <p className="text-muted-foreground mt-2">
                  {wishlistItems.length === 0
                    ? "قائمة المفضلات فارغة"
                    : `${wishlistItems.length} ${wishlistItems.length === 1 ? "منتج" : "منتجات"} محفوظة`}
                </p>
              </div>
            </div>
            {wishlistItems.length > 0 && (
              <Button
                onClick={handleClearWishlist}
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                مسح الكل
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-muted/30 mb-4">
              <Heart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">لا توجد منتجات محفوظة بعد</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              يمكنك البدء في إضافة المنتجات إلى قائمة المفضلات بالنقر على أيقونة القلب في أي بطاقة منتج.
            </p>
            <Button onClick={() => navigate("/shop/listing")}>
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((product) => {
              const productId = product._id || product.id;
              return (
                <Card
                  key={productId}
                  className="group relative overflow-hidden rounded-2xl border-border/50 
                    bg-card hover:border-primary/50 transition-all duration-300 
                    hover:shadow-xl hover:shadow-primary/10"
                >
                  {/* Product Image */}
                  <div
                    onClick={() => handleProductClick(productId)}
                    className="relative cursor-pointer overflow-hidden"
                  >
                    <div className="relative h-[250px] sm:h-[300px] overflow-hidden">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product?.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Action Buttons - Eye and Heart */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      {/* Eye Button - View Details */}
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(productId);
                        }}
                        className="h-10 w-10 bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-300"
                        title="عرض المنتج"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Heart Button - Remove from Wishlist */}
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(productId);
                        }}
                        className="h-10 w-10 bg-red-500/90 hover:bg-red-600 border-red-500/50 text-white backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-300"
                        title="حذف من المفضلات"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>

                    {/* Sale Badge */}
                    {product?.salePrice > 0 && (
                      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full 
                        bg-red-500 text-white text-xs font-semibold shadow-md">
                        خصم
                      </div>
                    )}

                    {/* Stock Badge */}
                    {product?.totalStock === 0 && (
                      <div className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-full 
                        bg-red-600 text-white text-xs font-semibold shadow-md animate-pulse">
                        نفاذ المخزون
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-4 space-y-2">
                    <h3
                      onClick={() => handleProductClick(productId)}
                      className="text-lg font-semibold line-clamp-2 cursor-pointer 
                        hover:text-primary transition-colors"
                    >
                      {product?.title}
                    </h3>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {categoryOptionsMap[product?.category] ||
                          product?.category}
                      </span>
                      <span>
                        {product?.brand && typeof product.brand === "object"
                          ? product.brand.name ||
                            product.brand.nameEn ||
                            product.brand._id
                          : brandOptionsMap[product?.brand] ||
                            product?.brand ||
                            ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${
                            product?.salePrice > 0
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          ${product?.price}
                        </span>
                        {product?.salePrice > 0 && (
                          <span className="text-lg font-bold text-primary">
                            ${product?.salePrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Actions */}
                  <CardFooter className="p-4 pt-0">
                    {product?.totalStock === 0 ? (
                      <Button
                        disabled
                        className="w-full opacity-50 cursor-not-allowed"
                      >
                        نفاذ المخزون
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            navigate("/auth/login", { state: { from: location.pathname } });
                            return;
                          }
                          handleAddToCart(productId, product?.totalStock);
                        }}
                        className="w-full bg-gradient-to-r from-primary to-primary/90 
                          hover:from-primary/90 hover:to-primary text-primary-foreground 
                          shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        أضف إلى السلة
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
