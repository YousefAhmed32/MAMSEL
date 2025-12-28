import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { getProductImageUrl } from "@/utils/imageUtils";
import { toggleWishlistItem, selectIsInWishlist } from "@/store/shop/wishlist-slice";

const AllProducts = ({ onViewDetails, onAddToCart }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.shopProducts);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 12; // عدد المنتجات المعروضة في البداية

  useEffect(() => {
    // Fetch all products
    dispatch(fetchAllFilteredProducts({
      filtersParams: {},
      sortParams: "price-lowtohight",
    }));
  }, [dispatch]);

  useEffect(() => {
    // عرض جميع المنتجات أو عدد محدود حسب الحالة
    if (productList && productList.length > 0) {
      if (showAll) {
        setDisplayedProducts(productList);
      } else {
        setDisplayedProducts(productList.slice(0, itemsPerPage));
      }
    }
  }, [productList, showAll]);

  // Wishlist Button Component
  const WishlistHeartButton = ({ product }) => {
    const productId = product._id || product.id;
    const isInWishlist = useSelector((state) => selectIsInWishlist(state, productId));

    const handleWishlistToggle = (e) => {
      e.stopPropagation();
      dispatch(toggleWishlistItem(product));
      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlist 
          ? `Removed ${product?.title || product?.name} from the wishlist`
          : `Added ${product?.title || product?.name} to the wishlist`,
      });
    };

    return (
      <Button
        size="icon"
        variant="outline"
        onClick={handleWishlistToggle}
        className={`backdrop-blur-sm shadow-[0_0_15px_rgba(210,176,101,0.6)] transition-all duration-300 z-50 relative pointer-events-auto ${
          isInWishlist
            ? "bg-red-500/90 hover:bg-red-600 border-red-500/50 text-white"
            : "bg-luxury-gold/95 border-luxury-gold text-luxury-navy hover:bg-luxury-gold-light hover:text-luxury-navy"
        }`}
        title={isInWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : "fill-none"}`} />
      </Button>
    );
  };

  const handleAddToCartClick = (e, productId, totalStock) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (totalStock === 0) {
      toast({
        title: "Product is not available",
        description: "This product is not available currently",
        variant: "destructive"
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart(productId);
    }
  };

  return (
    <div className="w-full relative z-30 pointer-events-auto">
      {/* Section Header */}
      <div className="text-center mb-16 mt-10 pointer-events-none">
        <h2 className="text-5xl font-serif font-bold luxury-text mb-4 tracking-wide">
          All Products
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light mx-auto rounded-full" />
        <p className="text-white/70 mt-6 text-lg font-light max-w-3xl mx-auto">
          Explore our complete collection of luxurious incense, each carefully selected to provide a unique and exceptional experience.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-30 pointer-events-auto">
        {displayedProducts.map((product, index) => (
          <Card
            key={product._id}
            className="group luxury-card bg-white dark:bg-gray-950 border border-gray-200 dark:border-luxury-gold/30 rounded-2xl overflow-hidden hover:border-luxury-gold dark:hover:border-luxury-gold transition-all duration-500 hover:shadow-[0_0_30px_rgba(210,176,101,0.2)] dark:hover:shadow-[0_0_30px_rgba(210,176,101,0.3)] flex flex-col relative z-30 pointer-events-auto cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={(e) => {
              // Allow card click to navigate to product details
              if (e.target.closest('button') === null) {
                onViewDetails(product._id);
              }
            }}
          >
            {/* Product Image */}
            <div className="relative overflow-hidden flex-shrink-0">
              <img
                src={getProductImageUrl(product)}
                alt={product.title || product.name}
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay - pointer-events-none to prevent blocking */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-auto">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onViewDetails(product._id);
                  }}
                  className="bg-luxury-gold/95 border-luxury-gold text-luxury-navy hover:bg-luxury-gold-light hover:text-luxury-navy shadow-[0_0_15px_rgba(210,176,101,0.6)] backdrop-blur-sm relative z-50 pointer-events-auto"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    if (!user) {
                      navigate("/auth/login", { state: { from: location.pathname } });
                      return;
                    }

                    if (product.totalStock === 0) {
                      toast({
                        title: "Product is not available",
                        description: "This product is not available currently",
                        variant: "destructive"
                      });
                      return;
                    }

                    if (onAddToCart) {
                      onAddToCart(product._id);
                    }
                  }}
                  className="bg-luxury-gold/95 border-luxury-gold text-luxury-navy hover:bg-luxury-gold-light hover:text-luxury-navy shadow-[0_0_15px_rgba(210,176,101,0.6)] backdrop-blur-sm relative z-50 pointer-events-auto"
                  disabled={product.totalStock === 0}
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <WishlistHeartButton product={product} />
              </div>
            </div>

            {/* Product Info */}
            <CardContent className="p-6 space-y-4 bg-white dark:bg-gray-950 flex-1 flex flex-col relative z-10">
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
                      className={`w-4 h-4 ${
                        i < (product.rating || 4) ? 'text-luxury-gold fill-luxury-gold' : 'text-gray-300 dark:text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-white/80 text-xs font-semibold">({product.reviewCount || 0})</span>
                <div className="flex-1 border-t border-gray-200 dark:border-white/10"></div>
              </div>
              
              {/* Description */}
              <p className="text-gray-700 dark:text-white/90 text-sm leading-relaxed line-clamp-2 min-h-[40px] font-medium">
                {product.description || 'Luxurious Product'}
              </p>
              
              {/* Price */}
              <div className="flex items-baseline gap-2 bg-gray-50 dark:bg-luxury-navy border border-gray-200 dark:border-luxury-gold/40 p-3 rounded-lg shadow-sm dark:shadow-lg dark:bg-gray-950 mb-3">
                {product.salePrice && product.salePrice < product.price ? (
                  <>
                    <span className="text-3xl font-bold text-luxury-gold drop-shadow-lg dark:text-luxury-gold">
                      QR{product.salePrice}
                    </span>
                    <span className="text-gray-500 dark:text-white/50 line-through text-lg font-medium">
                      QR{product.price}
                    </span>
                    <span className="ml-auto bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                      Discount {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-luxury-gold drop-shadow-lg dark:text-luxury-gold">
                    QR{product.price}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <div className="mt-auto relative z-20">
                {product.totalStock === 0 ? (
                  <Button 
                    className="w-full opacity-50 cursor-not-allowed bg-gray-400 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 text-white font-semibold relative z-20"
                    disabled
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-gold-500 via-gold-600 to-gold-500 hover:from-gold-600 hover:via-gold-700 hover:to-gold-600 text-white dark:text-navy-950 font-bold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn z-20"
                    onClick={(e) => {
                      if (!user) {
                        navigate("/auth/login", { state: { from: location.pathname } });
                        return;
                      }
                      handleAddToCartClick(e, product._id, product.totalStock);
                    }}
                    type="button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 pointer-events-none" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {productList && productList.length > itemsPerPage && (
        <div className="text-center mt-12 relative z-30 pointer-events-auto">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy luxury-btn px-8 py-3 text-lg relative z-30 pointer-events-auto"
          >
              {showAll ? "Show Less" : `Show All Products (${productList.length})`}
          </Button>
        </div>
      )}

      {/* View All Button */}
      <div className="text-center mt-6 relative z-30 pointer-events-auto">
        <Button
          onClick={() => navigate('/shop/listing')}
          variant="outline"
          className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy luxury-btn px-8 py-3 text-lg relative z-30 pointer-events-auto"
        >
          استكشاف جميع المنتجات
        </Button>
      </div>
    </div>
  );
};

export default AllProducts;

