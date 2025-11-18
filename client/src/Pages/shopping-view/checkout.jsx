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
  Zap
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
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-black to-navy-950">
      {/* Hero Banner Section */}
      <div className="relative h-[350px] md:h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        <img src={img} className="w-full h-full object-cover" alt="Checkout Banner" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl animate-pulse z-0" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse z-0" style={{ animationDelay: '1s' }} />
        
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white px-6"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent drop-shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              إتمام الطلب
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gold-300/90 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              خطوة أخيرة للحصول على عطورك الفاخرة
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center mb-16"
        >
          <div className="flex items-center space-x-4 md:space-x-8 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gold-500/20 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            {[
              { icon: ShoppingBag, label: "السلة", completed: true },
              { icon: MapPin, label: "العنوان", completed: !!currentSelectedAddress },
              { icon: CreditCard, label: "الدفع", completed: false }
            ].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div 
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.completed 
                        ? 'bg-gradient-to-br from-gold-500 to-gold-600 shadow-[0_0_20px_rgba(255,215,0,0.4)]' 
                        : 'bg-navy-900/50 border-2 border-gold-500/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <step.icon className={`w-7 h-7 ${step.completed ? 'text-navy-950' : 'text-gold-400'}`} />
                  </motion.div>
                  <span className={`mt-2 text-sm font-semibold ${step.completed ? 'text-gold-400' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <ArrowRight className="w-6 h-6 text-gold-500/50 mx-4 md:mx-8" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-br from-navy-950/90 to-black/90 backdrop-blur-xl p-8 rounded-2xl border border-gold-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30 shadow-lg">
                    <MapPin className="w-7 h-7 text-gold-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">عنوان التسليم</h2>
                    <p className="text-sm text-gold-300/70">اختر عنوان التسليم المفضل لديك</p>
                  </div>
                </div>
                <Address
                  selectedId={currentSelectedAddress}
                  setCurrentSelectedAddress={setCurrentSelectedAddress}
                />
              </div>
            </motion.div>

            {/* Cart Items Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              {/* Dark mode only: new visual treatment, fallback to minimal for light */}
              <div className="
                absolute -inset-0.5 
                bg-gradient-to-r from-gold-500/20 to-transparent 
                rounded-2xl blur 
                opacity-0 
                group-hover:opacity-100 
                transition duration-300
                dark:bg-gradient-to-r dark:from-gold-500/20 dark:to-transparent
              " />
              <div className={`
                relative 
                p-8 rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                ${/* Dark mode styles */''}
                dark:bg-gradient-to-br dark:from-navy-950/90 dark:to-black/90 dark:backdrop-blur-xl dark:border-gold-500/20
                ${/* Light mode fallback */''}
                bg-white border-gold-100
              `}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`
                    p-4 rounded-xl shadow-lg
                    ${/* Dark mode gradient */''}
                    dark:bg-gradient-to-br dark:from-gold-500/20 dark:to-gold-600/10 dark:border dark:border-gold-500/30
                    ${/* Light mode fallback */''}
                    bg-gold-100 border border-gold-200
                  `}>
                    <ShoppingBag className={`
                      w-7 h-7
                      dark:text-gold-400
                      text-gold-600
                    `} />
                  </div>
                  <div>
                    <h2 className={`
                      text-2xl font-bold mb-1
                      dark:text-white
                      text-gold-900
                    `}>عناصر الطلب</h2>
                    <p className={`
                      text-sm
                      dark:text-gold-300/70
                      text-gold-600/80
                    `}>
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
                        transition={{ delay: index * 0.1 }}
                      >
                        <UserCartItemsContent cartItem={item} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className={`
                        w-20 h-20 mx-auto mb-4
                        dark:text-gold-400/30
                        text-gold-200/70
                      `} />
                      <p className={`
                        text-lg
                        dark:text-gold-300
                        text-gold-600
                      `}>السلة فارغة</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Payment Method Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-br from-navy-950/90 to-black/90 backdrop-blur-xl p-8 rounded-2xl border border-gold-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30 shadow-lg">
                    <CreditCard className="w-7 h-7 text-gold-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">طريقة الدفع</h2>
                    <p className="text-sm text-gold-300/70">اختر طريقة الدفع المناسبة</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { value: "COD", icon: Banknote, label: "الدفع عند الاستلام", desc: "ادفع عند استلام الطلب" },
                    { value: "Free Sample", icon: Gift, label: "تجربة مجانية", desc: "للعينات المجانية فقط" },
                    { value: "Transfer", icon: CreditCard, label: "تحويل بنكي / عبر الهاتف", desc: "تحويل مباشر" }
                  ].map((method) => (
                    <motion.label
                      key={method.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        paymentMethod === method.value
                          ? 'bg-gradient-to-r from-gold-500/20 to-gold-600/10 border-gold-500 shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                          : 'bg-navy-950/50 border-gold-500/30 hover:border-gold-500/60 hover:bg-gold-500/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-gold-500 accent-gold-500"
                      />
                      <div className={`p-3 rounded-lg ${
                        paymentMethod === method.value ? 'bg-gold-500/20' : 'bg-navy-900/50'
                      }`}>
                        <method.icon className={`w-6 h-6 ${
                          paymentMethod === method.value ? 'text-gold-400' : 'text-gold-500/50'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <span className={`font-semibold block ${
                          paymentMethod === method.value ? 'text-gold-300' : 'text-white'
                        }`}>
                          {method.label}
                        </span>
                        <span className="text-sm text-gold-300/60">{method.desc}</span>
                      </div>
                      {paymentMethod === method.value && (
                        <CheckCircle className="w-5 h-5 text-gold-400" />
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
                    className="mt-6 p-6 rounded-xl bg-gradient-to-br from-navy-900/80 to-black/80 border border-gold-500/20 space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/40 rounded-lg border border-gold-500/20">
                      <div>
                        <p className="text-gold-400 text-xs mb-1 font-semibold uppercase tracking-wider">رقم الهاتف</p>
                        <p className="text-white font-bold text-lg">01012345678</p>
                      </div>
                      <div>
                        <p className="text-gold-400 text-xs mb-1 font-semibold uppercase tracking-wider">رقم الحساب البنكي</p>
                        <p className="text-white font-bold text-lg">1234567890123456</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white font-semibold mb-2 block flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold-400" />
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        value={transferFullName}
                        onChange={(e) => setTransferFullName(e.target.value)}
                        placeholder="أدخل الاسم الكامل كما هو في التحويل"
                        className="w-full p-4 border-2 border-gold-500/30 rounded-xl bg-black/60 text-white placeholder:text-gold-400/50 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="text-white font-semibold mb-2 block flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold-400" />
                        المبلغ المحوّل
                      </label>
                      <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="أدخل المبلغ المحوّل"
                        className="w-full p-4 border-2 border-gold-500/30 rounded-xl bg-black/60 text-white placeholder:text-gold-400/50 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="text-white font-semibold mb-2 block flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gold-400" />
                        صورة التحويل
                      </label>
                      {transferImagePreview ? (
                        <div className="relative group">
                          <img src={transferImagePreview} alt="Transfer proof" className="w-full max-w-md rounded-xl border-2 border-gold-500/30 shadow-lg" />
                          <Button
                            type="button"
                            onClick={removeTransferImage}
                            className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full shadow-lg backdrop-blur-sm"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gold-500/40 rounded-xl cursor-pointer hover:bg-gold-500/10 hover:border-gold-500/60 transition-all duration-300 group">
                          <Upload className="w-10 h-10 text-gold-400 mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-gold-300 text-sm font-medium">اضغط لرفع صورة التحويل</span>
                          <span className="text-gold-400/60 text-xs mt-1">PNG, JPG حتى 5MB</span>
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
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Coupon Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/30 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-br from-navy-950/90 to-black/90 backdrop-blur-xl p-6 rounded-2xl border border-gold-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30">
                    <Tag className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">كود الخصم</h3>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="أدخل كود الخصم"
                      className="w-full p-4 border-2 border-gold-500/30 rounded-xl bg-black/60 text-white placeholder:text-gold-400/50 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                    />
                    {couponCode && (
                      <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold-400" />
                    )}
                  </div>
                  <Button 
                    onClick={handleApplyCoupon}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 font-bold py-4 text-base shadow-[0_4px_20px_rgba(255,215,0,0.3)] hover:shadow-[0_6px_30px_rgba(255,215,0,0.4)] transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        جاري التحقق...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        تطبيق الخصم
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/30 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-br from-navy-950/90 to-black/90 backdrop-blur-xl p-6 rounded-2xl border border-gold-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30">
                    <CreditCard className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">ملخص الطلب</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gold-500/10">
                    <span className="text-gold-300/80">المجموع الفرعي</span>
                    <span className="text-white font-semibold text-lg">{totalCartAmount.toFixed(2)} QR</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gold-500/10">
                    <span className="text-gold-300/80">التوصيل</span>
                    <span className={`font-semibold text-lg ${
                      shipping === 0 ? 'text-green-400' : 'text-white'
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
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-between items-center py-3 bg-green-500/10 rounded-lg px-3 border border-green-500/30"
                    >
                      <span className="text-green-400 font-semibold flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        الخصم
                      </span>
                      <span className="text-green-400 font-bold text-lg">- {discountAmount.toFixed(2)} QR</span>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between items-center py-4 mt-4 border-t-2 border-gold-500/30">
                    <span className="text-white font-bold text-xl">المجموع الكلي</span>
                    <span className="text-gold-400 font-black text-2xl bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
                      {discountedTotal.toFixed(2)} QR
                    </span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-gold-500/20 space-y-3">
                  {[
                    { icon: Shield, text: "دفع آمن ومحمي" },
                    { icon: Truck, text: "توصيل سريع خلال 2-3 أيام" },
                    { icon: Lock, text: "ضمان استرداد المبلغ" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-gold-300/80">
                      <feature.icon className="w-4 h-4 text-gold-400" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Button */}
                <div className="mt-8">
                  <Button 
                    onClick={handleCreateOrder} 
                    disabled={!cartItems?.items?.length || !currentSelectedAddress || isLoading}
                    className="w-full bg-gradient-to-r from-gold-500 via-gold-600 to-gold-500 hover:from-gold-600 hover:via-gold-700 hover:to-gold-600 text-navy-950 font-black py-5 text-lg shadow-[0_8px_30px_rgba(255,215,0,0.4)] hover:shadow-[0_12px_40px_rgba(255,215,0,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isLoading ? (
                      <div className="flex items-center gap-2 relative z-10">
                        <Clock className="w-5 h-5 animate-spin" />
                        جاري المعالجة...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 relative z-10">
                        <CheckCircle className="w-5 h-5" />
                        تأكيد الطلب
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
