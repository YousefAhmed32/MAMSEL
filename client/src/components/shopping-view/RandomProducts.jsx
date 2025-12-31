import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { getProductImageUrl, getProductImages } from "@/utils/imageUtils";
import { toggleWishlistItem, selectIsInWishlist } from "@/store/shop/wishlist-slice";

const RandomProducts = ({ onViewDetails, onAddToCart }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.shopProducts);
  const [randomProducts, setRandomProducts] = useState([]);
  const [imageLoading, setImageLoading] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);

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
    const dispatch = useDispatch();
    const { toast } = useToast();
  
    const productId = product._id || product.id;
    const isInWishlist = useSelector((state) =>
      selectIsInWishlist(state, productId)
    );
  
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
  
    // return (
    //   <Button
    //     size="icon"
    //     variant="outline"
    //     onClick={handleWishlistToggle}
    //     className={`bg-white/95 dark:bg-[#0f0f0f]/95 border ${
    //       isInWishlist
    //         ? "border-[#D4AF37] text-[#D4AF37]"
    //         : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
    //     } hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0a0a0f] transition-all duration-300`}
    //     title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    //   >
    //     <Heart className={`w-4 h-4 ${isInWishlist ? "fill-[#D4AF37]" : ""}`} />
    //   </Button>
    // );
  };
  
  

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-16 mt-10">
        <h2 className="text-4xl sm:text-5xl font-serif font-semibold text-gray-900 dark:text-white mb-4 tracking-wide">
          Discover Our Collection
        </h2>
        <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto mb-6" />
        <p className="text-gray-600 dark:text-gray-400 mt-6 text-base font-light max-w-2xl mx-auto">
          Explore a carefully curated selection of our finest products, each chosen for exceptional quality and distinctive appeal.
        </p>
      </div>

      {/* Products Grid - Spacious Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {randomProducts.map((product, index) => (
          <Card
            key={product._id}
            className="group luxury-card bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Product Image - Split Hover Effect */}
            <div 
              className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 h-[500px]"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {(() => {
                const productImages = getProductImages(product);
                const firstImage = productImages[0] || getProductImageUrl(product);
                const secondImage = productImages[1] || productImages[0] || getProductImageUrl(product);
                const isHovered = hoveredProduct === product._id;
                
                return (
                  <>
                    {/* Background Image (Second Image) - Fades in on hover */}
                    <div 
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isHovered ? 'opacity-100' : 'opacity-0'
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
                      {/* Top Half - Moves up on hover, transforms to triangle */}
                      <div 
                        className={`absolute top-[.18px] left-0 w-full h-full transition-all duration-700 ease-in-out ${
                          isHovered ? '-translate-y-full' : 'translate-y-0'
                        }`}
                        style={{
                          clipPath: isHovered 
                            ? 'polygon(0 0, 100% 0, 50% 100%, 0 100%)' 
                            : 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                          WebkitClipPath: isHovered 
                            ? 'polygon(0 0, 100% 0, 50% 100%, 0 100%)' 
                            : 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                        }}
                      >
                        <img
                          src={firstImage}
                          alt={product.title || product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Bottom Half - Moves down on hover, transforms to triangle */}
                      <div 
                        className={`absolute bottom-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${
                          isHovered ? 'translate-y-full' : 'translate-y-0'
                        }`}
                        style={{
                          clipPath: isHovered 
                            ? 'polygon(50% 0, 100% 0, 100% 100%, 0 100%)' 
                            : 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
                          WebkitClipPath: isHovered 
                            ? 'polygon(50% 0, 100% 0, 100% 100%, 0 100%)' 
                            : 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
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
                  </>
                );
              })()}
              
              {/* Action Buttons - Minimalist */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(product._id);
                  }}
                  className="bg-white/95 dark:bg-[#0f0f0f]/95 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#eab308] hover:border-[#eab308] hover:text-[#0a0a0f] transition-all duration-300"
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
                            toast({ title: "Added to Cart", description: product.title || product.name });
                          }
                        });
                    }
                  }}
                  className="bg-white/95 dark:bg-[#0f0f0f]/95 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#eab308] hover:border-[#eab308] hover:text-[#0a0a0f] transition-all duration-300"
                  disabled={product.totalStock === 0}
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <WishlistHeartButton product={product} />
              </div>
            </div>

            {/* Product Info - Spacious Layout */}
     
            <CardContent className="p-6 sm:p-8 space-y-5 bg-white dark:bg-black">
  {/* Product Name */}
  <div>
    <h3 className="font-serif font-semibold text-xl text-black dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 line-clamp-1">
      {product.title || product.name}
    </h3>
    {product.brand && (
      <p className="text-black dark:text-white text-xs uppercase tracking-wider font-medium">
        {typeof product.brand === 'object' && product.brand !== null 
          ? (product.brand.name || product.brand.nameEn || String(product.brand._id || ''))
          : String(product.brand || '')}
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
            i < (product.rating || 4) ? 'text-black dark:text-white fill-current' : 'text-gray-300 dark:text-gray-700'
          }`}
        />
      ))}
    </div>
    <span className="text-gray-500 dark:text-gray-400 text-xs">({product.reviewCount || 0})</span>
  </div>
  
  {/* Description */}
  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
    {product.description || 'Luxury designer product'}
  </p>
  
  {/* Price and Add to Cart */}
  <div className="space-y-4 pt-2">
    {/* Price */}
    <div className="flex items-baseline gap-3">
      {product.salePrice && product.salePrice < product.price ? (
        <>
          <span className="text-2xl font-serif font-semibold text-black dark:text-white">
            QR${product.salePrice}
          </span>
          <span className="text-gray-400 dark:text-gray-500 line-through text-base">
            QR${product.price}
          </span>
          <span className="ml-auto bg-black dark:bg-white text-white/90 dark:text-black text-xs px-2 py-1 rounded-sm font-medium">
            {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
          </span>
        </>
      ) : (
        <span className="text-2xl font-serif font-semibold text-black dark:text-white">
          QR${product.price}
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
            variant: "destructive"
          });
          return;
        }
        e.stopPropagation();
        if (onAddToCart) {
          onAddToCart(product._id);
        } else {
          dispatch(addToCart({ userId: user?.id, productId: product._id, quantity: 1 }))
            .then((data) => {
              if (data?.payload?.success) {
                dispatch(fetchCartItems(user?.id));
                toast({ title: "Added to Cart", description: product.title || product.name });
              }
            });
        }
      }}
      disabled={product.totalStock === 0}
      className="w-full bg-black dark:bg-white text-white/90 dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-medium py-3 text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {product.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
          className="border mb-5 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-[#0a0a0f] px-8 py-3 text-sm font-medium transition-all duration-300"
        >
          Explore All Products
        </Button>
      </div>
    </div>
  );
};

export default RandomProducts;
