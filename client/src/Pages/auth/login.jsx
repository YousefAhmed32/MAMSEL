import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "@/store/auth-slice";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Chrome
} from "lucide-react";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const savedPath = location.state?.from || "/shop/home";

  // Page load animation
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    dispatch(loginUser(formData)).then((data) => {
      setIsLoading(false);
      if (data?.payload?.success) {
        toast({
          title: "مرحباً بك في MAMSEL",
          description: "تم تسجيل الدخول بنجاح"
        });
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

  function handleGoogleLogin() {
    // TODO: Implement Google OAuth
    toast({
      title: "قريباً",
      description: "تسجيل الدخول عبر Google سيكون متاحاً قريباً",
    });
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
      {/* Elegant Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            currentColor 2px,
            currentColor 4px
          )`,
        }}></div>
      </div>

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Brand Showcase */}
            <div className="hidden lg:flex flex-col justify-center space-y-12 animate-in fade-in slide-in-from-left duration-700">
              {/* Logo */}
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E5C158] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                    <img 
                      src="/assets/logo3.png" 
                      alt="MAMSEL" 
                      className="w-14 h-14 object-cover rounded-full"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-7xl font-light tracking-[0.1em] text-gray-900 dark:text-white leading-none">
                    MAMSEL
                  </h1>
                  <div className="h-px w-24 bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 font-light tracking-wide max-w-md">
                    استكشف عالم الأزياء الفاخرة معنا، حيث تلتقي الأناقة بالجودة العالية
                  </p>
                </div>
              </div>

              {/* Elegant Features */}
              <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-4 group">
                  <div className="w-1 h-12 bg-gradient-to-b from-[#D4AF37] to-transparent group-hover:h-16 transition-all duration-300"></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">تجربة فريدة</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">تصميمات حصرية من أفضل المصممين</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-1 h-12 bg-gradient-to-b from-[#D4AF37] to-transparent group-hover:h-16 transition-all duration-300"></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">جودة عالية</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">منتجات مختارة بعناية فائقة</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-1 h-12 bg-gradient-to-b from-[#D4AF37] to-transparent group-hover:h-16 transition-all duration-300"></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">خدمة متميزة</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">دعم عملاء على مدار الساعة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right duration-700">
              <div className="bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-8 sm:p-10">
                
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E5C158] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                      <img 
                        src="/assets/logo3.png" 
                        alt="MAMSEL" 
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Header */}
                <div className="mb-10">
                  <h2 className="text-3xl font-light tracking-wide text-gray-900 dark:text-white mb-2">
                    تسجيل الدخول
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ادخل بياناتك للوصول إلى حسابك
                  </p>
                </div>

                {/* Google Login Button */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full mb-6 h-12 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#0f0f0f] text-gray-700 dark:text-gray-300 transition-all duration-300 group"
                >
                  <Chrome className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span>المتابعة مع Google</span>
                </Button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#0f0f0f] px-2 text-gray-500 dark:text-gray-400">أو</span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      البريد الإلكتروني
                    </label>
                    <div className="relative group">
                      <Mail className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === 'email' 
                          ? 'text-[#D4AF37]' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3.5 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all duration-300"
                        placeholder="name@example.com"
                        required
                      />
                      {focusedField === 'email' && (
                        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent w-full animate-in slide-in-from-left duration-300"></div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        كلمة المرور
                      </label>
                      <Link
                        to="/auth/forgot-password"
                        className="text-xs text-[#D4AF37] hover:text-[#E5C158] transition-colors"
                      >
                        نسيت كلمة المرور؟
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === 'password' 
                          ? 'text-[#D4AF37]' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3.5 pr-12 pl-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all duration-300"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-[#D4AF37] transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {focusedField === 'password' && (
                        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent w-full animate-in slide-in-from-left duration-300"></div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gray-900 dark:bg-white text-white/90 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
                        <span>جاري تسجيل الدخول...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>تسجيل الدخول</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Register Link */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ليس لديك حساب؟{" "}
                    <Link
                      to="/auth/register"
                      className="font-medium text-[#D4AF37] hover:text-[#E5C158] transition-colors underline-offset-4 hover:underline"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;
