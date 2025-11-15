import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { fetchBanners } from "@/store/admin/banner-slice";

function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const { banners } = useSelector((state) => state.adminBanner);
  const dispatch = useDispatch();

  const heroBanners = banners.filter(banner => banner.device === "desktop")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    if (isAutoPlay && !isHovered && heroBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isAutoPlay, isHovered, heroBanners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  if (heroBanners.length === 0) {
    return (
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-2xl">
              مرحباً بك في عالم العود الفاخر
            </h1>

            <p className="text-xl text-yellow-300 mb-8 drop-shadow-lg">
              اكتشف مجموعة منتقاة بعناية من أرقى أنواع العود العالمية
            </p>


            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 text-lg shadow-lg">
              تسوق الآن
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-[70vh] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {heroBanners.map((banner, index) => (
          <div
            key={banner._id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={banner.image}
              alt="Hero Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              عود فاخر من أرقى الماركات العالمية
            </h1>

            <h2 className="text-xl md:text-2xl text-yellow-300 mb-4 font-medium drop-shadow-lg">
              اكتشف مجموعة منتقاة بعناية من أرقى أنواع العود العالمية
            </h2>

            <p className="text-lg text-yellow-100 mb-8 leading-relaxed drop-shadow-md">
              استمتع بتجربة تسوق فريدة مع مجموعة واسعة من العود الفاخر من أشهر الماركات العالمية مثل شانيل، ديور، فيرساتشي، جوتشي، وتوم فورد.
            </p>

            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 text-lg shadow-lg"
              onClick={() => window.location.href = '/shop/listing'}
            >
              تسوق الآن
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {heroBanners.length > 1 && (
        <>
          <Button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-0 rounded-full w-12 h-12 p-0"
            variant="outline"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-0 rounded-full w-12 h-12 p-0"
            variant="outline"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Slide Indicators */}
      {heroBanners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'bg-gold-950 scale-125'
                : 'bg-white/50 hover:bg-white/70'
                }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Controls */}
      {heroBanners.length > 1 && (
        <div className="absolute top-8 right-8">
          <Button
            onClick={toggleAutoPlay}
            className="bg-black/30 hover:bg-black/50 text-white border-0 rounded-full w-12 h-12 p-0"
            variant="outline"
          >
            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>
      )}

      {/* Slide Counter */}
      {heroBanners.length > 1 && (
        <div className="absolute bottom-8 right-8 bg-black/30 text-white px-4 py-2 rounded-full text-sm">
          {currentSlide + 1} / {heroBanners.length}
        </div>
      )}
    </div>
  );
}

export default HeroSlider;
