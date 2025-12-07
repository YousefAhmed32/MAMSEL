import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getAdminDashboardSummary } from "@/store/admin/analysis";
import { 
  BarChart3, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp,
  TrendingDown,
  Package,
  Activity,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Select,
  SelectGroup,
  SelectContent,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Color palette that works in both modes
const COLORS = {
  revenue: { light: "#10b981", dark: "#00ff99" }, // Green
  users: { light: "#3b82f6", dark: "#3b82f6" }, // Blue
  orders: { light: "#f59e0b", dark: "#facc15" }, // Yellow/Amber
  products: { light: "#ec4899", dark: "#ff57bb" }, // Pink
  pending: { light: "#f59e0b", dark: "#f59e0b" }, // Amber
  approved: { light: "#10b981", dark: "#10b981" }, // Green
  rejected: { light: "#ef4444", dark: "#ef4444" }, // Red
};

// Hook to detect dark mode
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

function AdminAnalysis() {
  const dispatch = useDispatch();
  const { t: translate } = useTranslation();
  const t = translate || ((key) => key); // Fallback to return key if t is undefined
  const { loading, summary, error } = useSelector((state) => state.adminAnalysis);
  const [timeframe, setTimeframe] = useState("monthly");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isDarkMode = useDarkMode();

  useEffect(() => {
    dispatch(getAdminDashboardSummary(timeframe));
  }, [dispatch, timeframe]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(getAdminDashboardSummary(timeframe));
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getTimeframeLabel = () => {
    const labels = {
      monthly: t('analysis.timeframe.monthly'),
      weekly: t('analysis.timeframe.weekly'),
      daily: t('analysis.timeframe.daily'),
      hour: t('analysis.timeframe.hour'),
      yearly: t('analysis.timeframe.yearly'),
      all: t('analysis.timeframe.all'),
    };
    return labels[timeframe] || "";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value || 0);
  };

  // Get color based on mode
  const getColor = (colorKey) => {
    return isDarkMode ? COLORS[colorKey].dark : COLORS[colorKey].light;
  };

  // Prepare chart data
  const chartData = summary?.chartData || [];
  
  // Revenue breakdown for pie chart
  const revenueBreakdown = summary ? [
    { name: t('dashboard.revenueStatus.approved'), value: summary.totalRevenue || 0, color: getColor('approved') },
    { name: t('dashboard.revenueStatus.pending'), value: summary.pendingRevenue || 0, color: getColor('pending') },
    { name: t('dashboard.revenueStatus.rejected'), value: summary.rejectedRevenue || 0, color: getColor('rejected') },
  ] : [];

  // Custom tooltip with dark/light mode support
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`
          backdrop-blur-md border rounded-lg p-3 shadow-xl
          ${isDarkMode 
            ? 'bg-gray-900/95 border-[#D4AF37]/30' 
            : 'bg-white/95 border-gray-200'
          }
        `}>
          <p className={`text-sm mb-2 font-bold ${
            isDarkMode ? 'text-[#D4AF37]' : 'text-gray-900'
          }`}>
            {label}
          </p>
          {payload.map((entry, index) => {
            const value = entry.value || 0;
            const displayValue = entry.name === "الإيرادات" || entry.dataKey === "revenue"
              ? formatCurrency(value)
              : formatNumber(value);
            return (
              <p 
                key={index} 
                className={`text-sm flex items-center gap-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-700'
                }`}
                style={{ color: entry.color }}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}: {displayValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Chart colors for grid and axes
  const chartTextColor = isDarkMode ? "#d1d5db" : "#4b5563";
  const chartGridColor = isDarkMode ? "#374151" : "#e5e7eb";

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]">
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
            isDarkMode ? 'text-[#D4AF37]' : 'text-[#D4AF37]'
          }`} />
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]">
        <div className={`p-8 rounded-2xl text-center max-w-md border shadow-xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-red-400' : 'text-red-500'
          }`} />
          <h2 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {t('analysis.errorLoading')}
          </h2>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <Button 
            onClick={handleRefresh} 
            className="bg-[#D4AF37] text-[#0a0a0f] hover:bg-[#E5C158]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('analysis.retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]">
        <div className={`p-8 rounded-2xl text-center max-w-md border shadow-xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-[#D4AF37]' : 'text-[#D4AF37]'
          }`} />
          <h2 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            لا توجد بيانات متاحة
          </h2>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            ابدأ بإنشاء الطلبات والمنتجات لرؤية التحليلات
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className={`p-4 rounded-2xl shadow-lg group hover:scale-110 transition-transform duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10' 
                  : 'bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10'
              }`}>
                <BarChart3 className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-light tracking-tight mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('analysis.title')}
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-[#D4AF37] to-transparent mx-auto md:mx-0"></div>
              </div>
            </div>
            <p className={`text-lg font-light ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('analysis.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={(value) => setTimeframe(value)}>
              <SelectTrigger className={`
                w-[180px] border transition-all duration-200
                ${isDarkMode 
                  ? 'bg-gray-900/50 border-gray-800 text-white hover:border-[#D4AF37]/50' 
                  : 'bg-white border-gray-300 text-gray-900 hover:border-[#D4AF37]'
                }
              `}>
                <Calendar className={`w-4 h-4 mr-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={`
                border shadow-xl
                ${isDarkMode 
                  ? 'bg-gray-900 border-gray-800' 
                  : 'bg-white border-gray-200'
                }
              `}>
                <SelectGroup>
                  <SelectLabel className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    الفترة الزمنية
                  </SelectLabel>
                  <SelectItem 
                    value="hour" 
                    className={isDarkMode 
                      ? 'text-white hover:bg-gray-800 focus:bg-gray-800' 
                      : 'text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                    }
                  >
                    آخر 60 دقيقة
                  </SelectItem>
                  <SelectItem 
                    value="daily"
                    className={isDarkMode 
                      ? 'text-white hover:bg-gray-800 focus:bg-gray-800' 
                      : 'text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                    }
                  >
                    اليوم (24 ساعة)
                  </SelectItem>
                  <SelectItem 
                    value="weekly"
                    className={isDarkMode 
                      ? 'text-white hover:bg-gray-800 focus:bg-gray-800' 
                      : 'text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                    }
                  >
                    أسبوع (7 أيام)
                  </SelectItem>
                  <SelectItem 
                    value="monthly"
                    className={isDarkMode 
                      ? 'text-white hover:bg-gray-800 focus:bg-gray-800' 
                      : 'text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                    }
                  >
                    شهر (30 يوم)
                  </SelectItem>
                  <SelectItem 
                    value="yearly"
                    className={isDarkMode 
                      ? 'text-white hover:bg-gray-800 focus:bg-gray-800' 
                      : 'text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                    }
                  >
                    سنة (12 شهر)
                  </SelectItem>
                  <SelectItem 
                    value="all"
                    className={isDarkMode 
                      ? 'text-white hover:bg-gray-800 focus:bg-gray-800' 
                      : 'text-gray-900 hover:bg-gray-50 focus:bg-gray-50'
                    }
                  >
                    منذ البداية
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className={`
                border transition-all duration-200 hover:scale-105
                ${isDarkMode 
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-[#D4AF37]/50' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#D4AF37]'
                }
              `}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('analysis.refresh')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: t('analysis.totalUsers'),
              value: formatNumber(summary.totalUsers),
              icon: Users,
              colorKey: 'users',
              growth: "+12%",
              trend: "up",
            },
            {
              label: t('analysis.totalProducts'),
              value: formatNumber(summary.totalProducts),
              icon: Package,
              colorKey: 'products',
              growth: "+8%",
              trend: "up",
            },
            {
              label: t('analysis.totalOrders'),
              value: formatNumber(summary.totalOrders),
              icon: ShoppingCart,
              colorKey: 'orders',
              growth: "+15%",
              trend: "up",
            },
            {
              label: t('analysis.totalRevenue'),
              value: formatCurrency(summary.totalRevenue),
              icon: DollarSign,
              colorKey: 'revenue',
              growth: "+22%",
              trend: "up",
            },
          ].map(({ label, value, icon: Icon, colorKey, growth, trend }, idx) => {
            const color = getColor(colorKey);
            return (
              <div
                key={idx}
                className={`
                  group relative rounded-2xl p-6 shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
                  border overflow-hidden
                  ${isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                  }
                `}
              >
                {/* Gradient overlay on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)` 
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        backgroundColor: `${color}20`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                      trend === 'up' 
                        ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                        : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                    }`}>
                      {trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-xs font-semibold">{growth}</span>
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {value}
                  </h3>
                  <p className={`text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {label}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {getTimeframeLabel()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Approved Revenue */}
          <div className={`
            group relative rounded-2xl p-6 shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
            border-2 overflow-hidden
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30' 
              : 'bg-gradient-to-br from-white to-green-50/30 border-green-500/30'
            }
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  isDarkMode ? 'bg-green-500/20' : 'bg-green-500/20'
                }`}>
                  <CheckCircle2 className={`w-6 h-6 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(summary.totalRevenue || 0)}
                  </h3>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {t('analysis.approvedRevenue')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Revenue */}
          <div className={`
            group relative rounded-2xl p-6 shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
            border-2 overflow-hidden
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-500/30' 
              : 'bg-gradient-to-br from-white to-yellow-50/30 border-yellow-500/30'
            }
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-500/20'
                }`}>
                  <Clock className={`w-6 h-6 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(summary.pendingRevenue || 0)}
                  </h3>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    إيرادات قيد الانتظار
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rejected Revenue */}
          <div className={`
            group relative rounded-2xl p-6 shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
            border-2 overflow-hidden
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/30' 
              : 'bg-gradient-to-br from-white to-red-50/30 border-red-500/30'
            }
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  isDarkMode ? 'bg-red-500/20' : 'bg-red-500/20'
                }`}>
                  <XCircle className={`w-6 h-6 ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(summary.rejectedRevenue || 0)}
                  </h3>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {t('analysis.rejectedRevenue')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview - Area Chart */}
        <div className={`
          rounded-2xl p-6 shadow-lg border
          ${isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shadow-md ${
                isDarkMode ? 'bg-[#D4AF37]/20' : 'bg-[#D4AF37]/10'
              }`}>
                <LineChartIcon className={`w-5 h-5 ${
                  isDarkMode ? 'text-[#D4AF37]' : 'text-[#D4AF37]'
                }`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  نظرة عامة على الإيرادات
                </h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {getTimeframeLabel()}
                </p>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getColor('revenue')} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={getColor('revenue')} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis 
                  dataKey="label" 
                  stroke={chartTextColor} 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: chartTextColor }}
                />
                <YAxis 
                  stroke={chartTextColor} 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: chartTextColor }}
                  tickFormatter={(value) => `QR${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={getColor('revenue')} 
                  strokeWidth={3} 
                  fill="url(#colorRevenue)" 
                  name="الإيرادات"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {t('analysis.noRevenueData')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Chart */}
          <div className={`
            rounded-2xl p-6 shadow-lg border
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg shadow-md ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
              }`}>
                <Users className={`w-5 h-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                تسجيلات المستخدمين
              </h2>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis 
                    dataKey="label" 
                    stroke={chartTextColor} 
                    style={{ fontSize: '12px' }}
                    tick={{ fill: chartTextColor }}
                  />
                  <YAxis 
                    stroke={chartTextColor} 
                    style={{ fontSize: '12px' }}
                    tick={{ fill: chartTextColor }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="users" 
                    fill={getColor('users')} 
                    radius={[8, 8, 0, 0]} 
                    name={t('analysis.totalUsers')}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {t('analysis.noDataAvailable')}
                </p>
              </div>
            )}
          </div>

          {/* Orders Chart */}
          <div className={`
            rounded-2xl p-6 shadow-lg border
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg shadow-md ${
                isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-500/10'
              }`}>
                <ShoppingCart className={`w-5 h-5 ${
                  isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              </div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t('analysis.ordersOverview')}
              </h2>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis 
                    dataKey="label" 
                    stroke={chartTextColor} 
                    style={{ fontSize: '12px' }}
                    tick={{ fill: chartTextColor }}
                  />
                  <YAxis 
                    stroke={chartTextColor} 
                    style={{ fontSize: '12px' }}
                    tick={{ fill: chartTextColor }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke={getColor('orders')}
                    strokeWidth={3}
                    dot={{ fill: getColor('orders'), r: 4 }}
                    activeDot={{ r: 6, fill: getColor('orders') }}
                    name="الطلبات"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  لا توجد بيانات
                </p>
              </div>
            )}
          </div>

          {/* Products Chart */}
          <div className={`
            rounded-2xl p-6 shadow-lg border
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg shadow-md ${
                isDarkMode ? 'bg-pink-500/20' : 'bg-pink-500/10'
              }`}>
                <Package className={`w-5 h-5 ${
                  isDarkMode ? 'text-pink-400' : 'text-pink-600'
                }`} />
              </div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                المنتجات المضافة
              </h2>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis 
                    dataKey="label" 
                    stroke={chartTextColor} 
                    style={{ fontSize: '12px' }}
                    tick={{ fill: chartTextColor }}
                  />
                  <YAxis 
                    stroke={chartTextColor} 
                    style={{ fontSize: '12px' }}
                    tick={{ fill: chartTextColor }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="products" 
                    fill={getColor('products')} 
                    radius={[8, 8, 0, 0]} 
                    name={t('analysis.totalProducts')}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {t('analysis.noDataAvailable')}
                </p>
              </div>
            )}
          </div>

          {/* Revenue Breakdown Pie Chart */}
          <div className={`
            rounded-2xl p-6 shadow-lg border
            ${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg shadow-md ${
                isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'
              }`}>
                <PieChartIcon className={`w-5 h-5 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t('analysis.revenueBreakdown')}
              </h2>
            </div>
            {revenueBreakdown.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                      color: isDarkMode ? "#d1d5db" : "#111827",
                    }}
                    labelStyle={{
                      color: isDarkMode ? "#d1d5db" : "#111827",
                    }}
                  />
                  <Legend 
                    formatter={(value) => value}
                    wrapperStyle={{ 
                      color: chartTextColor, 
                      fontSize: '12px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  لا توجد بيانات للإيرادات
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Combined Overview Chart */}
        <div className={`
          rounded-2xl p-6 shadow-lg border
          ${isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg shadow-md ${
              isDarkMode ? 'bg-[#D4AF37]/20' : 'bg-[#D4AF37]/10'
            }`}>
              <Activity className={`w-5 h-5 ${
                isDarkMode ? 'text-[#D4AF37]' : 'text-[#D4AF37]'
              }`} />
            </div>
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              نظرة شاملة على الأداء
            </h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis 
                  dataKey="label" 
                  stroke={chartTextColor} 
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: chartTextColor }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke={chartTextColor} 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: chartTextColor }}
                  label={{ 
                    value: 'الإيرادات (QR)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { 
                      textAnchor: 'middle', 
                      fill: chartTextColor 
                    } 
                  }}
                  tickFormatter={(value) => `QR${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={chartTextColor} 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: chartTextColor }}
                  label={{ 
                    value: 'العدد', 
                    angle: 90, 
                    position: 'insideRight', 
                    style: { 
                      textAnchor: 'middle', 
                      fill: chartTextColor 
                    } 
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    color: chartTextColor, 
                    fontSize: '12px' 
                  }}
                  iconType="line"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={getColor('revenue')}
                  strokeWidth={3}
                  dot={{ fill: getColor('revenue'), r: 4 }}
                  activeDot={{ r: 6, fill: getColor('revenue') }}
                  name={t('analysis.totalRevenue')}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="users"
                  stroke={getColor('users')}
                  strokeWidth={3}
                  dot={{ fill: getColor('users'), r: 4 }}
                  activeDot={{ r: 6, fill: getColor('users') }}
                  name={t('analysis.totalUsers')}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke={getColor('orders')}
                  strokeWidth={3}
                  dot={{ fill: getColor('orders'), r: 4 }}
                  activeDot={{ r: 6, fill: getColor('orders') }}
                  name={t('analysis.totalOrders')}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="products"
                  stroke={getColor('products')}
                  strokeWidth={3}
                  dot={{ fill: getColor('products'), r: 4 }}
                  activeDot={{ r: 6, fill: getColor('products') }}
                  name={t('analysis.totalProducts')}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                لا توجد بيانات متاحة
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAnalysis;
