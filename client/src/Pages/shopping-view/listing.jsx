import { motion } from "framer-motion";
import ProductFiler from "@/components/shopping-view/filter";
import ShoppingProductTitle from "@/components/shopping-view/product-title";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { sortOption } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { ArrowUpDownIcon, Grid3x3, Sparkles, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    } else if (value !== null && value !== undefined && value !== '') {
      queryParams.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const { productList, priceRange: globalPriceRange, isLoading } = useSelector((state) => state.shopProducts);

  const [filters, serFilters] = useState({});
  const [sort, serSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const categorySearchParams = searchParams.get('category')

  useEffect(() => {
    if (filters !== null && sort !== null)
      dispatch(
        fetchAllFilteredProducts({ filtersParams: filters, sortParams: sort })
      );
  }, [dispatch, sort, filters]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters]);

  function handleSort(value) {
    serSort(value);
  }

  function handleFilters(getSectionId, getCartItem) {
    const cpyFilters = { ...filters };

    if (!cpyFilters[getSectionId]) {
      cpyFilters[getSectionId] = [getCartItem];
    } else {
      const index = cpyFilters[getSectionId].indexOf(getCartItem);
      if (index === -1) {
        cpyFilters[getSectionId].push(getCartItem);
      } else {
        cpyFilters[getSectionId].splice(index, 1);
        if (cpyFilters[getSectionId].length === 0) {
          delete cpyFilters[getSectionId];
        }
      }
    }

    serFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handlePriceChange(priceRange) {
    const cpyFilters = { ...filters };
    
    if (globalPriceRange && 
        (priceRange.minPrice !== globalPriceRange.minPrice || 
         priceRange.maxPrice !== globalPriceRange.maxPrice)) {
      cpyFilters.minPrice = priceRange.minPrice;
      cpyFilters.maxPrice = priceRange.maxPrice;
    } else {
      delete cpyFilters.minPrice;
      delete cpyFilters.maxPrice;
    }

    serFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handleClearAllFilters() {
    serFilters({});
    sessionStorage.removeItem("filters");
  }

  function handleGetProductDetails(getCurrentProductId) {
    if (getCurrentProductId) {
      navigate(`/shop/product/${getCurrentProductId}`);
    }
  }

  function handleAddToCart(getCurrentProductId , getTotalStock) {
    let getCartItems = cartItems.items || []
    if(getCartItems.length){
      const indexOfCurrentItem=getCartItems.findIndex(item=>item.productId === getCurrentProductId)

      if(indexOfCurrentItem > -1){
        const getQuantity = getCartItems[indexOfCurrentItem].quantity
        if(getQuantity + 1 > getTotalStock){
          toast({
            title:`Only ${getQuantity} quantity can be added for this item`,
            variant:'destructive'
          })
          return
        }
      }
    }

    dispatch(
      addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id))
         toast({
            title: "تمت إضافة المنتج إلى السلة",
            description: "تمت إضافة المنتج بنجاح"
          });
      }
    });
  }

  useEffect(() => {
    serSort("price-lowtohigh");
    serFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-navy-950 dark:via-black dark:to-navy-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
          {/* Filter Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-6 lg:h-fit"
          >
            <ProductFiler 
              filters={filters} 
              handleFilters={handleFilters} 
              handlePriceChange={handlePriceChange}
              handleClearAllFilters={handleClearAllFilters}
            />
          </motion.div>

          {/* Products Section */}
          <div className="space-y-6">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gradient-to-br dark:from-navy-950/90 dark:to-black/90 backdrop-blur-xl rounded-2xl border border-gold-500/20 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6"
            >
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/30">
                <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
                  <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">    All products....
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gold-300/70 mt-1">
                    Discover our exclusive collection of luxurious fashion                     </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/30">
                <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">
                      {productList?.length || 0} products
                    </span>
                  </div>
                  
                  <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <ArrowUpDownIcon className="h-4 w-4" />
                    <span className="font-semibold">ترتيب</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
                      <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                        {sortOption.map((sortItems) => (
                          <DropdownMenuRadioItem
                            value={sortItems.id}
                            key={sortItems.id}
                            className="hover:bg-gold-50 dark:hover:bg-gold-500/10 cursor-pointer focus:bg-gold-50 dark:focus:bg-gold-500/10"
                          >
                            {sortItems.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-navy-700 mx-auto mb-4"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gold-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  <p className="text-gold-600 dark:text-gold-400 font-semibold mt-4">Loading products...</p>
                </div>
              </div>
            ) : productList && productList.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {productList.map((productItem, index) => (
                  <motion.div
                    key={productItem.id || productItem._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ShoppingProductTitle
                      handleGetProductDetails={handleGetProductDetails}
                      product={productItem}
                      handleAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gradient-to-br dark:from-navy-950/90 dark:to-black/90 backdrop-blur-xl rounded-2xl border border-gold-500/20 shadow-lg"
              >
                <div className="p-6 rounded-full bg-gold-500/10 dark:bg-gold-500/20 mb-6">
                  <Package className="w-16 h-16 text-pink-500 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gold-300/70 text-sm max-w-md">
                  Try modifying the filters to find what you're looking for
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingListing;
