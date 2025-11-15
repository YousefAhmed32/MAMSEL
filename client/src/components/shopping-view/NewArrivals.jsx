import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { getProductImageUrl } from "@/utils/imageUtils";
import { toggleWishlistItem, selectIsInWishlist } from "@/store/shop/wishlist-slice";

const NewArrivals = ({ onViewDetails, onAddToCart }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.shopProducts);
  const [randomProducts, setRandomProducts] = useState([]);
  const [imageLoading, setImageLoading] = useState({});

  useEffect(() => {
    // Fetch all products
    dispatch(fetchAllFilteredProducts({
      filtersParams: {},
      sortParams: "price-lowtohight",
    }));
  }, [dispatch]);

  useEffect(() => {
    // Generate random products when productList changes
    if (productList && productList.length > 0) {
      const shuffled = [...productList].sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 6));
    }
  }, [productList]);

  // Wishlist Button Component
  const WishlistHeartButton = ({ product }) => {
    const productId = product._id || product.id;
    const isInWishlist = useSelector((state) => selectIsInWishlist(state, productId));

    const handleWishlistToggle = (e) => {
      e.stopPropagation();
      dispatch(toggleWishlistItem(product));
      toast({
        title: isInWishlist ? "تمت الإزالة من المفضلة" : "تمت الإضافة إلى المفضلة",
        description: isInWishlist
          ? `${product?.title || product?.name} تمت إزالته من قائمة المفضلة`
          : `${product?.title || product?.name} تمت إضافته إلى قائمة المفضلة`,
      });
    };



    return (
      <Button
        size="icon"
        variant="outline"
        onClick={handleWishlistToggle}
        className={`backdrop-blur-sm shadow-[0_0_15px_rgba(210,176,101,0.6)] transition-all duration-300 ${isInWishlist
            ? "bg-red-500/90 hover:bg-red-600 border-red-500/50 text-white"
            : "bg-luxury-gold/95 border-luxury-gold text-luxury-navy hover:bg-luxury-gold-light hover:text-luxury-navy"
          }`}
        title={isInWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : "fill-none"}`} />
      </Button>
    );
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-16 mt-10">
        <h2 className="text-5xl font-serif font-bold luxury-text mb-4 tracking-wide">
          الوافدون الجدد
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light mx-auto rounded-full" />
        <p className="text-white/70 mt-6 text-lg font-light max-w-3xl mx-auto">
          كن أول من يجرب مجموعتنا الأحدث من العود الفاخر، حيث تمثل كل قطعة تحفة فنية تعكس براعة صناعة العود الحديثة.
        </p>

      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {randomProducts.map((product, index) => (
          <Card
            key={product._id}
            className="group luxury-card bg-white dark:bg-gray-950 border border-gray-200 dark:border-luxury-gold/30 rounded-2xl overflow-hidden hover:border-luxury-gold dark:hover:border-luxury-gold transition-all duration-500 hover:shadow-[0_0_30px_rgba(210,176,101,0.2)] dark:hover:shadow-[0_0_30px_rgba(210,176,101,0.3)]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Product Image */}
            <div className="relative overflow-hidden">
              <img
                src={getProductImageUrl(product)}
                alt={product.title || product.name}
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(product._id);
                  }}
                  className="bg-luxury-gold/95 border-luxury-gold text-luxury-navy hover:bg-luxury-gold-light hover:text-luxury-navy shadow-[0_0_15px_rgba(210,176,101,0.6)] backdrop-blur-sm"
                  title="عرض التفاصيل"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();

                    // Check if user is logged in
                    if (!user) {
                      toast({
                        title: "يجب تسجيل الدخول أولاً",
                        description: "يرجى تسجيل الدخول لإضافة المنتج إلى السلة",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Check if product is out of stock
                    if (product.totalStock === 0) {
                      toast({
                        title: "المنتج غير متوفر",
                        description: "هذا المنتج غير متوفر حالياً",
                        variant: "destructive"
                      });
                      return;
                    }

                    if (onAddToCart) {
                      onAddToCart(product._id);
                    } else {
                      dispatch(addToCart({ userId: user?.id, productId: product._id, quantity: 1 }))
                        .then((data) => {
                          if (data?.payload?.success) {
                            dispatch(fetchCartItems(user?.id));
                            toast({
                              title: "تمت إضافة المنتج إلى السلة",
                              description: product.title || product.name
                            });
                          } else {
                            toast({
                              title: "خطأ في الإضافة",
                              description: data?.payload?.message || "فشل إضافة المنتج إلى السلة",
                              variant: "destructive"
                            });
                          }
                        })
                        .catch((error) => {
                          console.error("Error adding to cart:", error);
                          toast({
                            title: "خطأ في الإضافة",
                            description: "حدث خطأ أثناء إضافة المنتج إلى السلة",
                            variant: "destructive"
                          });
                        });
                    }
                  }}
                  className="bg-luxury-gold/95 border-luxury-gold text-luxury-navy hover:bg-luxury-gold-light hover:text-luxury-navy shadow-[0_0_15px_rgba(210,176,101,0.6)] backdrop-blur-sm"
                  disabled={product.totalStock === 0}
                  title="أضف إلى السلة"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <WishlistHeartButton product={product} />
              </div>
            </div>

            {/* Product Info */}
            <CardContent className="p-6 space-y-4 bg-white dark:bg-gray-950">
              {/* Product Name */}
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white mb-1 group-hover:text-luxury-gold transition-colors duration-300 line-clamp-1">
                  {product.title || product.name}
                </h3>
                {product.brand && (
                  <p className="text-luxury-gold text-xs uppercase tracking-wider font-semibold">
                    {typeof product.brand === 'object' && product.brand !== null
                      ? (product.brand.name || product.brand.nameEn || String(product.brand._id || ''))
                      : String(product.brand || '')}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < (product.rating || 4) ? 'text-luxury-gold fill-luxury-gold' : 'text-gray-300 dark:text-white/30'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-white/80 text-xs font-semibold">({product.reviewCount || 0})</span>
                <div className="flex-1 border-t border-gray-200 dark:border-white/10"></div>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-white/90 text-sm leading-relaxed line-clamp-2 min-h-[40px] font-medium">
                {product.description || 'منتج فاخر متميز'}
              </p>

              {/* Price and Add to Cart */}
              <div className="space-y-3 pt-2">
                {/* Price */}
                <div className="flex items-baseline gap-2 bg-gray-50 dark:bg-luxury-navy border border-gray-200 dark:border-luxury-gold/40 p-3 rounded-lg shadow-sm dark:shadow-lg dark:bg-gray-950">
                  {product.salePrice && product.salePrice < product.price ? (
                    <>
                      <span className="text-3xl font-bold text-luxury-gold drop-shadow-lg dark:text-luxury-gold">
                        QR{product.salePrice}
                      </span>
                      <span className="text-gray-500 dark:text-white/50 line-through text-lg font-medium">
                        QR{product.price}
                      </span>
                      <span className="ml-auto bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                        خصم {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-luxury-gold drop-shadow-lg dark:text-luxury-gold">
                      QR{product.price}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();

                    // Check if user is logged in
                    if (!user) {
                      toast({
                        title: "يجب تسجيل الدخول أولاً",
                        description: "يرجى تسجيل الدخول لإضافة المنتج إلى السلة",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Check if product is out of stock
                    if (product.totalStock === 0) {
                      toast({
                        title: "المنتج غير متوفر",
                        description: "هذا المنتج غير متوفر حالياً",
                        variant: "destructive"
                      });
                      return;
                    }

                    if (onAddToCart) {
                      onAddToCart(product._id);
                    } else {
                      dispatch(addToCart({ userId: user?.id, productId: product._id, quantity: 1 }))
                        .then((data) => {
                          if (data?.payload?.success) {
                            dispatch(fetchCartItems(user?.id));
                            toast({
                              title: "تمت إضافة المنتج إلى السلة",
                              description: product.title || product.name
                            });
                          } else {
                            toast({
                              title: "خطأ في الإضافة",
                              description: data?.payload?.message || "فشل إضافة المنتج إلى السلة",
                              variant: "destructive"
                            });
                          }
                        })
                        .catch((error) => {
                          console.error("Error adding to cart:", error);
                          toast({
                            title: "خطأ في الإضافة",
                            description: "حدث خطأ أثناء إضافة المنتج إلى السلة",
                            variant: "destructive"
                          });
                        });
                    }
                  }}
                  disabled={product.totalStock === 0}
                  className="w-full bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-luxury-navy hover:from-luxury-gold-light hover:to-luxury-gold font-bold py-3 text-base shadow-[0_4px_15px_rgba(210,176,101,0.3)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(210,176,101,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <ShoppingCart className="w-5 h-5 ml-2" />
                  {product.totalStock === 0 ? 'نفدت الكمية' : 'أضف إلى السلة'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-12">
        <Button
          onClick={() => navigate('/shop/listing')}
          variant="outline"
          className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy luxury-btn px-8 py-3 text-lg"
        >
          استكشاف جميع المنتجات
        </Button>
      </div>
    </div>
  );
};

export default NewArrivals;
