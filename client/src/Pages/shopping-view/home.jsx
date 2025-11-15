import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSwipeable } from 'react-swipeable';
import {
  fetchAllFilteredProducts,
} from "@/store/shop/products-slice";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { getFeatureImage, getFeatureImageMobile } from "@/store/shop/common-slice";
// import FeaturedProducts from "@/components/shopping-view/FeaturedProducts";
import NewArrivals from "@/components/shopping-view/NewArrivals";
import RandomProducts from "@/components/shopping-view/RandomProducts";
import AllProducts from "@/components/shopping-view/AllProducts";


function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const { featureImageList, featureImageListMobile } = useSelector((state) => state.commonFeature);

  // const listForMobile=[bannerOneForMoblie,bannerTwoForMoblie]

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();



  // Swipe handlers - isolated to image area only
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentSlide((prev) => (prev + 1) % featureImageListMobile.length),
    onSwipedRight: () =>
      setCurrentSlide((prev) => (prev - 1 + featureImageListMobile.length) % featureImageListMobile.length),
    preventScrollOnSwipe: true,
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum swipe distance
  });


  function handleGetProductDetails(getCurrentProductId) {
    if (getCurrentProductId) {
      navigate(`/shop/product/${getCurrentProductId}`);
    }
  }

  function handleAddToCart(getCurrentProductId) {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "يرجى تسجيل الدخول لإضافة المنتج إلى السلة",
        variant: "destructive"
      });
      return;
    }

    dispatch(addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({
            title: "تمت إضافة المنتج إلى السلة",
            description: "تم إضافة المنتج بنجاح"
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


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({
      filtersParams: {},
      sortParams: "price-lowtohight",
    }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImage());
    dispatch(getFeatureImageMobile());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      {/* Luxury Hero Section */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh] overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-luxury-gold/30 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-luxury-gold/40 rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-luxury-gold/20 rounded-full animate-pulse delay-2000" />
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-luxury-gold/30 rounded-full animate-pulse delay-3000" />
        </div>

        {/* Mobile Swipeable Image */}
        <div className="block sm:hidden w-full h-full relative">
          {/* Swipe area - only for image, isolated */}
          <div {...swipeHandlers} className="absolute inset-0 w-full h-full z-0">
            <img
              src={featureImageListMobile[currentSlide % featureImageListMobile.length]?.image}
              alt="Mobile Banner"
              className="w-full h-full object-cover pointer-events-none select-none"
            />
            {/* Luxury Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/50 to-transparent pointer-events-none" />
          </div>

          {/* Hero Content for Mobile - Above swipe area with proper z-index */}
          <div className="absolute bottom-8 left-6 right-6 text-center z-50 pointer-events-auto">
            <h1 className="text-gray-50  text-3xl font-serif font-bold dark:luxury-text  mb-4 pointer-events-none">
              اكتشف الفخامة
            </h1>
            <p className="text-white/90 mb-6 text-sm leading-relaxed pointer-events-none">
              استمتع بأرقى أنواع العود المصممة خصيصًا للذواقة المميزين
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/shop/listing');
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="bg-luxury-gold text-luxury-navy hover:bg-luxury-gold-light luxury-btn px-8 py-3 font-semibold relative z-50"
            >
              استكشف المجموعة
            </Button>
          </div>
        </div>

        {/* Desktop Images with Buttons */}
        <div className="hidden sm:block w-full h-full relative">
          {/* Background Images Layer - No pointer events */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {featureImageList.map((slide, index) => (
              <div
                key={index}
                className={`absolute w-full top-0 left-0 h-full transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
              >
                <img
                  src={slide.image}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  alt="Luxury Perfume"
                />
                {/* Luxury Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-navy via-luxury-navy/30 to-transparent pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Hero Content for Desktop - Above images with proper z-index */}
          <div className="absolute inset-0 flex items-center z-20 pointer-events-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 ms-12">
              <div className="max-w-2xl slide-in-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold bg-gradient-to-r from-gray-50 via-amber-300 to-yellow-950 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight dark:from-yellow-300 dark:via-amber-400 dark:to-yellow-500 pointer-events-none">
                  الأناقة
                </h1>

                <h2 className="text-lg sm:text-xl md:text-2xl font-light text-white/90 mb-3 sm:mb-4 font-serif pointer-events-none">
                  حيث تلتقي الفخامة ب أنواع العود
                </h2>
                <p className="text-white/80 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed max-w-lg pointer-events-none">
                  اكتشف مجموعتنا الحصرية من العود الفاخر، كل قطعة تحفة فنية أصيلة.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pointer-events-auto">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/shop/listing');
                    }}
                    className="bg-luxury-gold text-luxury-navy hover:bg-luxury-gold-light luxury-btn px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold relative z-30"
                  >
                    تسوق الآن
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/shop/listing');
                    }}
                    variant="outline"
                    className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy luxury-btn px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg relative z-30"
                  >
                    عرض المجموعة
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Above everything */}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(
                (prev) => (prev - 1 + featureImageList.length) % featureImageList.length
              );
            }}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-luxury-navy/80 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy luxury-btn z-30 pointer-events-auto"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
            }}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-luxury-navy/80 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy luxury-btn z-30 pointer-events-auto"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Button>

          {/* Slide Indicators - Above everything */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30 pointer-events-auto">
            {featureImageList.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
                    ? 'bg-luxury-gold scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>


      {/* Random Products Section */}
      <section className="container mx-auto px-6 mt-10">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-40 h-40 bg-luxury-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <RandomProducts
            onViewDetails={handleGetProductDetails}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>




      {/* Featured Products Section */}
      {/* <section className="container mx-auto px-6">
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-40 h-40 bg-luxury-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <FeaturedProducts 
            onViewDetails={handleGetProductDetails}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section> */}



      {/* New Arrivals Section */}
      <section className="relative py-24 bg-gradient-to-br from-luxury-navy-dark via-luxury-navy to-luxury-navy-light overflow-hidden">


        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-luxury-gold/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-luxury-gold/2 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container mx-auto px-6 z-10">
          <NewArrivals
            onViewDetails={handleGetProductDetails}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* <section className="container mx-auto px-6 mt-10 mb-20 relative z-20">
      
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-40 h-40 bg-luxury-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pointer-events-auto">
          <NewArrivals 
            onViewDetails={handleGetProductDetails}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

    
      <section className="relative py-24 bg-gradient-to-br from-luxury-navy-dark via-luxury-navy to-luxury-navy-light overflow-hidden z-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-luxury-gold/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-luxury-gold/2 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container mx-auto px-6 z-10 pointer-events-auto">
          <AllProducts 
            onViewDetails={handleGetProductDetails}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section> */}

    </div>
  );
}

export default ShoppingHome;


