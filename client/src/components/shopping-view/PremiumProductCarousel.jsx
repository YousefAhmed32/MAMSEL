import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductImageUrl } from "@/utils/imageUtils";

const PremiumProductCarousel = ({ onViewDetails, onAddToCart }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const [inStockProducts, setInStockProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const carouselRef = useRef(null);
  const startXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);

  // Handle responsive breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter products to only show in-stock items
  useEffect(() => {
    if (productList && productList.length > 0) {
      const filtered = productList.filter(product => product.totalStock > 0);
      // Sort by price descending to get premium products, then take top 7
      const sorted = [...filtered].sort((a, b) => {
        const priceA = a.salePrice || a.price;
        const priceB = b.salePrice || b.price;
        return priceB - priceA;
      });
      setInStockProducts(sorted.slice(0, 7));
    }
  }, [productList]);

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({
      filtersParams: {},
      sortParams: "price-hightolow",
    }));
  }, [dispatch]);

  // Calculate visible products with smooth transitions
  const getVisibleProducts = () => {
    if (inStockProducts.length === 0) return [];
    
    const visible = [];
    const total = inStockProducts.length;
    
    // Calculate effective index with drag offset for smooth free mode
    const dragRatio = dragOffset / (isMobile ? 200 : 300); // Normalize drag to index ratio
    const effectiveIndex = currentIndex - dragRatio;
    
    // Create circular array logic with smooth interpolation
    for (let i = -3; i <= 3; i++) {
      const targetIndex = Math.round(effectiveIndex + i);
      const index = ((targetIndex % total) + total) % total;
      visible.push({
        product: inStockProducts[index],
        position: i,
        actualIndex: index,
      });
    }
    
    return visible;
  };

  const visibleProducts = getVisibleProducts();

  // Free Mode Drag Handlers - Smooth real-time dragging
  const handleStart = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX;
    lastXRef.current = clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    
    // Prevent body scroll during drag
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };


  // Global event handlers for smooth dragging (attached to document)
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      const deltaX = e.clientX - lastXRef.current;
      
      // Calculate velocity for momentum
      if (deltaTime > 0) {
        velocityRef.current = deltaX / deltaTime;
      }
      
      const diff = e.clientX - startXRef.current;
      setDragOffset(diff);
      
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    };

    const handleGlobalMouseUp = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      const threshold = isMobile ? 60 : 100;
      const velocity = velocityRef.current;
      
      // Use velocity or drag distance to determine slide change
      if (Math.abs(dragOffset) > threshold || Math.abs(velocity) > 0.3) {
        if (dragOffset > 0 || velocity > 0) {
          // Swiped right - go to previous
          setCurrentIndex((prev) => (prev - 1 + inStockProducts.length) % inStockProducts.length);
        } else {
          // Swiped left - go to next
          setCurrentIndex((prev) => (prev + 1) % inStockProducts.length);
        }
      }
      
      setIsDragging(false);
      setDragOffset(0);
      velocityRef.current = 0;
    };

    const handleGlobalTouchMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      if (touch) {
        const now = Date.now();
        const deltaTime = now - lastTimeRef.current;
        const deltaX = touch.clientX - lastXRef.current;
        
        // Calculate velocity for momentum
        if (deltaTime > 0) {
          velocityRef.current = deltaX / deltaTime;
        }
        
        const diff = touch.clientX - startXRef.current;
        setDragOffset(diff);
        
        lastXRef.current = touch.clientX;
        lastTimeRef.current = now;
      }
    };

    const handleGlobalTouchEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      const threshold = isMobile ? 60 : 100;
      const velocity = velocityRef.current;
      
      // Use velocity or drag distance to determine slide change
      if (Math.abs(dragOffset) > threshold || Math.abs(velocity) > 0.3) {
        if (dragOffset > 0 || velocity > 0) {
          // Swiped right - go to previous
          setCurrentIndex((prev) => (prev - 1 + inStockProducts.length) % inStockProducts.length);
        } else {
          // Swiped left - go to next
          setCurrentIndex((prev) => (prev + 1) % inStockProducts.length);
        }
      }
      
      setIsDragging(false);
      setDragOffset(0);
      velocityRef.current = 0;
    };

    // Add event listeners to document for global capture
    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleGlobalTouchEnd, { passive: false });

    return () => {
      // Cleanup
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
      
      // Restore body scroll on cleanup
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging, dragOffset, isMobile, inStockProducts.length]);

  // Mouse handlers - Container level
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientX);
  };

  // Touch handlers - Container level
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    if (touch) {
      handleStart(touch.clientX);
    }
  };

  // Get transform and style for each product card - Premium minimalist design
  const getCardStyle = (position, dragOffsetValue) => {
    const baseScale = {
      '-3': 0.5,
      '-2': 0.8,
      '-1': 0.9,
      '0': 1.1,
      '1': 0.9,
      '2': 0.8,
      '3': 0.5,
    };
  
    const baseOpacity = {
      '-3': .5,
      '-2':.6,
      '-1': .7,
      '0': 1,
      '1': .9,
      '2': .8,
      '3': .7,
    };
  
    const translateX = {
      '-3': -900,
      '-2': -600,
      '-1': -300,
      '0': 0,
      '1': 300,
      '2': 600,
      '3': 900,
    };
  
    // const rotateY = {
    //   '-3': 90,
    //   '-2': 60,
    //   '-1': 30,
    //   '0': 0,
    //   '1': -30,
    //   '2': -60,
    //   '3':-9 0,
    // };
    const rotateY = {
      '-3': 0,
      '-2': 0,
      '-1': 0,
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
    };
  
    const zIndex = {
      '-3': 1,
      '-2': 2,
      '-1': 3,
      '0': 10,
      '1': 3,
      '2': 2,
      '3': 1,
    };
  
    const scale = baseScale[position] || 1;
    const opacity = baseOpacity[position] || 1;
    const baseTranslate = translateX[position] || 0;
    const rotation = rotateY[position] || 0;
    const z = zIndex[position] || 1;
  
    const dragMultiplier = 1; // كامل الحركة تتبع السحب
    const currentTranslate = baseTranslate + dragOffsetValue * dragMultiplier;
  
    return {
      transform: `translateX(${currentTranslate}px) scale(${scale}) rotateY(${rotation}deg)`,
      opacity: opacity,
      zIndex: z,
      transition: isDragging ? 'none' : 'transform 0.5s ease-out, opacity 0.5s ease',
    };
  };
  

  const handleAddToCartClick = (productId) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add product to cart",
        variant: "destructive"
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart(productId);
    } else {
      dispatch(addToCart({ userId: user?.id, productId, quantity: 1 }))
        .then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchCartItems(user?.id));
            toast({
              title: "Added to Cart",
              description: "Product added successfully"
            });
          }
        });
    }
  };

  if (inStockProducts.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 font-light text-lg">
            Loading premium products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Section Header - Above carousel */}
      <div className="text-center mb-12 sm:mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 dark:text-white mb-4 tracking-tight">
          Premium Collection
        </h2>
        <div className="w-20 h-px bg-gray-300 dark:bg-gray-700 mx-auto mb-6" />
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
          Discover our most exquisite pieces, curated for the discerning
        </p>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative w-full h-[120vh] min-h-[550px] sm:min-h-[650px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        ref={carouselRef}
        style={{ 
          touchAction: 'pan-x', 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          overscrollBehavior: 'contain',
          overflowX: 'hidden',
        }}
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/20 to-transparent dark:via-gray-900/20 pointer-events-none" />

        {/* Carousel Container with 3D perspective */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1200px', perspectiveOrigin: 'center center' }}>
          <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {visibleProducts.map(({ product, position }) => {
              const isCenter = position === 0;
              const cardStyle = getCardStyle(position, dragOffset);
              const isHovered = hoveredCard === product._id && isCenter;

              return (
                <div
                  key={`${product._id}-${position}-${currentIndex}`}
                  className="absolute"
                  style={{
                    ...cardStyle,
                    pointerEvents: isDragging && !isCenter ? 'none' : 'auto',
                  }}
                  onMouseEnter={() => !isDragging && isCenter && setHoveredCard(product._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    className={`
                      relative w-[220px] sm:w-[280px] md:w-[320px] lg:w-[360px]
                      transition-all duration-500
                    `}
                    onClick={(e) => {
                      if (isDragging) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isCenter && onViewDetails) {
                        onViewDetails(product._id);
                      }
                    }}
                    style={{ pointerEvents: isDragging && !isCenter ? 'none' : 'auto' }}
                  >
                    {/* Product Card - Minimalist Design */}
                    <div
                      className={`
                        bg-white dark:bg-[#0a0a0a] 
                        rounded-sm overflow-hidden
                        border border-gray-200 dark:border-gray-800
                        ${isCenter 
                          ? 'shadow-2xl dark:shadow-[0_25px_50px_rgba(0,0,0,0.5)]' 
                          : 'shadow-lg dark:shadow-xl'
                        }
                        transition-all duration-500
                        ${isHovered ? 'scale-[1.02] shadow-3xl' : ''}
                      `}
                      style={{
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      {/* Product Image */}
                      <div className="relative h-[320px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-50 dark:bg-gray-900">
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.title || product.name}
                          className={`w-full h-full object-cover transition-transform duration-700 ${
                            isHovered ? 'scale-110' : 'scale-100'
                          }`}
                        />
                        
                        {/* Subtle overlay for center product */}
                        {isCenter && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                        )}

                        {/* Action Buttons - Only visible on center */}
                        {isCenter && (
                          <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onViewDetails) {
                                  onViewDetails(product._id);
                                }
                              }}
                              className="bg-white/95 dark:bg-[#0a0a0a]/95 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 backdrop-blur-sm shadow-sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCartClick(product._id);
                              }}
                              disabled={product.totalStock === 0}
                              className="bg-white/95 dark:bg-[#0a0a0a]/95 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 backdrop-blur-sm shadow-sm disabled:opacity-50"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Product Info - Minimalist */}
                      <div className="p-5 sm:p-6 space-y-3">
                        {/* Brand */}
                        {product.brand && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-light">
                            {typeof product.brand === 'object' && product.brand !== null 
                              ? (product.brand.name || product.brand.nameEn || String(product.brand._id || ''))
                              : String(product.brand || '')}
                          </p>
                        )}

                        {/* Title */}
                        <h3 className={`font-light text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 leading-snug ${isCenter ? 'text-lg sm:text-xl' : ''}`}>
                          {product.title || product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 pt-1">
                          {product.salePrice && product.salePrice < product.price ? (
                            <>
                              <span className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white">
                                ${product.salePrice}
                              </span>
                              <span className="text-gray-400 dark:text-gray-600 line-through text-sm">
                                ${product.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white">
                              ${product.price}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button - Only for center */}
                        {isCenter && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCartClick(product._id);
                            }}
                            disabled={product.totalStock === 0}
                            className="w-full bg-gray-900 dark:bg-white text-white/90 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-light py-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {product.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows - Minimalist */}
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev - 1 + inStockProducts.length) % inStockProducts.length);
          }}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#0a0a0a] transition-all duration-300 shadow-sm w-10 h-10 sm:w-12 sm:h-12 hover:shadow-md"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev + 1) % inStockProducts.length);
          }}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#0a0a0a] transition-all duration-300 shadow-sm w-10 h-10 sm:w-12 sm:h-12 hover:shadow-md"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>

        {/* Slide Indicators - Minimalist */}
        <div className="absolute  bottom-[1px]  sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {inStockProducts.map((_, index) => (
            
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`  transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-gray-900 dark:bg-white w-8 h-1.5'
                  : 'bg-gray-300 dark:bg-gray-700 w-1.5 h-1.5 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumProductCarousel;
