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
import BestSellingSection from "@/components/shopping-view/BestSellingSection";
import DualCollectionSection from "@/components/shopping-view/DualCollectionSection";
import FeaturedRealProducts from "@/components/shopping-view/FeaturedRealProducts";
import TopDiscountsSection from "@/components/shopping-view/TopDiscountsSection";
import PremiumProductCarousel from "@/components/shopping-view/PremiumProductCarousel";


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
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0f0f0f] transition-colors duration-300 ">
      {/* Minimalist Hero Section */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[100vh] xl:h-[160vh] overflow-hidden bg-white dark:bg-[#0f0f0f]">

        {/* Mobile Swipeable Image */}
        <div className="block sm:hidden w-full h-full relative">
          {/* Swipe area - only for image, isolated */}
          <div {...swipeHandlers} className="absolute inset-0 w-full h-full z-0">
            <img
              src={featureImageListMobile[currentSlide % featureImageListMobile.length]?.image}
              alt="Mobile Banner"
              className="w-full h-full object-cover pointer-events-none select-none"
            />
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Hero Content for Mobile - Minimalist */}
          <div className="absolute bottom-12 left-6 right-6 text-center z-50 pointer-events-auto">
            <h1 className="text-white text-3xl font-serif font-semibold mb-4 pointer-events-none">
              Discover Luxury
            </h1>
            <p className="text-white/90 mb-6 text-sm leading-relaxed pointer-events-none">
              Experience designer clothing crafted for the discerning
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/shop/listing');
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="bg-[#D4AF37] text-[#0a0a0f] hover:bg-[#E5C158] px-8 py-3 font-medium relative z-50 transition-all duration-300"
            >
              Explore Collection
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
                  alt="Designer Collection"
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Hero Content for Desktop - Minimalist */}
          <div className="absolute inset-0 flex items-center z-20 pointer-events-auto">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12">
              <div className="max-w-2xl">
                <h1 className="text-4xl  sm:text-5xl md:text-6xl  lg:text-7xl font-serif font-semibold text-white/90 mb-4 sm:mb-6 leading-tight pointer-events-none">
                  Elegance
                </h1>

                <h2 className="text-lg sm:text-xl md:text-2xl font-light text-white/90 mb-3 sm:mb-4 font-serif pointer-events-none">
                  Where luxury meets designer clothing
                </h2>
                <p className="text-white/80 mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed max-w-lg pointer-events-none">
                  Discover our exclusive collection of designer pieces, each a work of art.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/shop/listing');
                    }}
                    className="bg-[#D4AF37] text-[#0a0a0f] hover:bg-[#E5C158] px-8 py-4 text-base font-medium relative z-30 transition-all duration-300"
                  >
                    Shop Now
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/shop/listing');
                    }}
                    variant="outline"
                    className="border border-white text-white hover:bg-white hover:text-[#0a0a0f] px-8 py-4 text-base relative z-30 transition-all duration-300"
                  >
                    View Collection
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Minimalist */}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(
                (prev) => (prev - 1 + featureImageList.length) % featureImageList.length
              );
            }}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50 z-30 pointer-events-auto transition-all duration-300"
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
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50 z-30 pointer-events-auto transition-all duration-300"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Button>

          {/* Slide Indicators - Minimalist */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30 pointer-events-auto">
            {featureImageList.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
                    ? 'bg-[#D4AF37] w-8'
                    : 'bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>


      {/* Random Products Section */}
      <section className="container mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20">
        <RandomProducts
          onViewDetails={handleGetProductDetails}
          onAddToCart={handleAddToCart}
        />
      </section>
 
      {/* Top Discounts Section - Luxury Style */}
      <TopDiscountsSection 
        layout="A"
        showCountdown={true}
        countdownHours={24}
      />

      {/* Featured Real Products Section - Luxury Style */}
      <FeaturedRealProducts 
        sectionTitle="Best Selling"
        showBestSellingLabel={true}
        maxProducts={4}
      />
      <section className="relative w-full py-5 sm:py-24 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-[#0f0f0f] transition-colors duration-300 overflow-hidden">
        <PremiumProductCarousel
          onViewDetails={handleGetProductDetails}
          onAddToCart={handleAddToCart}
        />
      </section>
      {/* Best Selling Products Section */}
      {/* <section className="container mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20">
        <BestSellingSection
          onViewDetails={handleGetProductDetails}
          onAddToCart={handleAddToCart}
        />
      </section> */}

      {/* Premium Product Carousel Section */}

      {/* Dual Collection Section */}
      {/* <section className="container mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20">
        <DualCollectionSection />
      </section> */}

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
      {/* <section className="relative py-16 sm:py-24 bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <NewArrivals
            onViewDetails={handleGetProductDetails}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section> */}

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


