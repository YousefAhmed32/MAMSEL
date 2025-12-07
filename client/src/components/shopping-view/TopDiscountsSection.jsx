import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { getProductImageUrl, getProductImages } from "@/utils/imageUtils";

const TopDiscountsSection = ({ 
  layout = "A", // "A" for Hero Top, "B" for Hero Bottom
  showCountdown = false,
  countdownHours = 24
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { productList, isLoading } = useSelector((state) => state.shopProducts);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Calculate discount percentage
  const calculateDiscount = (product) => {
    if (!product.salePrice || product.salePrice >= product.price) return 0;
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  };

  // Countdown timer effect
  useEffect(() => {
    if (showCountdown && countdownHours > 0) {
      const endTime = new Date().getTime() + countdownHours * 60 * 60 * 1000;
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeRemaining({ hours, minutes, seconds });
        } else {
          setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [showCountdown, countdownHours]);

  useEffect(() => {
    // Fetch all products
    dispatch(fetchAllFilteredProducts({
      filtersParams: {},
      sortParams: "price-lowtohigh",
    }));
  }, [dispatch]);

  useEffect(() => {
    if (productList && productList.length > 0) {
      // Filter products with discounts
      const productsWithDiscounts = productList
        .filter(p => {
          return p.isActive !== false && 
                 p.salePrice && 
                 p.salePrice < p.price &&
                 p.totalStock > 0;
        })
        .map(product => ({
          ...product,
          discountPercent: calculateDiscount(product)
        }))
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, 3); // Top 3 products with highest discounts

      setDiscountedProducts(productsWithDiscounts);
    } else {
      setDiscountedProducts([]);
    }
  }, [productList]);

  const handleViewDetails = (productId) => {
    navigate(`/shop/product/${productId}`);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate("/auth/login", { state: { from: location.pathname } });
      toast({
        title: "Login Required",
        description: "Please login to add product to cart",
        variant: "destructive",
      });
      return;
    }

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
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#0f0f0f]">
        <div className="text-gray-400 text-sm font-light">Loading...</div>
      </div>
    );
  }

  if (discountedProducts.length === 0) {
    return null; // Don't show section if no discounted products
  }

  // Separate products based on layout
  const heroProduct = discountedProducts[0]; // Highest discount
  const otherProducts = discountedProducts.slice(1);

  // Product Card Component
  const ProductCard = ({ product, isHero = false }) => {
    const productImages = getProductImages(product);
    const mainImage = productImages[0] || getProductImageUrl(product);
    const hoverImage = productImages[1] || mainImage;
    const isHovered = hoveredProduct === product._id;
    const discountPercent = calculateDiscount(product);

    return (
      <div
        className={`group relative overflow-hidden bg-white dark:bg-[#0f0f0f] rounded-3xl transition-all duration-500 ease-out hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.08)] ${
          isHero ? "cursor-pointer" : ""
        }`}
        onMouseEnter={() => setHoveredProduct(product._id)}
        onMouseLeave={() => setHoveredProduct(null)}
        onClick={() => isHero && handleViewDetails(product._id)}
      >
        {/* Product Image Container */}
        <div className={`relative w-full overflow-hidden bg-gray-50 dark:bg-gray-900 ${
          isHero 
            ? "aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5]" 
            : "aspect-[4/5]"
        }`}>
          {/* Main Image */}
          <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
            <img
              src={mainImage}
              alt={product.title || product.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Hover Image */}
          {hoverImage !== mainImage && (
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={hoverImage}
                alt={`${product.title || product.name} - View 2`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-60"
            }`}
          />

          {/* Discount Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-block px-4 py-2 text-sm font-semibold tracking-wide uppercase text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
              {discountPercent}% OFF
            </span>
          </div>

          {/* Shop Now Button - Appear on Hover */}
          <div
            className={`absolute bottom-4 left-4 right-4 transition-all duration-500 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(product._id);
              }}
              className="w-full bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-light text-sm py-3 rounded-xl transition-all duration-300 shadow-lg"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className={`p-6 space-y-3 ${isHero ? "md:p-8 lg:p-10" : ""}`}>
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-light tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">
              {typeof product.brand === "object" && product.brand !== null
                ? product.brand.nameEn || product.brand.name || ""
                : String(product.brand || "")}
            </p>
          )}

          {/* Title */}
          <h3 className={`font-light text-gray-900 dark:text-white tracking-tight leading-tight ${
            isHero ? "text-xl md:text-2xl lg:text-3xl" : "text-lg md:text-xl"
          }`}>
            {product.title || product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-baseline gap-3 pt-2">
            <span className={`font-light text-gray-900 dark:text-white ${
              isHero ? "text-2xl md:text-3xl lg:text-4xl" : "text-xl md:text-2xl"
            }`}>
              ${product.salePrice}
            </span>
            <span className={`font-light text-gray-400 dark:text-gray-500 line-through ${
              isHero ? "text-lg md:text-xl" : "text-base"
            }`}>
              ${product.price}
            </span>
          </div>

          {/* Quick Add to Cart - Mobile */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={product.totalStock === 0}
            className="md:hidden w-full  bg-gray-900 dark:bg-white text-white/90 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-light text-sm py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-3"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-white dark:from-[#0a0a0a] dark:to-[#0f0f0f] py-12 md:py-16 lg:py-24 transition-colors duration-300">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 lg:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 dark:text-white mb-3">
            Top Discounts
          </h2>
          <div className="w-12 h-px bg-gray-300 dark:bg-gray-700 mx-auto mb-4" />
          <p className="text-sm md:text-base font-light text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our best deals with the highest discounts
          </p>
          
          {/* Countdown Timer */}
          {showCountdown && timeRemaining && (
            <div className="mt-6 inline-flex items-center gap-4 px-6 py-3 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-light tracking-wider uppercase text-gray-500 dark:text-gray-400">
                Limited Time:
              </span>
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="text-lg font-light text-gray-900 dark:text-white">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs font-light text-gray-500 dark:text-gray-400">HRS</div>
                </div>
                <span className="text-gray-400 dark:text-gray-600">:</span>
                <div className="text-center">
                  <div className="text-lg font-light text-gray-900 dark:text-white">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs font-light text-gray-500 dark:text-gray-400">MIN</div>
                </div>
                <span className="text-gray-400 dark:text-gray-600">:</span>
                <div className="text-center">
                  <div className="text-lg font-light text-gray-900 dark:text-white">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs font-light text-gray-500 dark:text-gray-400">SEC</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layout A: Hero Top (1 large + 2 smaller) */}
        {layout === "A" && (
          <div className="space-y-6 md:space-y-8">

            {/* Two Smaller Products Side by Side */}
            {otherProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {otherProducts.map((product) => (
                  <ProductCard key={product._id} product={product} isHero={false} />
                ))}
              </div>
            )}
          </div>
        )}

          {/* Hero Product - Full Width */}
          {heroProduct && (
            <div className="w-1/2 ms-auto me-auto">
              <ProductCard product={heroProduct} isHero={true} />
            </div>
          )}
        {/* Layout B: Hero Bottom (2 larger on top + 1 largest below) */}
        {layout === "B" && (
          <div className="space-y-6 md:space-y-8">
            {/* Two Larger Products on Top */}
            {otherProducts.length > 0 && (
              <div className={`grid gap-6 md:gap-8 ${
                otherProducts.length >= 2 
                  ? "grid-cols-1 md:grid-cols-2" 
                  : "grid-cols-1"
              }`}>
                {otherProducts.slice(0, 2).map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    isHero={false}
                  />
                ))}
              </div>
            )}

            {/* Hero Product - Full Width Below */}
            {heroProduct && (
              <div className="w-full">
                <ProductCard product={heroProduct} isHero={true} />
              </div>
            )}
          </div>
        )}

        {/* View All Link */}
        {discountedProducts.length > 0 && (
          <div className="mt-12 md:mt-16 text-center">
            <button
              onClick={() => navigate("/shop/listing")}
              className="inline-flex items-center gap-2 text-sm font-light text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 group"
            >
              <span>View All Discounted Products</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopDiscountsSection;
