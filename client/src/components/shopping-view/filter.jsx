import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { Fragment, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands, fetchPriceRange, fetchGroups } from "@/store/shop/products-slice";
import { Input } from "@/components/ui/input";
import { Filter, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function ProductFiler({ filters, handleFilters, handlePriceChange }) {
  const dispatch = useDispatch();
  const { brands, groups, priceRange } = useSelector((state) => state.shopProducts);
  const [priceRangeLocal, setPriceRangeLocal] = useState({
    minPrice: priceRange?.minPrice || 0,
    maxPrice: priceRange?.maxPrice || 1000,
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchPriceRange());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (priceRange.minPrice !== undefined && priceRange.maxPrice !== undefined) {
      setPriceRangeLocal({
        minPrice: filters?.minPrice ?? priceRange.minPrice,
        maxPrice: filters?.maxPrice ?? priceRange.maxPrice,
      });
    }
  }, [priceRange, filters]);

  const handleMinPriceChange = (e) => {
    const value = parseFloat(e.target.value) || priceRange.minPrice;
    const newRange = {
      ...priceRangeLocal,
      minPrice: Math.min(value, priceRangeLocal.maxPrice),
    };
    setPriceRangeLocal(newRange);
    if (handlePriceChange) {
      handlePriceChange(newRange);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = parseFloat(e.target.value) || priceRange.maxPrice;
    const newRange = {
      ...priceRangeLocal,
      maxPrice: Math.max(value, priceRangeLocal.minPrice),
    };
    setPriceRangeLocal(newRange);
    if (handlePriceChange) {
      handlePriceChange(newRange);
    }
  };

  const handleMinPriceSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    const newRange = {
      ...priceRangeLocal,
      minPrice: Math.min(value, priceRangeLocal.maxPrice),
    };
    setPriceRangeLocal(newRange);
    if (handlePriceChange) {
      handlePriceChange(newRange);
    }
  };

  const handleMaxPriceSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    const newRange = {
      ...priceRangeLocal,
      maxPrice: Math.max(value, priceRangeLocal.minPrice),
    };
    setPriceRangeLocal(newRange);
    if (handlePriceChange) {
      handlePriceChange(newRange);
    }
  };

  const activeFiltersCount = (filters?.brands?.length || 0) + 
    (filters?.groups?.length || 0) +
    ((filters?.minPrice || filters?.maxPrice) ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="relative bg-white dark:bg-[#0f0f0f] rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-serif font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-[#D4AF37] text-[#0a0a0f] text-xs font-medium">
                {activeFiltersCount}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select filters to find your perfect product
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto">
          {/* Brands Filter */}
          {brands && brands.length > 0 && (
            <Fragment>
              <div>
                <h3 className="text-sm font-serif font-semibold text-gray-900 dark:text-white mb-4">
                  Brands
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto  overflow-x-hidden">
                  {brands.map((brand) => {
                    const brandId = brand._id || brand.id;
                    const brandName = brand.nameEn || brand.name;
                    const isChecked = filters?.brands?.includes(brandId);
                    return (
                      <motion.div
                        key={brandId}
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Label
                          className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer select-none transition-all duration-300 ${
                            isChecked
                              ? 'bg-[#D4AF37]/10 border border-[#D4AF37]'
                              : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleFilters("brands", brandId)}
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] transition-all duration-200"
                          />
                          <span className={`text-sm flex-1 ${
                            isChecked 
                              ? 'text-[#D4AF37] font-medium' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {brandName}
                          </span>
                        </Label>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-800" />
            </Fragment>
          )}

          {/* Groups/Collections Filter */}
          {groups && groups.length > 0 && (
            <Fragment>
              <div>
                <h3 className="text-sm font-serif font-semibold text-gray-900 dark:text-white mb-4">
                  Collections
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto overflow-x-hidden">
                  {groups.map((group) => {
                    const isChecked = filters?.groups?.includes(group);
                    return (
                      <motion.div
                        key={group}
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Label
                          className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer select-none transition-all duration-300 ${
                            isChecked
                              ? 'bg-[#D4AF37]/10 border border-[#D4AF37]'
                              : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleFilters("groups", group)}
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] transition-all duration-200"
                          />
                          <span className={`text-sm flex-1 ${
                            isChecked 
                              ? 'text-[#D4AF37] font-medium' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {group}
                          </span>
                        </Label>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-800" />
            </Fragment>
          )}

          {/* Price Range Filter */}
          {priceRange.minPrice !== undefined && priceRange.maxPrice !== undefined && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-sm p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-serif font-semibold text-gray-900 dark:text-white mb-5">
                Price Range
              </h3>

              <div className="space-y-5">
                {/* Price Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Min
                    </label>
                    <input
                      type="number"
                      min={priceRange.minPrice}
                      max={priceRange.maxPrice}
                      value={priceRangeLocal.minPrice}
                      onChange={handleMinPriceChange}
                      className="w-full rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Max
                    </label>
                    <input
                      type="number"
                      min={priceRange.minPrice}
                      max={priceRange.maxPrice}
                      value={priceRangeLocal.maxPrice}
                      onChange={handleMaxPriceChange}
                      className="w-full rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                {/* Slider Section */}
                <div className="relative pt-2">
                  <div className="relative h-1 bg-gray-200 dark:bg-gray-800 rounded-full">
                    <div 
                      className="absolute h-1 bg-[#D4AF37] rounded-full"
                      style={{
                        left: `${((priceRangeLocal.minPrice - priceRange.minPrice) / (priceRange.maxPrice - priceRange.minPrice)) * 100}%`,
                        width: `${((priceRangeLocal.maxPrice - priceRangeLocal.minPrice) / (priceRange.maxPrice - priceRange.minPrice)) * 100}%`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={priceRange.minPrice}
                    max={priceRange.maxPrice}
                    value={priceRangeLocal.minPrice}
                    onChange={handleMinPriceSliderChange}
                    className="absolute top-0 w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4AF37] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#D4AF37] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                  />
                  <input
                    type="range"
                    min={priceRange.minPrice}
                    max={priceRange.maxPrice}
                    value={priceRangeLocal.maxPrice}
                    onChange={handleMaxPriceSliderChange}
                    className="absolute top-0 w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4AF37] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#D4AF37] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                  />
                </div>

                {/* Range Display */}
                <div className="text-center p-4 rounded-sm bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected Range</div>
                  <div className="text-lg font-serif font-semibold text-[#D4AF37]">
                    ${priceRangeLocal.minPrice} – ${priceRangeLocal.maxPrice}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductFiler;
