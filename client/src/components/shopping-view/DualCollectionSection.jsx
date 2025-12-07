import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const DualCollectionSection = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);

  // Fetch available collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/shop/products/groups`
        );
        if (response.data?.success && response.data.data?.length > 0) {
          setCollections(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };
    fetchCollections();
  }, []);

  // Default collections if API doesn't return enough or for demo
  const defaultCollections = [
    {
      name: "Corset Collection",
      slug: "corset",
      description: "Discover our exquisite corset collection, featuring elegant designs that combine timeless sophistication with modern comfort.",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&h=800&fit=crop",
      gradient: "from-purple-500/10 via-pink-500/10 to-rose-500/10",
      darkGradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    },
    {
      name: "Ramadan Collection",
      slug: "ramadan",
      description: "Celebrate the holy month with our special Ramadan collection, featuring luxurious pieces perfect for your special occasions.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop",
      gradient: "from-amber-500/10 via-yellow-500/10 to-orange-500/10",
      darkGradient: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
    },
  ];

  // Use API collections if available, otherwise use defaults
  const displayCollections = collections.length >= 2 
    ? collections.slice(0, 2).map((name, index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1) + " Collection",
        slug: name.toLowerCase(),
        description: defaultCollections[index]?.description || `Explore our ${name} collection featuring premium designs and exceptional quality.`,
        image: defaultCollections[index]?.image || `https://images.unsplash.com/photo-${index === 0 ? '1594633312681' : '1515886657613'}?w=1200&h=800&fit=crop`,
        gradient: defaultCollections[index]?.gradient || (index === 0 ? "from-purple-500/10 via-pink-500/10 to-rose-500/10" : "from-amber-500/10 via-yellow-500/10 to-orange-500/10"),
        darkGradient: defaultCollections[index]?.darkGradient || (index === 0 ? "from-purple-500/20 via-pink-500/20 to-rose-500/20" : "from-amber-500/20 via-yellow-500/20 to-orange-500/20"),
      }))
    : defaultCollections;

  const CollectionCard = ({ collection, index, isReversed }) => {
    return (
      <div
        className={`group relative w-full overflow-hidden rounded-3xl lg:rounded-[2.5rem] bg-white dark:bg-[#0f0f0f] shadow-lg dark:shadow-2xl transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_25px_50px_rgba(212,175,55,0.15)] hover:-translate-y-2 mb-8 lg:mb-12 ${
          index === 0
            ? "bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-rose-50/50 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-rose-950/30"
            : "bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-orange-50/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30"
        }`}
      >
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Content Container */}
        <div
          className={`flex flex-col ${
            isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
          } min-h-[500px] lg:min-h-[600px]`}
        >
          {/* Text Side */}
          <div
            className={`flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 relative z-10 ${
              isReversed ? "lg:text-right" : "lg:text-left"
            }`}
          >
            {/* Decorative Element */}
            <div
              className={`absolute top-0 ${
                isReversed ? "right-0" : "left-0"
              } w-32 h-32 bg-gradient-to-br ${collection.gradient} dark:bg-gradient-to-br ${collection.darkGradient} rounded-full blur-3xl opacity-50 dark:opacity-30`}
            />

            {/* Collection Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 border border-[#D4AF37]/30 dark:border-[#D4AF37]/40 mb-6 w-fit ${
                isReversed ? "lg:ml-auto" : ""
              }`}
            >
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
                Collection
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {collection.name}
            </h2>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed">
              {collection.description}
            </p>

            {/* Shop Now Button */}
            <Button
              onClick={() => navigate(`/shop/collection/${collection.slug}`)}
              className={`group/btn w-fit bg-[#D4AF37] text-[#0a0a0f] hover:bg-[#E5C158] px-8 py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                isReversed ? "lg:ml-auto" : ""
              }`}
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          {/* Image Side */}
          <div className="flex-1 relative overflow-hidden min-h-[400px] lg:min-h-[600px]">
            {/* Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                isReversed
                  ? "from-transparent via-transparent to-black/20 dark:to-black/40"
                  : "from-black/20 dark:from-black/40 via-transparent to-transparent"
              } z-10 pointer-events-none`}
            />

            {/* Image */}
            <div className="absolute inset-0">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>

            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,_rgba(212,175,55,0.15)_1px,_transparent_0)] bg-[length:40px_40px]" />
            </div>
          </div>
        </div>

        {/* Subtle Border Glow on Hover */}
        <div className="absolute inset-0 rounded-3xl lg:rounded-[2.5rem] border-2 border-transparent group-hover:border-[#D4AF37]/30 dark:group-hover:border-[#D4AF37]/40 transition-all duration-500 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="w-full py-16 sm:py-20 lg:py-24">
      {/* Section Header (Optional) */}
      <div className="text-center mb-12 lg:mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
          Explore Our Collections
        </h2>
        <div className="w-24 h-[1px] bg-[#D4AF37] mx-auto" />
        <p className="text-gray-600 dark:text-gray-400 mt-6 text-base sm:text-lg max-w-2xl mx-auto">
          Discover our carefully curated collections, each designed to reflect timeless elegance and modern sophistication.
        </p>
      </div>

      {/* Collection Cards */}
      <div className="space-y-8 lg:space-y-12">
        {displayCollections.map((collection, index) => (
          <CollectionCard
            key={collection.slug}
            collection={collection}
            index={index}
            isReversed={index % 2 === 1}
          />
        ))}
      </div>
    </div>
  );
};

export default DualCollectionSection;

