import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands, fetchPriceRange, fetchGroups } from "@/store/shop/products-slice";
import { Input } from "@/components/ui/input";
import { Filter, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function ProductFiler({ filters, handleFilters, handlePriceChange, handleClearAllFilters }) {
  const dispatch = useDispatch();
  const { brands, groups, priceRange } = useSelector((state) => state.shopProducts);
  const [priceRangeLocal, setPriceRangeLocal] = useState({
    minPrice: priceRange?.minPrice || 0,
    maxPrice: priceRange?.maxPrice || 1000,
  });
  const [isBrandsOpen, setIsBrandsOpen] = useState(true);
  const [isGroupsOpen, setIsGroupsOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  const [showMoreGroups, setShowMoreGroups] = useState(false);

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
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '') {
      setPriceRangeLocal({
        ...priceRangeLocal,
        minPrice: '',
      });
      return;
    }
    
    const value = parseFloat(inputValue);
    
    // Validate value
    if (isNaN(value) || value < 0) {
      return;
    }
    
    // Allow any value - no restrictions
    const newRange = {
      ...priceRangeLocal,
      minPrice: value,
    };
    setPriceRangeLocal(newRange);
    // Only apply filter if both values are valid and min doesn't exceed max
    if (handlePriceChange && !isNaN(newRange.minPrice) && !isNaN(newRange.maxPrice) && newRange.minPrice <= newRange.maxPrice) {
      handlePriceChange(newRange);
    }
  };

  const handleMaxPriceChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '') {
      setPriceRangeLocal({
        ...priceRangeLocal,
        maxPrice: '',
      });
      return;
    }
    
    const value = parseFloat(inputValue);
    
    // Validate value
    if (isNaN(value) || value < 0) {
      return;
    }
    
    // Allow any value - no restrictions
    const newRange = {
      ...priceRangeLocal,
      maxPrice: value,
    };
    setPriceRangeLocal(newRange);
    // Only apply filter if both values are valid and max is not less than min
    if (handlePriceChange && !isNaN(newRange.minPrice) && !isNaN(newRange.maxPrice) && newRange.maxPrice >= newRange.minPrice) {
      handlePriceChange(newRange);
    }
  };

  const handleMinPriceSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    const currentMax = priceRangeLocal.maxPrice || priceRange.maxPrice;
    const newRange = {
      ...priceRangeLocal,
      minPrice: Math.min(value, currentMax),
    };
    setPriceRangeLocal(newRange);
    if (handlePriceChange) {
      handlePriceChange(newRange);
    }
  };

  const handleMaxPriceSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    const currentMin = priceRangeLocal.minPrice || priceRange.minPrice;
    const newRange = {
      ...priceRangeLocal,
      maxPrice: Math.max(value, currentMin),
    };
    setPriceRangeLocal(newRange);
    if (handlePriceChange) {
      handlePriceChange(newRange);
    }
  };

  const activeFiltersCount = (filters?.brands?.length || 0) + 
    (filters?.groups?.length || 0) +
    ((filters?.minPrice || filters?.maxPrice) ? 1 : 0);

  const clearAllFilters = () => {
    if (handleClearAllFilters) {
      handleClearAllFilters();
    } else {
      // Fallback: clear manually
      if (filters?.brands && filters.brands.length > 0) {
        filters.brands.forEach(brand => {
          if (filters.brands.includes(brand)) {
            handleFilters("brands", brand);
          }
        });
      }
      if (filters?.groups && filters.groups.length > 0) {
        filters.groups.forEach(group => {
          if (filters.groups.includes(group)) {
            handleFilters("groups", group);
          }
        });
      }
      if (priceRange.minPrice !== undefined && priceRange.maxPrice !== undefined) {
        handlePriceChange({
          minPrice: priceRange.minPrice,
          maxPrice: priceRange.maxPrice,
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="relative bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:to-black rounded-xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg dark:shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10">
                <Filter className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                Filters
              </h2>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A030] text-[#0a0a0f] text-xs font-semibold shadow-sm">
                <span>{activeFiltersCount}</span>
              </div>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Brands Filter */}
          {brands && brands.length > 0 && (
            <Collapsible open={isBrandsOpen} onOpenChange={setIsBrandsOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full py-2 group">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Brands
                  </h3>
                  {isBrandsOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1.5 mt-3">
                  {brands.slice(0, 6).map((brand) => {
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
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                            isChecked
                              ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10 dark:border-[#D4AF37]/40'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleFilters("brands", brandId)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] transition-all duration-200"
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
                  {brands.length > 6 && (
                    <>
                      <AnimatePresence>
                        {showMoreBrands && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1.5 mt-1.5">
                              {brands.slice(6).map((brand) => {
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
                                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                                        isChecked
                                          ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10 dark:border-[#D4AF37]/40'
                                          : 'hover:bg-gray-50 dark:hover:bg-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={() => handleFilters("brands", brandId)}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] transition-all duration-200"
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => setShowMoreBrands(!showMoreBrands)}
                        className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-[#D4AF37] py-1.5 transition-colors"
                      >
                        {showMoreBrands ? `Show less` : `Show ${brands.length - 6} more`}
                      </button>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Groups/Collections Filter */}
          {groups && groups.length > 0 && (
            <Collapsible open={isGroupsOpen} onOpenChange={setIsGroupsOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full py-2 group">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Collections
                  </h3>
                  {isGroupsOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1.5 mt-3">
                  {groups.slice(0, 6).map((group) => {
                    const isChecked = filters?.groups?.includes(group);
                    return (
                      <motion.div
                        key={group}
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Label
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                            isChecked
                              ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10 dark:border-[#D4AF37]/40'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleFilters("groups", group)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] transition-all duration-200"
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
                  {groups.length > 6 && (
                    <>
                      <AnimatePresence>
                        {showMoreGroups && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1.5 mt-1.5">
                              {groups.slice(6).map((group) => {
                                const isChecked = filters?.groups?.includes(group);
                                return (
                                  <motion.div
                                    key={group}
                                    whileHover={{ x: 2 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  >
                                    <Label
                                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                                        isChecked
                                          ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10 dark:border-[#D4AF37]/40'
                                          : 'hover:bg-gray-50 dark:hover:bg-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={() => handleFilters("groups", group)}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] transition-all duration-200"
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => setShowMoreGroups(!showMoreGroups)}
                        className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-[#D4AF37] py-1.5 transition-colors"
                      >
                        {showMoreGroups ? `Show less` : `Show ${groups.length - 6} more`}
                      </button>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Price Range Filter */}
          {priceRange.minPrice !== undefined && priceRange.maxPrice !== undefined && (
            <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full py-2 group">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Price Range
                  </h3>
                  {isPriceOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 space-y-4 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/30 dark:to-transparent rounded-lg p-4 border border-gray-100 dark:border-gray-800/50">
                  {/* Range Display */}
                  <div className="text-center py-3 rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected Range</div>
                    <div className="text-lg font-semibold bg-gradient-to-r from-black to-gray-900 bg-clip-text text-transparent">
                      QR {priceRangeLocal.minPrice || priceRange.minPrice} – QR {priceRangeLocal.maxPrice || priceRange.maxPrice}
                    </div>
                  </div>

                  {/* Slider Section */}
                  <div className="relative pt-3 pb-2">
                    <div className="relative h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full">
                      <div 
                        className="absolute h-1.5 bg-gradient-to-r from-black to-gray-900 rounded-full shadow-sm"
                        style={{
                          left: `${((priceRangeLocal.minPrice || priceRange.minPrice) - priceRange.minPrice) / (priceRange.maxPrice - priceRange.minPrice) * 100}%`,
                          width: `${((priceRangeLocal.maxPrice || priceRange.maxPrice) - (priceRangeLocal.minPrice || priceRange.minPrice)) / (priceRange.maxPrice - priceRange.minPrice) * 100}%`
                        }}
                      />
                    </div>
                    {/* Calculate dynamic z-index based on slider positions */}
                    {(() => {
                      const minVal = priceRangeLocal.minPrice || priceRange.minPrice;
                      const maxVal = priceRangeLocal.maxPrice || priceRange.maxPrice;
                      const range = priceRange.maxPrice - priceRange.minPrice;
                      const minPercent = ((minVal - priceRange.minPrice) / range) * 100;
                      const maxPercent = ((maxVal - priceRange.minPrice) / range) * 100;
                      const distance = maxPercent - minPercent;
                      // Dynamic z-index: when sliders are close, prioritize the one being dragged
                      const minZIndex = distance < 15 ? 30 : 10;
                      const maxZIndex = distance < 15 ? 20 : 30;

                      // New slider thumb color: black border and fill rather than gold
                      const sliderThumbClass = "absolute top-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing";

                      return (
                        <>
                          <input
                            type="range"
                            min={priceRange.minPrice}
                            max={priceRange.maxPrice}
                            step="1"
                            value={minVal}
                            onChange={handleMinPriceSliderChange}
                            style={{ zIndex: minZIndex }}
                            className={sliderThumbClass}
                          />
                          <input
                            type="range"
                            min={priceRange.minPrice}
                            max={priceRange.maxPrice}
                            step="1"
                            value={maxVal}
                            onChange={handleMaxPriceSliderChange}
                            style={{ zIndex: maxZIndex }}
                            className={sliderThumbClass}
                          />
                        </>
                      );
                    })()}
                  </div>

                  {/* Price Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                        Min
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={priceRangeLocal.minPrice === '' ? '' : (priceRangeLocal.minPrice || priceRange.minPrice)}
                        onChange={handleMinPriceChange}
                        onBlur={(e) => {
                          const inputValue = e.target.value;
                          // If empty or invalid, reset to default
                          if (inputValue === '' || isNaN(parseFloat(inputValue)) || parseFloat(inputValue) < 0) {
                            const resetValue = priceRange.minPrice;
                            const newRange = {
                              ...priceRangeLocal,
                              minPrice: resetValue,
                            };
                            setPriceRangeLocal(newRange);
                            if (handlePriceChange && !isNaN(newRange.maxPrice)) {
                              handlePriceChange(newRange);
                            }
                          } else {
                            // Just validate that it's a valid number and not negative
                            const value = parseFloat(inputValue);
                            const currentMax = priceRangeLocal.maxPrice || priceRange.maxPrice;
                            // Only ensure min doesn't exceed max, but allow any positive value
                            const finalValue = value > currentMax ? currentMax : value;
                            const newRange = {
                              ...priceRangeLocal,
                              minPrice: finalValue,
                            };
                            setPriceRangeLocal(newRange);
                            if (handlePriceChange && !isNaN(newRange.maxPrice)) {
                              handlePriceChange(newRange);
                            }
                          }
                        }}
                        placeholder={`Min: ${priceRange.minPrice}`}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                        Max
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={priceRangeLocal.maxPrice === '' ? '' : (priceRangeLocal.maxPrice || priceRange.maxPrice)}
                        onChange={handleMaxPriceChange}
                        onBlur={(e) => {
                          const inputValue = e.target.value;
                          // If empty or invalid, reset to default
                          if (inputValue === '' || isNaN(parseFloat(inputValue)) || parseFloat(inputValue) < 0) {
                            const resetValue = priceRange.maxPrice;
                            const newRange = {
                              ...priceRangeLocal,
                              maxPrice: resetValue,
                            };
                            setPriceRangeLocal(newRange);
                            if (handlePriceChange && !isNaN(newRange.minPrice)) {
                              handlePriceChange(newRange);
                            }
                          } else {
                            // Just validate that it's a valid number and not negative
                            const value = parseFloat(inputValue);
                            const currentMin = priceRangeLocal.minPrice || priceRange.minPrice;
                            // Only ensure max is not less than min, but allow any positive value
                            const finalValue = value < currentMin ? currentMin : value;
                            const newRange = {
                              ...priceRangeLocal,
                              maxPrice: finalValue,
                            };
                            setPriceRangeLocal(newRange);
                            if (handlePriceChange && !isNaN(newRange.minPrice)) {
                              handlePriceChange(newRange);
                            }
                          }
                        }}
                        placeholder={`Max: ${priceRange.maxPrice}`}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductFiler;
