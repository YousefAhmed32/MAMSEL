import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { getProductImageUrl } from "@/utils/imageUtils";
import axios from "axios";

const FeaturedProducts = () => {
  const [topSoldProducts, setTopSoldProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});

  useEffect(() => {
    const fetchTopSoldProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shop/products/top-sold`);
        if (response.data.success) {
          // عرض أعلى 5 منتجات فقط
          const topFive = (response.data.data || []).slice(0, 5);
          setTopSoldProducts(topFive);
        } else {
          setTopSoldProducts([]);
        }
      } catch (error) {
        console.error("Error fetching top sold products:", error);
        setTopSoldProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopSoldProducts();
  }, []);

  const handleImageLoad = (productId) => setImageLoading((prev) => ({ ...prev, [productId]: false }));
  const handleImageError = (productId) => setImageLoading((prev) => ({ ...prev, [productId]: false }));

  // Product card - Display only (no interaction buttons)
  const ProductCard = ({ product }) => {
    return (
      <Card className="group relative bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-luxury-gold/30 rounded-2xl overflow-hidden hover:border-luxury-gold dark:hover:border-luxury-gold transition-all duration-500 hover:shadow-[0_0_40px_rgba(210,176,101,0.4)] dark:hover:shadow-[0_0_40px_rgba(210,176,101,0.5)] w-full max-w-sm mx-auto transform hover:scale-[1.02] h-full flex flex-col">
        {/* Image Container */}
        <div className="relative overflow-hidden h-56 sm:h-64 md:h-72">
          {/* Loading Spinner */}
          {imageLoading[product._id] !== false && (
            <div className="absolute inset-0 bg-luxury-navy-light/20 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
            </div>
          )}
          
          {/* Product Image */}
          <img
            src={getProductImageUrl(product)}
            alt={product.title || product.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoading[product._id] === false ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => handleImageLoad(product._id)}
            onError={() => handleImageError(product._id)}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Sale Badge */}
          {product.salePrice && product.salePrice < product.price && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-20">
              خصم {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
            </div>
          )}
          
          {/* Out of Stock Badge */}
          {product.totalStock === 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-20">
              نفدت الكمية
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 bg-white dark:bg-gray-950 flex-grow flex flex-col">
          {/* Title */}
          <h3 className="font-serif font-bold text-lg sm:text-xl text-gray-900 dark:text-white group-hover:text-luxury-gold transition-colors duration-300 line-clamp-2 min-h-[56px]">
            {product.title || product.name}
          </h3>
          
          {/* Brand */}
          {product.brand && (
            <p className="text-luxury-gold text-xs uppercase tracking-wider font-semibold">
              {typeof product.brand === "object" && product.brand !== null
                ? product.brand.name || product.brand.nameEn || String(product.brand._id || "")
                : String(product.brand || "")}
            </p>
          )}
          
          {/* Rating */}
          <div className="flex items-center gap-2 py-1">
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < 4 ? "text-luxury-gold fill-luxury-gold" : "text-gray-300 dark:text-white/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 dark:text-white/80 text-xs font-semibold">(4.0)</span>
          </div>
          
          {/* Sold Count */}
          {product.sold > 0 && (
            <div className="flex items-center gap-2 text-sm bg-luxury-gold/10 px-3 py-1.5 rounded-lg">
              <span className="text-luxury-gold font-semibold text-base">🔥</span>
              <span className="text-gray-700 dark:text-white/90 font-medium text-xs">
                تم بيع {product.sold} مرة
              </span>
            </div>
          )}
          
          {/* Description */}
          <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed line-clamp-2 flex-grow">
            {product.description || "منتج فاخر متميز"}
          </p>
          {/* test */}
          {/* Price Section */}
          <div className="pt-2 mt-auto">
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-luxury-gold/40 p-4 rounded-xl shadow-sm">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-luxury-gold">
                    QR{product.salePrice}
                  </span>
                  <span className="text-gray-500 dark:text-white/50 line-through text-base sm:text-lg">
                    QR{product.price}
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-luxury-gold">
                  QR{product.price}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-14">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 tracking-wide">
          المنتجات المميزة
        </h2>
        <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light mx-auto rounded-full" />
        <p className="text-gray-600 dark:text-white/80 mt-4 sm:mt-6 text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto px-2">
          اكتشف أعلى 5 منتجات مبيعاً، مختارة بعناية لجودتها وجاذبيتها الاستثنائية
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-luxury-gold"></div>
          <p className="mt-4 text-gray-600 dark:text-white/70 text-sm sm:text-base">جاري تحميل المنتجات المميزة...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && topSoldProducts.length === 0 && (
        <div className="text-center py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
          <div className="text-6xl sm:text-7xl mb-4">✨</div>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-white/70 font-medium">
            لا توجد منتجات مميزة في الوقت الحالي
          </p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-white/50 mt-2">
            تفقد صفحة المنتجات لاستكشاف كامل المجموعة
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && topSoldProducts.length > 0 && (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {topSoldProducts.map((product) => (
              <div key={product._id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FeaturedProducts;