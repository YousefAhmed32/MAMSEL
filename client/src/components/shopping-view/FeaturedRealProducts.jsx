import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { getProductImageUrl, getProductImages } from "@/utils/imageUtils";

const FeaturedRealProducts = ({ 
  sectionTitle = "Best Selling",
  showBestSellingLabel = true,
  maxProducts = 2 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { productList, isLoading } = useSelector((state) => state.shopProducts);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    // Fetch all products
    dispatch(fetchAllFilteredProducts({
      filtersParams: {},
      sortParams: "price-lowtohigh",
    }));
  }, [dispatch]);

  useEffect(() => {
    if (productList && productList.length > 0) {
      let filtered = [...productList].filter(p => p.isActive !== false);

      // If section is "Best Selling", sort by actual sales (sold count)
      if (sectionTitle.toLowerCase().includes("best selling") || 
          sectionTitle.toLowerCase().includes("bestselling")) {
        filtered = filtered
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, maxProducts);
      } else {
        // For other sections, use products with matching groups or top-rated
        const hasMatchingGroup = filtered.some(p => {
          const groups = p.groups || [];
          return groups.some(g => 
            g && g.toLowerCase().includes(sectionTitle.toLowerCase())
          );
        });

        if (hasMatchingGroup) {
          filtered = filtered
            .filter(p => {
              const groups = p.groups || [];
              return groups.some(g => 
                g && g.toLowerCase().includes(sectionTitle.toLowerCase())
              );
            })
            .slice(0, maxProducts);
        } else {
          // Fallback: use top-rated or most sold
          filtered = filtered
            .sort((a, b) => (b.sold || 0) - (a.sold || 0))
            .slice(0, maxProducts);
        }
      }

      setFeaturedProducts(filtered);
    } else {
      setFeaturedProducts([]);
    }
  }, [productList, sectionTitle, maxProducts]);

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

  const isBestSelling = (product) => {
    if (!showBestSellingLabel) return false;
    
    // Check if product has best-selling in groups
    const groups = product.groups || [];
    const hasBestSellingGroup = groups.some(
      (group) =>
        group &&
        (group.toLowerCase().includes("best-selling") ||
          group.toLowerCase().includes("best selling") ||
          group.toLowerCase() === "bestselling")
    );

    // Or check if it's in top sellers by sold count
    if (!hasBestSellingGroup && featuredProducts.length > 0) {
      const topSold = Math.max(...featuredProducts.map(p => p.sold || 0));
      return (product.sold || 0) >= topSold * 0.8; // Top 80% of best sellers
    }

    return hasBestSellingGroup;
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center bg-white dark:bg-[#0f0f0f]">
        <div className="text-gray-400 text-sm font-light">Loading...</div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="w-full bg-white dark:bg-[#0f0f0f] py-12 md:py-16 lg:py-24 transition-colors duration-300">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Minimal */}
        <div className="mb-8 md:mb-12 lg:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 dark:text-white mb-3">
            {sectionTitle}
          </h2>
          <div className="w-12 h-px bg-gray-300 dark:bg-gray-700 mx-auto" />
        </div>

        {/* Hero Products Grid */}
        <div className={`grid gap-4 md:gap-6 lg:gap-8 ${
          featuredProducts.length === 1 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {featuredProducts.map((product, index) => {
            const productImages = getProductImages(product);
            const mainImage = productImages[0] || getProductImageUrl(product);
            const hoverImage = productImages[1] || mainImage;
            const isHovered = hoveredProduct === product._id;
            const showLabel = isBestSelling(product);

            return (
              <div
                key={product._id}
                className="group relative overflow-hidden bg-white dark:bg-[#0f0f0f] rounded-3xl transition-all duration-500 ease-out hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.05)]"
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image Container */}
                <div className="relative w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-900">
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

                  {/* Subtle Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-500 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Best Selling Label - Only if truly best selling */}
                  {showLabel && (
                    <div className="absolute top-6 left-6 z-10">
                      <span className="inline-block px-4 py-1.5 text-xs font-light tracking-wider uppercase text-gray-900 dark:text-white bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-800">
                        {product.sold > 0 ? "Best Selling" : "Top Pick"}
                      </span>
                    </div>
                  )}

                  {/* Quick Actions - Appear on Hover */}
                  <div
                    className={`absolute bottom-6 left-6 right-6 flex gap-3 transition-all duration-500 ${
                      isHovered
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <Button
                      onClick={() => handleViewDetails(product._id)}
                      variant="outline"
                      className="flex-1 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-[#0f0f0f] hover:border-gray-300 dark:hover:border-gray-700 font-light text-sm py-3 rounded-xl transition-all duration-300"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.totalStock === 0}
                      className="flex-1 bg-gray-900 dark:bg-white text-white/90 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-light text-sm py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </div>
                </div>

                {/* Product Info - Minimal */}
                <div className="p-6 md:p-8 lg:p-10 space-y-3">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-xs font-light tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">
                      {typeof product.brand === "object" && product.brand !== null
                        ? product.brand.nameEn || product.brand.name || ""
                        : String(product.brand || "")}
                    </p>
                  )}

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-900 dark:text-white tracking-tight leading-tight">
                    {product.title || product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 pt-2">
                    {product.salePrice && product.salePrice < product.price ? (
                      <>
                        <span className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white">
                          ${product.salePrice}
                        </span>
                        <span className="text-sm font-light text-gray-400 dark:text-gray-500 line-through">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  {/* View Details Link - Desktop */}
                  <button
                    onClick={() => handleViewDetails(product._id)}
                    className="hidden md:flex items-center gap-2 text-sm font-light text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 pt-2 group/link"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link - Minimal */}
        {featuredProducts.length > 0 && (
          <div className="mt-12 md:mt-16 text-center">
            <button
              onClick={() => navigate("/shop/listing")}
              className="inline-flex items-center gap-2 text-sm font-light text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedRealProducts;
