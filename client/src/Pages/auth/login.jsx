import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Crown, 
  Shield, 
  Star, 
  Sparkles, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  Gift,
  Truck,
  Headphones
} from "lucide-react";


const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch()
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Get the saved path from location state
  const savedPath = location.state?.from || "/shop/home";

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    dispatch(loginUser(formData)).then((data) => {
      setIsLoading(false);
      if (data?.payload?.success) {
        toast({
          title: "مرحباً بك في عود الوجبة",
          description: "تم تسجيل الدخول بنجاح"
        });
        // Redirect to saved path or default based on user role
        setTimeout(() => {
          if (data?.payload?.user?.role === "admin") {
            navigate("/admin/analysis", { replace: true });
          } else {
            navigate(savedPath, { replace: true });
          }
        }, 500);
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: data?.payload?.message || "يرجى التحقق من البيانات المدخلة",
          variant: "destructive" 
        });
      }
    });
  }

  return (
    <div className="min-h-screen luxury-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Welcome Section */}
          <div className="text-center lg:text-right space-y-8">
            {/* Logo and Brand */}
            <div className="flex flex-col items-center lg:items-end space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-light flex items-center justify-center shadow-[0_0_30px_rgba(210,176,101,0.4)]">
                  <img 
                    src="/assets/logo2.png" 
                    alt="عود الوجبة" 
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Crown className="w-8 h-8 text-luxury-gold animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-white glow-text leading-tight">
                  عود الوجبة
                </h1>
                <div className="flex items-center justify-center lg:justify-end gap-2">
                  <Sparkles className="w-6 h-6 text-luxury-gold" />
                  <p className="text-2xl font-light text-luxury-gold">
                    متجر  العود الفاخرة
                  </p>
                  <Sparkles className="w-6 h-6 text-luxury-gold" />
                </div>
                <p className="text-white/80 text-lg max-w-md mx-auto lg:mx-0">
                  استكشف عالم  العود الفاخرة معنا، حيث تلتقي الأناقة بالجودة العالية
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto lg:mx-0">
              <Card className="bg-luxury-navy/20 backdrop-blur-sm border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">أمان مضمون</h3>
                  <p className="text-white/70 text-sm">حماية كاملة لبياناتك ومدفوعاتك</p>
                </CardContent>
              </Card>

              <Card className="bg-luxury-navy/20 backdrop-blur-sm border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">شحن سريع</h3>
                  <p className="text-white/70 text-sm">توصيل مجاني للطلبات الكبيرة</p>
                </CardContent>
              </Card>

              <Card className="bg-luxury-navy/20 backdrop-blur-sm border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">هدايا حصرية</h3>
                  <p className="text-white/70 text-sm">عروض وهدايا للعملاء المميزين</p>
                </CardContent>
              </Card>

              <Card className="bg-luxury-navy/20 backdrop-blur-sm border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">دعم 24/7</h3>
                  <p className="text-white/70 text-sm">خدمة عملاء على مدار الساعة</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-luxury-navy/30 backdrop-blur-sm border-luxury-gold/20 shadow-[0_0_50px_rgba(210,176,101,0.2)]">
              <CardContent className="p-8">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-luxury-gold rounded-full shadow-[0_0_10px_rgba(210,176,101,0.5)]"></div>
                    <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
                    <div className="w-3 h-3 bg-luxury-gold rounded-full shadow-[0_0_10px_rgba(210,176,101,0.5)]"></div>
                  </div>
                  <p className="text-luxury-gold/70">ادخل بياناتك للوصول إلى حسابك</p>
                </div>

                {/* Custom Form */}
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-gold/70" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-luxury-gold/50 rounded-xl px-4 py-3 pr-12 text-black placeholder-gray-500 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all shadow-lg"
                        placeholder="أدخل بريدك الإلكتروني"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-luxury-gold/70" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-white border border-luxury-gold/50 rounded-xl py-3 pr-12 pl-12 text-black placeholder-gray-500 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all shadow-lg"
                        placeholder="أدخل كلمة المرور"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxury-gold/70 hover:text-luxury-gold transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-luxury-gold to-luxury-gold-light hover:from-luxury-gold-light hover:to-luxury-gold text-luxury-navy font-bold py-3 text-lg rounded-xl shadow-[0_0_20px_rgba(210,176,101,0.4)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-luxury-navy"></div>
                        جاري تسجيل الدخول...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>تسجيل الدخول</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Register Link */}
                <div className="mt-8 text-center">
                  <p className="text-white/70 text-sm">
                    ليس لديك حساب؟
                    <Link
                      className="font-semibold ml-2 text-luxury-gold hover:text-luxury-gold-light hover:underline transition-colors"
                      to="/auth/register"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-luxury-gold/20">
                  <div className="flex items-center justify-center gap-6 text-white/60 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>آمن</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-luxury-gold" />
                      <span>موثوق</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>محمي</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;