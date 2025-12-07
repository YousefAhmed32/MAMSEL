import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { getProductImageUrl, getProductImages } from "@/utils/imageUtils";
import { toggleWishlistItem, selectIsInWishlist } from "@/store/shop/wishlist-slice";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BestSellingSection = ({ onViewDetails, onAddToCart }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.shopProducts);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    // Fetch all products
    dispatch(fetchAllFilteredProducts({
      filtersParams: {},
      sortParams: "price-lowtohight",
    }));
  }, [dispatch]);

  useEffect(() => {
    // Filter products marked as Best Selling
    if (productList && productList.length > 0) {
      const filtered = productList.filter((product) => {
        const groups = product.groups || [];
        return groups.some(
          (group) =>
            group &&
            (group.toLowerCase().includes("best-selling") ||
              group.toLowerCase().includes("best selling") ||
              group.toLowerCase() === "bestselling")
        );
      });
      
      // If no products marked as best-selling, use top-selling products (by sold count) as fallback
      if (filtered.length === 0) {
        const topSelling = [...productList]
          .filter(p => p.isActive !== false)
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 6);
        console.log('Best Selling: No products with best-selling group, using top-selling products:', topSelling.length);
        setBestSellingProducts(topSelling);
      } else {
        console.log('Best Selling: Found products with best-selling group:', filtered.length);
        setBestSellingProducts(filtered);
      }
    } else {
      console.log('Best Selling: No products available');
      setBestSellingProducts([]);
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
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: isInWishlist
          ? `${product?.title || product?.name} removed from wishlist`
          : `${product?.title || product?.name} added to wishlist`,
      });
    };

    return (
      <Button
        size="icon"
        variant="outline"
        onClick={handleWishlistToggle}
        className="bg-white/95 dark:bg-[#0f0f0f]/95 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0a0a0f] transition-all duration-300"
        title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
      </Button>
    );
  };

  // Product Card Component
  const ProductCard = ({ product, index, isLarge = false }) => {
    const productImages = getProductImages(product);
    const firstImage = productImages[0] || getProductImageUrl(product);
    const secondImage = productImages[1] || productImages[0] || getProductImageUrl(product);
    const isHovered = hoveredProduct === product._id;

    return (
      <Card
        key={product._id}
        className={`group luxury-card bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] dark:hover:shadow-[0_20px_40px_rgba(212,175,55,0.25)] ${
          isLarge ? "h-full" : ""
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={() => setHoveredProduct(product._id)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        {/* Product Image */}
        <div
          className={`relative overflow-hidden bg-gray-50 dark:bg-gray-900 ${
            isLarge ? "h-[500px] sm:h-[600px]" : "h-96"
          }`}
        >
          {/* Background Image (Second Image) - Fades in on hover */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={secondImage}
              alt={`${product.title || product.name} - View 2`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Split Image Container (First Image) */}
          <div className="absolute inset-0">
            {/* Top Half */}
            <div
              className={`absolute top-[.18px] left-0 w-full h-full transition-all duration-700 ease-in-out ${
                isHovered ? "-translate-y-full" : "translate-y-0"
              }`}
              style={{
                clipPath: isHovered
                  ? "polygon(0 0, 100% 0, 50% 100%, 0 100%)"
                  : "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
                WebkitClipPath: isHovered
                  ? "polygon(0 0, 100% 0, 50% 100%, 0 100%)"
                  : "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
              }}
            >
              <img
                src={firstImage}
                alt={product.title || product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Bottom Half */}
            <div
              className={`absolute bottom-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${
                isHovered ? "translate-y-full" : "translate-y-0"
              }`}
              style={{
                clipPath: isHovered
                  ? "polygon(50% 0, 100% 0, 100% 100%, 0 100%)"
                  : "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
                WebkitClipPath: isHovered
                  ? "polygon(50% 0, 100% 0, 100% 100%, 0 100%)"
                  : "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
              }}
            >
              <img
                src={firstImage}
                alt={product.title || product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Subtle Glow Effect */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isHovered
                ? "opacity-100 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-transparent"
                : "opacity-0"
            }`}
          />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetails) {
                  onViewDetails(product._id);
                } else {
                  navigate(`/shop/product/${product._id}`);
                }
              }}
              className="bg-white/95 dark:bg-[#0f0f0f]/95 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0a0a0f] transition-all duration-300"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  navigate("/auth/login", { state: { from: location.pathname } });
                  toast({
                    title: "Login Required",
                    description: "Please login to add product to cart",
                    variant: "destructive",
                  });
                  return;
                }

                if (onAddToCart) {
                  onAddToCart(product._id);
                } else {
                  dispatch(
                    addToCart({ userId: user?.id, productId: product._id, quantity: 1 })
                  ).then((data) => {
                    if (data?.payload?.success) {
                      dispatch(fetchCartItems(user?.id));
                      toast({
                        title: "Added to Cart",
                        description: product.title || product.name,
                      });
                    }
                  });
                }
              }}
              className="bg-white/95 dark:bg-[#0f0f0f]/95 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0a0a0f] transition-all duration-300"
              disabled={product.totalStock === 0}
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <WishlistHeartButton product={product} />
          </div>
        </div>

        {/* Product Info */}
        <CardContent className={`p-6 sm:p-8 space-y-5 bg-white dark:bg-[#0f0f0f] ${isLarge ? "sm:p-10" : ""}`}>
          {/* Product Name */}
          <div>
            <h3
              className={`font-serif font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-1 ${
                isLarge ? "text-2xl sm:text-3xl" : "text-xl"
              }`}
            >
              {product.title || product.name}
            </h3>
            {product.brand && (
              <p className="text-[#D4AF37] text-xs uppercase tracking-wider font-medium">
                {typeof product.brand === "object" && product.brand !== null
                  ? product.brand.name || product.brand.nameEn || String(product.brand._id || "")
                  : String(product.brand || "")}
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (product.rating || 4)
                      ? "text-[#D4AF37] fill-[#D4AF37]"
                      : "text-gray-300 dark:text-gray-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Description */}
          <p
            className={`text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[40px] ${
              isLarge ? "text-base" : "text-sm"
            }`}
          >
            {product.description || "Luxury designer product"}
          </p>

          {/* Price and Add to Cart */}
          <div className="space-y-4 pt-2">
            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span
                    className={`font-serif font-semibold text-[#D4AF37] ${
                      isLarge ? "text-3xl sm:text-4xl" : "text-2xl"
                    }`}
                  >
                    ${product.salePrice}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 line-through text-base">
                    ${product.price}
                  </span>
                  <span className="ml-auto bg-[#D4AF37] text-[#0a0a0f] text-xs px-2 py-1 rounded-sm font-medium">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span
                  className={`font-serif font-semibold text-[#D4AF37] ${
                    isLarge ? "text-3xl sm:text-4xl" : "text-2xl"
                  }`}
                >
                  ${product.price}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={(e) => {
                if (!user) {
                  navigate("/auth/login", { state: { from: location.pathname } });
                  toast({
                    title: "Login Required",
                    description: "Please login to add product to cart",
                    variant: "destructive",
                  });
                  return;
                }
                e.stopPropagation();
                if (onAddToCart) {
                  onAddToCart(product._id);
                } else {
                  dispatch(
                    addToCart({ userId: user?.id, productId: product._id, quantity: 1 })
                  ).then((data) => {
                    if (data?.payload?.success) {
                      dispatch(fetchCartItems(user?.id));
                      toast({
                        title: "Added to Cart",
                        description: product.title || product.name,
                      });
                    }
                  });
                }
              }}
              disabled={product.totalStock === 0}
              className={`w-full bg-[#D4AF37] text-white/90 hover:bg-[#E5C158] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLarge ? "py-4 text-base" : "py-3 text-sm"
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show section even if empty (fallback will show top-selling products)
  const hasFewItems = bestSellingProducts.length <= 2;
  const initialProducts = bestSellingProducts.slice(0, 3);
  const remainingProducts = bestSellingProducts.slice(3);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-12 mt-10">
        <div className="flex-1">
          <h2 className="text-4xl sm:text-5xl  font-serif font-semibold text-gray-900 dark:text-white mb-4 tracking-wide">
            Best Selling
          </h2>
          <div className="w-16 h-[1px] bg-[#D4AF37] mb-6" />
          <p className="text-gray-600 dark:text-gray-400 text-base font-light max-w-2xl">
            Discover our most popular products, loved by customers worldwide.
          </p>
        </div>
        <Button
          onClick={() => navigate("/shop/listing")}
          variant="outline"
          className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0a0a0f] px-6 py-2 text-sm font-medium transition-all duration-300 hidden sm:flex"
        >
          View All
        </Button>
      </div>

      {/* Show message if no products */}
      {bestSellingProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No best-selling products available at the moment.
          </p>
        </div>
      ) : (
        <>
          {/* Display Logic */}
          {hasFewItems ? (
        /* Few Items: 2 Large Cards Side-by-Side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {bestSellingProducts.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} isLarge={true} />
          ))}
        </div>
      ) : (
        /* Many Items: 3 Initial + Slider for Rest */
        <>
          {/* First 3 Products - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-8">
            {initialProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} isLarge={false} />
            ))}
          </div>

          {/* Remaining Products - Swiper Slider */}
          {remainingProducts.length > 0 && (
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={32}
                slidesPerView={1}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  1024: {
                    slidesPerView: 3,
                  },
                }}
                navigation={{
                  nextEl: ".swiper-button-next-best",
                  prevEl: ".swiper-button-prev-best",
                }}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination-best",
                }}
                className="best-selling-swiper"
              >
                {remainingProducts.map((product, index) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard
                      product={product}
                      index={index + 3}
                      isLarge={false}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons */}
              <button className="swiper-button-prev-best absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-[#0f0f0f]/90 border border-gray-300 dark:border-gray-700 rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300 shadow-lg">
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="swiper-button-next-best absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-[#0f0f0f]/90 border border-gray-300 dark:border-gray-700 rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300 shadow-lg">
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
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
              </button>

              {/* Custom Pagination */}
              <div className="swiper-pagination-best flex justify-center gap-2 mt-8"></div>
            </div>
          )}
        </>
      )}
        </>
      )}

      {/* View All Button - Mobile */}
      {bestSellingProducts.length > 0 && (
        <div className="text-center mt-12 sm:hidden">
          <Button
            onClick={() => navigate("/shop/listing")}
            variant="outline"
            className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0a0a0f] px-8 py-3 text-sm font-medium transition-all duration-300"
          >
            View All Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default BestSellingSection;

