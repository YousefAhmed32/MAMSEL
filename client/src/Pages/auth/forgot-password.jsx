import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement forgot password API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور",
        description: "يرجى التحقق من بريدك الإلكتروني",
      });
    }, 1500);
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
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom duration-700">
          <div className="bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-8 sm:p-10">
            
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E5C158] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <img 
                    src="/assets/logo-c.png" 
                    alt="MAMSEL" 
                    className="w-12 h-12 object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-light tracking-wide text-gray-900 dark:text-white mb-2">
                إعادة تعيين كلمة المرور
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  البريد الإلكتروني
                </label>
                <div className="relative group">
                  <Mail className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField 
                      ? 'text-[#D4AF37]' 
                      : 'text-gray-400 dark:text-gray-600'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField(true)}
                    onBlur={() => setFocusedField(false)}
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3.5 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all duration-300"
                    placeholder="name@example.com"
                    required
                  />
                  {focusedField && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent w-full animate-in slide-in-from-left duration-300"></div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
                    <span>جاري الإرسال...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>إرسال رابط إعادة التعيين</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
