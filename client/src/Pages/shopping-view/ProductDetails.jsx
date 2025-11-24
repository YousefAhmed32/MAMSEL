import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Eye
} from 'lucide-react';
import { getProductImageUrl, getProductImages } from '@/utils/imageUtils';
import { fetchProductDetails, fetchAllFilteredProducts } from '@/store/shop/products-slice';
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { useToast } from '@/hooks/use-toast';
import { toggleWishlistItem, selectIsInWishlist } from '@/store/shop/wishlist-slice';

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { productDetails, productList, isLoading } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
      // جلب جميع المنتجات للحصول على المنتجات ذات الصلة
      dispatch(fetchAllFilteredProducts({
        filtersParams: {},
        sortParams: "title-atoz",
      }));
    }
  }, [dispatch, productId]);

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "يرجى تسجيل الدخول لإضافة المنتج إلى السلة"
      });
      return;
    }

    if (productDetails.totalStock === 0) {
      toast({
        title: "المنتج غير متوفر",
        description: "هذا المنتج غير متوفر حالياً",
        variant: "destructive"
      });
      return;
    }

    dispatch(addToCart({
      userId: user?.id,
      productId: productDetails._id,
      quantity: quantity
    })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "تم إضافة المنتج إلى السلة",
          description: `تم إضافة ${quantity} من ${productDetails.title} إلى السلة`
        });
      }
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "يرجى تسجيل الدخول للشراء"
      });
      return;
    }

    // إضافة المنتج إلى السلة ثم الانتقال إلى صفحة الدفع
    dispatch(addToCart({
      userId: user?.id,
      productId: productDetails._id,
      quantity: quantity
    })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        navigate('/shop/checkout');
      }
    });
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (productDetails?.totalStock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // الحصول على صور المنتج
  const getImageUrls = () => {
    if (!productDetails) return [];
    const allImages = getProductImages(productDetails);
    return allImages.length > 0 ? allImages : ['/placeholder-product.jpg'];
  };

  const images = getImageUrls();
  const currentImage = images[selectedImageIndex] || images[0] || '/placeholder-product.jpg';

  // الحصول على المنتجات ذات الصلة (نفس الفئة أو الماركة)
  const getRelatedProducts = () => {
    if (!productDetails || !productList) return [];

    const related = productList.filter(product =>
      product._id !== productDetails._id &&
      (product.category === productDetails.category ||
        product.brand === productDetails.brand)
    ).slice(0, 4);

    return related.length > 0 ? related : productList.slice(0, 4).filter(p => p._id !== productDetails._id);
  };

  const relatedProducts = getRelatedProducts();

  // Check if current product is in wishlist
  const isProductInWishlist = useSelector((state) =>
    productDetails ? selectIsInWishlist(state, productDetails._id) : false
  );

  // Handle wishlist toggle for main product
  const handleWishlistToggle = () => {
    if (!productDetails) return;

    const wasInWishlist = isProductInWishlist;
    dispatch(toggleWishlistItem(productDetails));
    toast({
      title: wasInWishlist ? "تم الحذف من المفضلة" : "تمت الإضافة للمفضلة",
      description: wasInWishlist
        ? `تم حذف ${productDetails.title} من قائمة المفضلة`
        : `تم إضافة ${productDetails.title} إلى قائمة المفضلة`,
    });
  };

  // Wishlist Button Component for Related Products
  const RelatedProductWishlistButton = ({ product }) => {
    const productId = product._id || product.id;
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
      <Button
        size="icon"
        variant="outline"
        onClick={handleWishlistToggle}
        className={`backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2
          ${isInWishlist
            ? "bg-red-500/90 hover:bg-red-600 border-red-400 text-white dark:bg-red-500/80 dark:hover:bg-red-600 dark:text-white"
            : "bg-white/95 hover:bg-gray-100 border-gray-300 text-luxury-gold hover:text-navy-950 dark:bg-luxury-gold dark:hover:bg-luxury-gold/20 dark:text-gray-950 border-luxury-gold dark:border-luxury-gold/70"
          }
        `}
        title={isInWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        tabIndex={0}
      >
        <Heart
          className={`w-4 h-4 transition-colors duration-200 ${isInWishlist
              ? "fill-red-500 text-white dark:fill-red-400 dark:text-white"
              : "fill-none text-luxury-gold dark:text-gray-950"
            }`}
        />
      </Button>
    );


  };

  // مكون Lightbox
  const Lightbox = () => {
    if (!showLightbox) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
        onClick={() => setShowLightbox(false)}
      >
        <div className="relative max-w-7xl max-h-full">
          {/* زر الإغلاق */}
          <Button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-red-500 hover:text-white text-white border border-white/30 hover:border-red-500 z-10 transition-all duration-300 shadow-lg hover:shadow-xl"
            size="icon"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* الصورة */}
          <motion.img
            key={lightboxIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={images[lightboxIndex]}
            alt={productDetails.title}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* أزرار التنقل */}
          {images.length > 1 && (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-luxury-gold hover:text-navy-950 text-white border border-white/30 hover:border-luxury-gold transition-all duration-300 shadow-lg hover:shadow-xl"
                size="icon"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-luxury-gold hover:text-navy-950 text-white border border-white/30 hover:border-luxury-gold transition-all duration-300 shadow-lg hover:shadow-xl"
                size="icon"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* عداد الصور */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full border border-luxury-gold/30 backdrop-blur-sm shadow-xl">
                <span className="text-luxury-gold font-bold">{lightboxIndex + 1}</span>
                <span className="text-white/70 mx-2">/</span>
                <span className="text-white">{images.length}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 dark:border-navy-700 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-luxury-gold border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-luxury-gold text-lg font-semibold"
          >
            جاري تحميل تفاصيل المنتج...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white dark:bg-navy-950/80 p-12 rounded-2xl shadow-2xl border border-gray-200 dark:border-luxury-gold/30"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-12 h-12 text-gray-400 dark:text-luxury-gold/50" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            عذراً، هذا العود غير متوفر
          </h1>

          <p className="text-gray-600 dark:text-white/70 mb-6">
            لم نتمكن من العثور على المنتج المطلوب، ولكن مجموعتنا الأخرى من العود الفاخر بانتظارك.
          </p>

          <Button
            onClick={() => navigate('/shop/listing')}
            className="bg-luxury-gold text-navy-950 hover:bg-luxury-gold/90 font-bold px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            تصفح العود الفاخر
          </Button>
        </motion.div>
      </div>

    );
  }

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-950">
      {/* رأس الصفحة */}
      <div className="bg-white/95 dark:bg-gray-950 backdrop-blur-sm border-b border-gray-200 dark:border-luxury-gold/20 sticky top-0 z-40 shadow-sm dark:shadow-luxury-gold/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-navy-950 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل المنتج</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 bg-gray-50 dark:bg-gray-950">
        {/* الصف الأول: معرض الصور وتفاصيل المنتج */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
        >
          {/* معرض الصور - النصف الأيسر */}
          <div className="space-y-6">
            {/* الصورة الرئيسية */}
            <motion.div
              layout
              className="relative group bg-white dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-200 dark:border-luxury-gold/30 shadow-lg hover:shadow-xl dark:shadow-luxury-gold/20 dark:hover:shadow-luxury-gold/30 transition-all duration-300"
            >
              <div className="aspect-square relative overflow-hidden">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={currentImage}
                  alt={productDetails.title}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                  onClick={() => {
                    setLightboxIndex(selectedImageIndex);
                    setShowLightbox(true);
                  }}
                />

                {/* زر التكبير */}
                <Button
                  onClick={() => {
                    setLightboxIndex(selectedImageIndex);
                    setShowLightbox(true);
                  }}
                  className="absolute top-4 right-4 bg-white/95 dark:bg-navy-950/95 hover:bg-luxury-gold hover:text-navy-950 border border-gray-300 dark:border-luxury-gold/50 text-gray-800 dark:text-luxury-gold shadow-lg hover:shadow-xl dark:shadow-luxury-gold/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  size="icon"
                  title="تكبير الصورة"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                {/* أزرار التنقل للصور */}
                {images.length > 1 && (
                  <>
                    <Button
                      onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 dark:bg-navy-950/95 hover:bg-luxury-gold hover:text-navy-950 border border-gray-300 dark:border-luxury-gold/50 text-gray-800 dark:text-luxury-gold shadow-lg hover:shadow-xl dark:shadow-luxury-gold/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      size="icon"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 dark:bg-navy-950/95 hover:bg-luxury-gold hover:text-navy-950 border border-gray-300 dark:border-luxury-gold/50 text-gray-800 dark:text-luxury-gold shadow-lg hover:shadow-xl dark:shadow-luxury-gold/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      size="icon"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}

                {/* عداد الصور */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 dark:bg-navy-950/90 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-white/20 dark:border-luxury-gold/30">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
            </motion.div>

            {/* الصور المصغرة */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex gap-3 overflow-x-auto pb-2"
              >
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all bg-white dark:bg-navy-900/50 hover:scale-105 ${index === selectedImageIndex
                        ? 'border-luxury-gold shadow-lg dark:shadow-luxury-gold/30 scale-105'
                        : 'border-gray-300 dark:border-luxury-gold/30 hover:border-luxury-gold/60 dark:hover:border-luxury-gold/70'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${productDetails.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* تفاصيل المنتج - النصف الأيمن */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6 bg-white dark:bg-navy-950/50 p-8 rounded-2xl shadow-lg dark:shadow-luxury-gold/10 border border-gray-100 dark:border-luxury-gold/20 backdrop-blur-sm"
          >
            {/* اسم المنتج والماركة */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {productDetails.title}
              </h1>

              {productDetails.brand && (
                <Badge className="bg-luxury-gold/20 text-luxury-gold border-luxury-gold/30 mb-4">
                  {typeof productDetails.brand === 'object' ? productDetails.brand.name : productDetails.brand}
                </Badge>
              )}

              {/* التقييم */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? 'text-luxury-gold fill-current' : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-white/70 text-sm">(4.0)</span>
              </div>
            </div>

            {/* السعر */}
            <div className="space-y-2">
              {productDetails.salePrice && productDetails.salePrice < productDetails.price ? (
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-luxury-gold">
                    QR{productDetails.salePrice}
                  </span>
                  <span className="text-2xl text-gray-500 line-through">
                    QR{productDetails.price}
                  </span>
                  <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                    خصم {Math.round(((productDetails.price - productDetails.salePrice) / productDetails.price) * 100)}%
                  </Badge>
                </div>
              ) : (
                <span className="text-4xl font-bold text-luxury-gold">
                  QR{productDetails.price}
                </span>
              )}
            </div>

            {/* الوصف */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">الوصف</h3>
              <p className="text-gray-700 dark:text-white/80 leading-relaxed">
                {productDetails.description}
              </p>
            </div>

            {/* حالة المخزون */}
            <div className="flex items-center gap-2">
              {productDetails.totalStock > 0 ? (
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                  متوفر ({productDetails.totalStock} قطعة)
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                  غير متوفر
                </Badge>
              )}
            </div>

            {/* اختيار الكمية والأزرار */}
            {productDetails.totalStock > 0 && (
              <div className="space-y-6">
                {/* اختيار الكمية */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-900 dark:text-white font-semibold">الكمية:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="bg-white dark:bg-navy-900/80 border-2 border-gray-300 dark:border-luxury-gold/40 text-gray-700 dark:text-luxury-gold hover:bg-luxury-gold hover:text-navy-950 hover:border-luxury-gold disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
                      size="icon"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-gray-900 dark:text-white font-bold px-6 py-3 bg-gray-100 dark:bg-navy-900/60 rounded-xl min-w-[4rem] text-center border-2 border-gray-200 dark:border-luxury-gold/30 text-lg shadow-inner">
                      {quantity}
                    </span>
                    <Button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= productDetails.totalStock}
                      className="bg-white dark:bg-navy-900/80 border-2 border-gray-300 dark:border-luxury-gold/40 text-gray-700 dark:text-luxury-gold hover:bg-luxury-gold hover:text-navy-950 hover:border-luxury-gold disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
                      size="icon"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* الأزرار الرئيسية */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      if (!user) {
                        navigate("/auth/login", { state: { from: location.pathname } });
                        return;
                      }
                      handleAddToCart();
                    }}
                    className="flex-1 bg-gradient-to-r from-luxury-gold to-luxury-gold/90 text-navy-950 hover:from-luxury-gold/90 hover:to-luxury-gold font-bold py-4 text-lg shadow-xl hover:shadow-2xl dark:shadow-luxury-gold/30 dark:hover:shadow-luxury-gold/40 transition-all duration-300 transform hover:-translate-y-1 border-2 border-luxury-gold"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    أضف إلى السلة
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    className="flex-1 border-2 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-navy-950 font-bold py-4 text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl dark:shadow-luxury-gold/20 dark:hover:shadow-luxury-gold/30 bg-white dark:bg-navy-900/50"
                  >
                    اشترِ الآن
                  </Button>
                </div>

                {/* أزرار إضافية */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleWishlistToggle}
                    variant="outline"
                    className={`flex-1 border-2 transition-all duration-300 ${isProductInWishlist
                        ? "border-red-500 dark:border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30"
                        : "border-gray-300 dark:border-luxury-gold text-gray-700 dark:text-luxury-gold hover:bg-gray-100 dark:hover:bg-luxury-gold/10 hover:border-luxury-gold bg-white dark:bg-navy-900/30"
                      }`}
                    size="sm"
                  >
                    <Heart
                      className={`w- h-4 mr-2 transition-colors duration-200 ${isProductInWishlist
                          ? "fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400"
                          : "fill-none"
                        }`}
                    />
                    {isProductInWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  </Button>
                </div>
              </div>
            )}

            {/* مميزات إضافية */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-luxury-gold/20">
              <div className="flex items-center gap-3 text-gray-700 dark:text-white/80">
                <Truck className="w-5 h-5 text-luxury-gold" />
                <span>شحن مجاني للطلبات أكثر من $100</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-white/80">
                <Shield className="w-5 h-5 text-luxury-gold" />
                <span>ضمان الجودة 100%</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-white/80">
                <RotateCcw className="w-5 h-5 text-luxury-gold" />
                <span>إمكانية الإرجاع خلال 30 يوم</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* الصف الثاني: المنتجات ذات الصلة */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">منتجات ذات صلة</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-luxury-gold to-luxury-gold/50 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="group bg-white dark:bg-navy-950/80 border-2 border-gray-200 dark:border-luxury-gold/40 rounded-2xl overflow-hidden hover:border-luxury-gold dark:hover:border-luxury-gold hover:shadow-2xl dark:shadow-luxury-gold/20 dark:hover:shadow-luxury-gold/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 backdrop-blur-sm"
                    onClick={() => navigate(`/shop/product/${product._id}`)}
                  >
                    {/* صورة المنتج */}
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />

                      {/* Action Buttons - Eye and Heart */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                        <Button
                          size="icon"
                          variant="outline"
                          className="bg-luxury-gold/95 dark:bg-luxury-gold border-luxury-gold text-navy-950 hover:bg-luxury-gold hover:scale-110 shadow-xl hover:shadow-2xl dark:shadow-luxury-gold/30 dark:hover:shadow-luxury-gold/50 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/shop/product/${product._id}`);
                          }}
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <RelatedProductWishlistButton product={product} />
                      </div>

                      {/* شارة الخصم */}
                      {product.salePrice && product.salePrice < product.price && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          خصم
                        </div>
                      )}
                    </div>

                    {/* معلومات المنتج */}
                    <CardContent className="p-6 space-y-4 bg-white dark:bg-navy-950/60">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-luxury-gold transition-colors duration-300 line-clamp-1">
                          {product.title}
                        </h3>
                        {product.brand && (
                          <p className="text-luxury-gold dark:text-luxury-gold text-xs uppercase tracking-wider font-semibold">
                            {typeof product.brand === 'object' ? product.brand.name : product.brand}
                          </p>
                        )}
                      </div>

                      {/* التقييم */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-navy-900/50 px-2 py-1 rounded-lg">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < 4 ? 'text-luxury-gold fill-current' : 'text-gray-300 dark:text-gray-600'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600 dark:text-white/70 text-xs font-semibold">(4.0)</span>
                      </div>

                      {/* السعر */}
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-navy-900/40 p-3 rounded-lg border border-gray-200 dark:border-luxury-gold/20">
                        {product.salePrice && product.salePrice < product.price ? (
                          <>
                            <span className="text-2xl font-bold text-luxury-gold drop-shadow-sm">
                              ${product.salePrice}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                              ${product.price}
                            </span>
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              خصم {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-luxury-gold drop-shadow-sm">
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox />
    </div>
  );
}

export default ProductDetails;
