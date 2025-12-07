import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Address from "@/components/shopping-view/address";
import img from "/assets/account2.png";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { createCheckoutOrder, validateCoupon, clearCoupon } from "@/store/shop/checkout-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { getAllOrderByUserId } from "@/store/shop/order-slice.js";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  Tag, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Lock,
  Truck,
  Clock,
  Banknote,
  Gift,
  Upload,
  X,
  Sparkles,
  Star,
  Zap,
  Package,
  ChevronRight
} from "lucide-react";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading, validatedCoupon, couponDiscount } = useSelector((state) => state.checkout);

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [transferFullName, setTransferFullName] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferImage, setTransferImage] = useState(null);
  const [transferImagePreview, setTransferImagePreview] = useState(null);
  
  const totalCartAmount = cartItems?.items?.reduce((sum, item) => {
    const price = item?.salePrice > 0 ? item.salePrice : item.price;
    return sum + price * item.quantity;
  }, 0) || 0;
  
  const shipping = totalCartAmount >= 100 ? 0 : 10;
  const totalBeforeDiscount = totalCartAmount + shipping;
  const discountAmount = couponDiscount || 0;
  const discountedTotal = Math.max(0, totalBeforeDiscount - discountAmount);

  // Apply coupon using API
  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) {
      toast({ title: "يرجى إدخال كود الخصم", variant: "destructive" });
      return;
    }

    dispatch(validateCoupon({ 
      code: trimmed, 
      orderAmount: totalBeforeDiscount,
      userId: user?.id 
    })).then((result) => {
      if (result.payload?.success && result.payload?.valid) {
        toast({ 
          title: `✅ تم تطبيق الكوبون بنجاح! خصم ${result.payload.data?.discountAmount?.toFixed(2)} QR`,
          variant: "default"
        });
      } else {
        toast({ 
          title: result.payload?.message || "❌ كود الخصم غير صحيح أو منتهي الصلاحية", 
          variant: "destructive" 
        });
        dispatch(clearCoupon());
      }
    });
  };

  // Handle transfer image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "حجم الصورة يجب أن يكون أقل من 5MB", variant: "destructive" });
        return;
      }
      setTransferImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeTransferImage = () => {
    setTransferImage(null);
    setTransferImagePreview(null);
  };

  const handleCreateOrder = async () => {
    if (!cartItems?.items?.length) {
      toast({ title: "السلة فارغة", variant: "destructive" });
      return;
    }

    if (!currentSelectedAddress) {
      toast({ title: "يرجى اختيار عنوان للتسليم", variant: "destructive" });
      return;
    }

    // Validate Transfer payment requirements
    if (paymentMethod === "Transfer") {
      if (!transferFullName.trim()) {
        toast({ title: "يرجى إدخال الاسم الكامل", variant: "destructive" });
        return;
      }
      if (!transferAmount || parseFloat(transferAmount) <= 0) {
        toast({ title: "يرجى إدخال المبلغ المحوّل", variant: "destructive" });
        return;
      }
      if (!transferImage) {
        toast({ title: "يرجى رفع صورة التحويل", variant: "destructive" });
        return;
      }
    }

    const orderData = {
      items: cartItems.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      })),
      address: {
        addressId: currentSelectedAddress._id,
        address: currentSelectedAddress.address,
        pincode: currentSelectedAddress.pincode,
        city: currentSelectedAddress.city,
        phone: currentSelectedAddress.phone,
        notes: currentSelectedAddress.notes,
      },
      paymentMethod: paymentMethod,
      couponCode: validatedCoupon?.code || couponCode || "",
      transferFullName: transferFullName,
      transferAmount: transferAmount,
    };

    dispatch(createCheckoutOrder({ 
      orderData, 
      transferImage: paymentMethod === "Transfer" ? transferImage : null 
    })).then((result) => {
      if (result.payload?.success) {
        // Clear coupon after successful order creation
        dispatch(clearCoupon());
        setCouponCode("");
        
        dispatch(fetchCartItems(user.id));
        dispatch(getAllOrderByUserId(user.id));
        
        toast({ 
          title: "✅ تم إنشاء الطلب بنجاح!", 
          variant: "default" 
        });
        setTimeout(() => {
          navigate("/shop/account");
        }, 1500);
      } else {
        toast({ 
          title: result.payload?.message || "❌ فشل إنشاء الطلب", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-black dark:to-gray-950 transition-colors duration-300">
    {/* Header Section */}
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              إتمام الطلب
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              خطوة أخيرة للحصول على طلبك
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full font-medium">
              {cartItems?.items?.length || 0} منتج
            </span>
          </div>
        </div>
      </div>
    </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                {[
                  { icon: ShoppingBag, label: "السلة", completed: true, step: 1 },
                  { icon: MapPin, label: "العنوان", completed: !!currentSelectedAddress, step: 2 },
                  { icon: CreditCard, label: "الدفع", completed: false, step: 3 }
                ].map((step, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        step.completed 
                          ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30' 
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span className={`mt-2 text-xs font-medium ${
                        step.completed 
                          ? 'text-pink-600 dark:text-pink-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className="flex-1 mx-2 h-0.5 bg-gray-200 dark:bg-gray-700 relative">
                        {step.completed && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-500"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Address Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/30">
                  <MapPin className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    عنوان التسليم
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    اختر عنوان التسليم المفضل لديك
                  </p>
                </div>
              </div>
              <Address
                selectedId={currentSelectedAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            </motion.div>

            {/* Cart Items Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/30">
                  <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    عناصر الطلب
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {cartItems?.items?.length || 0} منتج في السلة
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {cartItems?.items?.length > 0 ? (
                  cartItems.items.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UserCartItemsContent cartItem={item} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                    <p className="text-gray-500 dark:text-gray-400">السلة فارغة</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Method Section */}
           
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Coupon Section */}
              {/* <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/30">
                    <Tag className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">كود الخصم</h3>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="أدخل كود الخصم"
                      className="w-full p-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 dark:focus:border-pink-500 transition-all"
                    />
                    {couponCode && (
                      <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-500" />
                    )}
                  </div>
                  <Button 
                    onClick={handleApplyCoupon}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-3.5 text-sm shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        جاري التحقق...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        تطبيق الخصم
                      </div>
                    )}
                  </Button>
                </div>
              </motion.div> */}

             
               <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/30">
                  <CreditCard className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    طريقة الدفع
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    اختر طريقة الدفع المناسبة
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { value: "COD", icon: Banknote, label: "الدفع عند الاستلام", desc: "ادفع عند استلام الطلب" },
                  // { value: "Free Sample", icon: Gift, label: "تجربة مجانية", desc: "للعينات المجانية فقط" },
                  { value: "Transfer", icon: CreditCard, label: "تحويل بنكي / عبر الهاتف", desc: "تحويل مباشر" }
                ].map((method) => (
                  <motion.label
                    key={method.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === method.value
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-500 dark:border-pink-500 shadow-md shadow-pink-500/10'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-pink-600 dark:text-pink-400 accent-pink-600 dark:accent-pink-400"
                    />
                    <div className={`p-2.5 rounded-lg ${
                      paymentMethod === method.value 
                        ? 'bg-pink-100 dark:bg-pink-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <method.icon className={`w-5 h-5 ${
                        paymentMethod === method.value 
                          ? 'text-pink-600 dark:text-pink-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold block ${
                        paymentMethod === method.value 
                          ? 'text-pink-600 dark:text-pink-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {method.label}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{method.desc}</span>
                    </div>
                    {paymentMethod === method.value && (
                      <CheckCircle className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    )}
                  </motion.label>
                ))}
              </div>

              {/* Transfer Payment Details */}
              {paymentMethod === "Transfer" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wider">رقم الهاتف</p>
                      <p className="text-gray-900 dark:text-white font-semibold text-base">01012345678</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wider">رقم الحساب البنكي</p>
                      <p className="text-gray-900 dark:text-white font-semibold text-base">1234567890123456</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-900 dark:text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={transferFullName}
                      onChange={(e) => setTransferFullName(e.target.value)}
                      placeholder="أدخل الاسم الكامل كما هو في التحويل"
                      className="w-full p-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 dark:focus:border-pink-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-900 dark:text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      المبلغ المحوّل
                    </label>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="أدخل المبلغ المحوّل"
                      className="w-full p-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 dark:focus:border-pink-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-900 dark:text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                      <Upload className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      صورة التحويل
                    </label>
                    {transferImagePreview ? (
                      <div className="relative group">
                        <img 
                          src={transferImagePreview} 
                          alt="Transfer proof" 
                          className="w-full max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg" 
                        />
                        <Button
                          type="button"
                          onClick={removeTransferImage}
                          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-pink-400 dark:hover:border-pink-600 transition-all duration-200 group">
                        <Upload className="w-10 h-10 text-gray-400 dark:text-gray-600 mb-3 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" />
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">اضغط لرفع صورة التحويل</span>
                        <span className="text-gray-400 dark:text-gray-600 text-xs mt-1">PNG, JPG حتى 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </motion.div>
              )}

              


            </motion.div>
             {/* Order Summary */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800/30">
                    <CreditCard className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">ملخص الطلب</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">المجموع الفرعي</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{totalCartAmount.toFixed(2)} QR</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">التوصيل</span>
                    <span className={`font-semibold text-sm ${
                      shipping === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {shipping === 0 ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          مجاني
                        </span>
                      ) : (
                        `${shipping.toFixed(2)} QR`
                      )}
                    </span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-between items-center py-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 border border-green-200 dark:border-green-800/30"
                    >
                      <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2 text-sm">
                        <Tag className="w-4 h-4" />
                        الخصم
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-bold">- {discountAmount.toFixed(2)} QR</span>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between items-center py-4 mt-2 border-t-2 border-gray-200 dark:border-gray-800">
                    <span className="text-gray-900 dark:text-white font-bold text-lg">المجموع الكلي</span>
                    <span className="text-pink-600 dark:text-pink-400 font-black text-xl">
                      {discountedTotal.toFixed(2)} QR
                    </span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2.5">
                  {[
                    { icon: Shield, text: "دفع آمن ومحمي" },
                    { icon: Truck, text: "توصيل سريع خلال 2-3 أيام" },
                    { icon: Lock, text: "ضمان استرداد المبلغ" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                      <feature.icon className="w-4 h-4 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Button */}
                <div className="mt-6">
                  <Button 
                    onClick={handleCreateOrder} 
                    disabled={!cartItems?.items?.length || !currentSelectedAddress || isLoading}
                    className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-700 hover:via-rose-700 hover:to-pink-700 text-white font-black py-4 text-base shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:shadow-pink-500/30 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <Clock className="w-5 h-5 animate-spin" />
                        <span>جاري المعالجة...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <CheckCircle className="w-5 h-5" />
                        <span>تأكيد الطلب</span>
                      </div>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
