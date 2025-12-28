import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
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
import { ArrowUpDownIcon, Package, Sparkles, ArrowLeft } from "lucide-react";

// Collection name mapping
const collectionNames = {
  corset: "Corset & Lingerie",
  ramadan: "Ramadan Collection",
  giveaways: "Giveaways & Gifts"
};

function Collection() {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList, isLoading } = useSelector((state) => state.shopProducts);

  const [sort, setSort] = useState("price-lowtohigh");

  const displayName = collectionNames[collectionName] || collectionName || "Collection";

  useEffect(() => {
    // Fetch products filtered by group
    // Use 'groups' parameter (plural) to match backend API
    dispatch(
      fetchAllFilteredProducts({ 
        filtersParams: { groups: [displayName] }, 
        sortParams: sort 
      })
    );
  }, [dispatch, sort, displayName]);

  function handleSort(value) {
    setSort(value);
  }

  function handleGetProductDetails(productId) {
    if (productId) {
      navigate(`/shop/product/${productId}`);
    }
  }

  function handleAddToCart(productId, totalStock) {
    if (!user) {
      toast({
        title: "Please login first",
        description: "Please login to add the product to the cart",
        variant: "destructive"
      });
      return;
    }

    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        item => item.productId === productId
      );

      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > totalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this product`,
            variant: "destructive"  
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({ userId: user?.id, productId: productId, quantity: 1 })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product added to cart successfully",
          description: "Product added successfully"
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-black dark:to-gray-950 transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Discover our unique collection
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full font-medium">
                {productList?.length || 0} products
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Sort and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-6 transition-colors duration-300"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/30">
                <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {productList?.length || 0} products available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/30">
                <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">
                  {productList?.length || 0} products available
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
                    <span className="font-semibold">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
                  <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                    {sortOption.map((sortItem) => (
                      <DropdownMenuRadioItem
                        value={sortItem.id}
                        key={sortItem.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        {sortItem.label}
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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 mx-auto mb-4"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <p className="text-pink-600 dark:text-pink-400 font-semibold mt-4">
                Loading products...
              </p>
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
            className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="p-6 rounded-full bg-pink-50 dark:bg-pink-900/20 mb-6">
              <Package className="w-16 h-16 text-pink-500 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No products found in this collection
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mb-6">
              No products found in collection {displayName}
            </p>
            <Button
              onClick={() => navigate('/shop/listing')}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              Browse All Products
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Collection;

