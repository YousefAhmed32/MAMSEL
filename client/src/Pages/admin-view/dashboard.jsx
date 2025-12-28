import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Star,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  BadgeCheck,
  TicketPercent,
  ImageIcon,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { getAdminDashboardSummary } from '@/store/admin/analysis';
import { fetchAllFilteredProducts } from '@/store/shop/products-slice';
import { getAllOrdersForAdmin } from '@/store/admin/order-slice.js';
import { getProductImageUrl } from '@/utils/imageUtils';


function AdminDashboard() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { summary, loading } = useSelector((state) => state.adminAnalysis);
  const { productList } = useSelector((state) => state.shopProducts);
  const { orderList } = useSelector((state) => state.adminOrder);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [previousSummary, setPreviousSummary] = useState(null);

  // Map timeFilter to API timeframe format
  const getTimeframeForAPI = (filter) => {
    const mapping = {
      '24h': 'daily', // Last 24 hours (daily timeframe in API)
      '7d': 'weekly',
      '30d': 'monthly',
      '3m': 'yearly',
      '1y': 'yearly',
      'all': 'all'
    };
    return mapping[filter] || 'monthly';
  };

  // Get start date based on timeframe (matching API logic)
  const getStartDateForTimeframe = (filter) => {
    const now = new Date();
    // Calculate months more accurately
    const getMonthsAgo = (months) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - months);
      return date;
    };
    
    // Set time to start of day for date comparisons
    const startOfDay = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    
    const mapping = {
      '24h': startOfDay(now), // Start of today (daily timeframe = last 24 hours)
      '7d': new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // Last 6 days + today = 7 days (weekly)
      '30d': new Date(startOfDay(now).getTime() - 29 * 24 * 60 * 60 * 1000), // Last 29 days + today = 30 days (monthly)
      '3m': getMonthsAgo(3), // Last 3 months (maps to yearly API timeframe)
      '1y': getMonthsAgo(11), // Last 11 months + current = 12 months (yearly)
      'all': new Date('2025-01-01') // Match API start date
    };
    return mapping[filter] || new Date(startOfDay(now).getTime() - 29 * 24 * 60 * 60 * 1000);
  };

  // Filter data by timeframe
  const filterByTimeframe = (data, dateField = 'createdAt') => {
    if (!data || data.length === 0) return [];
    const startDate = getStartDateForTimeframe(timeFilter);
    return data.filter(item => {
      const itemDate = new Date(item.orderDate || item[dateField] || item.createdAt);
      return itemDate >= startDate;
    });
  };

  useEffect(() => {
    // Store previous summary before fetching new one
    if (summary) {
      setPreviousSummary(summary);
    }
    const timeframe = getTimeframeForAPI(timeFilter);
    dispatch(getAdminDashboardSummary(timeframe));
    dispatch(fetchAllFilteredProducts({ filtersParams: {}, sortParams: "price-lowtohight" }));
    dispatch(getAllOrdersForAdmin());
  }, [dispatch, timeFilter]);

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Calculate best selling products from actual orders
  const calculateBestSellingProducts = () => {
    const filteredOrders = filterByTimeframe(orderList || [], 'orderDate');
    if (!filteredOrders || filteredOrders.length === 0) return [];
    
    const productSales = {};
    
    filteredOrders.forEach(order => {
      // Handle both new format (items) and legacy format (cartItems)
      const items = order.items || order.cartItems || [];
      
      items.forEach(item => {
        const productId = item.productId?._id || item.productId || item._id;
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            sales: 0,
            revenue: 0,
            name: item.title || 'منتج',
            price: price
          };
        }
        
        productSales[productId].sales += quantity;
        productSales[productId].revenue += price * quantity;
      });
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4)
      .map(product => {
        const fullProduct = productList?.find(p => p._id === product.id || String(p._id) === String(product.id));
        return {
          ...product,
          name: fullProduct?.title || product.name,
          product: fullProduct // Store full product object for image access
        };
      });
  };

  // Calculate recent activity from orders and products
  const calculateRecentActivity = () => {
    const activities = [];
    
    // Get recent orders (filtered by timeframe)
    const filteredOrders = filterByTimeframe(orderList || [], 'orderDate');
    if (filteredOrders && filteredOrders.length > 0) {
      const recentOrders = filteredOrders
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.orderDate || a.createdAt);
          const dateB = new Date(b.orderDate || b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 3);
      
      recentOrders.forEach(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        const now = new Date();
        const diffMs = now - orderDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeAgo = '';
        if (diffMins < 60) {
          timeAgo = `منذ ${diffMins} دقيقة`;
        } else if (diffHours < 24) {
          timeAgo = `منذ ${diffHours} ساعة`;
        } else {
          timeAgo = `منذ ${diffDays} يوم`;
        }
        
        const customerName = order.userName || order.userId || 'عميل';
        activities.push({
          action: `طلب جديد من ${customerName}`,
          time: timeAgo,
          type: 'info',
          date: orderDate
        });
      });
    }
    
    // Get recent products (filtered by timeframe)
    const filteredProducts = filterByTimeframe(productList || [], 'createdAt');
    if (filteredProducts && filteredProducts.length > 0) {
      const recentProducts = filteredProducts
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 2);
      
      recentProducts.forEach(product => {
        const productDate = new Date(product.createdAt);
        const now = new Date();
        const diffMs = now - productDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeAgo = '';
        if (diffMins < 60) {
          timeAgo = t('dashboard.minutesAgo', { count: diffMins });
        } else if (diffHours < 24) {
          timeAgo = t('dashboard.hoursAgo', { count: diffHours });
        } else {
          timeAgo = t('dashboard.daysAgo', { count: diffDays });
        }
        
        activities.push({
          action: t('dashboard.newProductAdded', { product: product.title }),
          time: timeAgo,
          type: 'success',
          date: productDate
        });
      });
    }
    
    // Sort by date and take most recent 4
    return activities
      .sort((a, b) => b.date - a.date)
      .slice(0, 4);
  };

  // Calculate real data from actual database
  const dashboardData = {
    overview: {
      totalRevenue: summary?.totalRevenue || 0,
      pendingRevenue: summary?.pendingRevenue || 0,
      rejectedRevenue: summary?.rejectedRevenue || 0,
      totalOrders: summary?.totalOrders || orderList?.length || 0,
      totalCustomers: summary?.totalCustomers || 0,
      totalProducts: summary?.totalProducts || productList?.length || 0,
      revenueGrowth: previousSummary?.timeframeData ? calculateGrowth(summary?.timeframeData?.totalRevenue || 0, previousSummary.timeframeData?.totalRevenue || 0) : 0,
      ordersGrowth: previousSummary?.timeframeData ? calculateGrowth(summary?.timeframeData?.totalOrders || 0, previousSummary.timeframeData?.totalOrders || 0) : 0,
      customersGrowth: previousSummary?.timeframeData ? calculateGrowth(summary?.timeframeData?.totalCustomers || 0, previousSummary.timeframeData?.totalCustomers || 0) : 0,
      productsGrowth: previousSummary?.timeframeData ? calculateGrowth(summary?.timeframeData?.totalProducts || 0, previousSummary.timeframeData?.totalProducts || 0) : 0
    },
    recentOrders: (() => {
      const filteredOrders = filterByTimeframe(orderList || [], 'orderDate');
      return filteredOrders && filteredOrders.length > 0
        ? filteredOrders
            .slice()
            .sort((a, b) => {
              const dateA = new Date(a.orderDate || a.createdAt);
              const dateB = new Date(b.orderDate || b.createdAt);
              return dateB - dateA;
            })
            .slice(0, 4)
          .map(order => ({
            id: order._id,
            customer: order.userName || order.userId || t('dashboard.customer'),
            amount: order.totalAmount || order.total || 0,
            status: order.orderStatus || 'pending',
            date: new Date(order.orderDate || order.createdAt).toLocaleString('ar-EG'),
            products: (order.items || order.cartItems || []).map(item => item.title || 'منتج').slice(0, 2)
          }))
        : [];
    })(),
    bestSellingProducts: calculateBestSellingProducts(),
    recentActivity: calculateRecentActivity()
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      case 'shipped':
      case 'on the way':
        return 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'accepted':
      case 'processing':
        return 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return t('orders.delivered');
      case 'pending':
        return t('orders.pending');
      case 'shipped':
      case 'on the way':
        return t('orders.shipped');
      case 'accepted':
      case 'processing':
        return t('orders.processing');
      case 'rejected':
        return t('orders.cancelled');
      case 'cancelled':
        return t('orders.cancelled');
      default:
        return status || t('common.status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-black/20 to-black/10 dark:from-white/10 dark:to-white/5 backdrop-blur-sm shadow-lg group hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-8 h-8 text-black dark:text-white" />
              <div className="absolute inset-0 bg-black/20 dark:bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-gray-900 dark:text-white mb-2">
                {t('dashboard.title')}
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-black/80 to-transparent dark:from-white/70 mx-auto"></div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4 font-light">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <div className="flex bg-gray-100/50 dark:bg-gray-900/50 rounded-xl p-1.5 gap-1.5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            {[
              { key: "24h", label: "24س", icon: Clock, translationKey: "dashboard.timeFilters.24h" },
              { key: "7d", label: "7أ", icon: Activity, translationKey: "dashboard.timeFilters.7d" },
              { key: "30d", label: "30ي", icon: BarChart3, translationKey: "dashboard.timeFilters.30d" },
              { key: "3m", label: "3ش", icon: TrendingUp, translationKey: "dashboard.timeFilters.3m" },
              { key: "1y", label: "سنة", icon: LineChart, translationKey: "dashboard.timeFilters.1y" },
              { key: "all", label: "الكل", icon: Star, translationKey: "dashboard.timeFilters.all" }
            ].map(({ key, label, translationKey, icon: Icon }) => {
              const fullLabel = t(translationKey);
              return (
                <button
                  key={key}
                  onClick={() => setTimeFilter(key)}
                  className={`
                    px-3 sm:px-4 md:px-5 py-2.5 rounded-lg transition-all duration-300 
                    flex items-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap
                    ${
                      timeFilter === key 
                        ? "bg-gradient-to-r from-black to-gray-800 text-white dark:bg-gradient-to-r dark:from-white dark:to-gray-700 dark:text-gray-900 shadow-lg shadow-black/30 scale-105 dark:shadow-white/20" 
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-800/50"
                    }
                  `}
                  title={fullLabel}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${timeFilter === key ? 'text-white dark:text-gray-900' : ''}`} />
                  <span className="hidden sm:inline">{fullLabel}</span>
                  <span className="sm:hidden">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Revenue */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-[#0f0f0f] dark:to-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 dark:from-green-500/30 dark:to-green-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20">
                  {parseFloat(dashboardData.overview.revenueGrowth) > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${
                    parseFloat(dashboardData.overview.revenueGrowth) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {parseFloat(dashboardData.overview.revenueGrowth) > 0 ? '+' : ''}{dashboardData.overview.revenueGrowth}%
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                QR{dashboardData.overview.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('dashboard.overview.totalRevenue')}</p>
            </div>
          </div>

          {/* Total Orders */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-[#0f0f0f] dark:to-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 dark:from-blue-500/30 dark:to-blue-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  {parseFloat(dashboardData.overview.ordersGrowth) > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${
                    parseFloat(dashboardData.overview.ordersGrowth) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {parseFloat(dashboardData.overview.ordersGrowth) > 0 ? '+' : ''}{dashboardData.overview.ordersGrowth}%
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {dashboardData.overview.totalOrders.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('dashboard.overview.totalOrders')}</p>
            </div>
          </div>

          {/* Total Customers */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-[#0f0f0f] dark:to-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 dark:from-purple-500/30 dark:to-purple-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  {parseFloat(dashboardData.overview.customersGrowth) > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${
                    parseFloat(dashboardData.overview.customersGrowth) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {parseFloat(dashboardData.overview.customersGrowth) > 0 ? '+' : ''}{dashboardData.overview.customersGrowth}%
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {dashboardData.overview.totalCustomers.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('dashboard.overview.totalCustomers')}</p>
            </div>
          </div>

          {/* Total Products */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-[#0f0f0f] dark:to-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/15 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-black/30 to-black/10 dark:from-white/20 dark:to-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/10 dark:bg-white/10">
                  {parseFloat(dashboardData.overview.productsGrowth) > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${
                    parseFloat(dashboardData.overview.productsGrowth) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {parseFloat(dashboardData.overview.productsGrowth) > 0 ? '+' : ''}{dashboardData.overview.productsGrowth}%
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
                {dashboardData.overview.totalProducts}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('dashboard.overview.totalProducts')}</p>
            </div>
          </div>
        </div>

        {/* Revenue Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Pending Revenue */}
          <div className="group relative bg-gradient-to-br from-white to-gray-200/40 dark:from-[#0f0f0f] dark:to-[#444]/20 border-2 border-gray-400/50 dark:border-gray-400/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-400/10 dark:from-gray-300/15 dark:to-gray-100/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-gray-800 dark:text-gray-300" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                QR{dashboardData.overview.pendingRevenue.toLocaleString()}
              </h3>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold mb-1">{t('dashboard.revenueStatus.pendingRevenue')}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{t('dashboard.revenueStatus.pendingDescription')}</p>
            </div>
          </div>

          {/* Rejected Revenue */}
          <div className="group relative bg-gradient-to-br from-white to-red-50/30 dark:from-[#0f0f0f] dark:to-red-900/10 border-2 border-red-500/30 dark:border-red-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 dark:from-red-500/30 dark:to-red-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                QR{dashboardData.overview.rejectedRevenue.toLocaleString()}
              </h3>
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-1">{t('dashboard.revenueStatus.rejectedRevenue')}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs">{t('dashboard.revenueStatus.rejectedDescription')}</p>
            </div>
          </div>

          {/* Total Approved Revenue */}
          <div className="group relative bg-gradient-to-br from-white to-green-50/30 dark:from-[#0f0f0f] dark:to-green-900/10 border-2 border-green-500/30 dark:border-green-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 dark:from-green-500/30 dark:to-green-500/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                QR{dashboardData.overview.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-green-600 dark:text-green-400 text-sm font-semibold mb-1">إيرادات معتمدة</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs">إجمالي الإيرادات المعتمدة</p>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Orders */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('dashboard.recentOrders.title')}</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-xs sm:text-sm">
                          {order.customer.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-foreground font-semibold text-sm sm:text-base truncate">{order.customer}</h4>
                        <p className="text-muted-foreground text-xs truncate">{order.id.substring(0, 8)}...</p>
                        {order.products && order.products.length > 0 && (
                          <p className="text-primary text-xs truncate">{order.products.join(', ')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-foreground font-semibold text-sm sm:text-base">${order.amount.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-muted-foreground text-xs mt-1">{order.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('dashboard.noRecentOrders')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sales Chart Placeholder */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('dashboard.monthlySales')}</h2>
            </div>
            
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">رسم بياني للمبيعات</p>
                <p className="text-primary text-xs sm:text-sm mt-2">{t('dashboard.chartComingSoon')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('dashboard.bestSelling.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {dashboardData.bestSellingProducts.length > 0 ? (
              dashboardData.bestSellingProducts.map((product) => (
                <div key={product.id} className="bg-muted/50 dark:bg-muted/30 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <img 
                        src={getProductImageUrl(product.product || product)} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground font-semibold text-xs sm:text-sm truncate">{product.name}</h4>
                      <p className="text-muted-foreground text-xs">{product.sales} مبيعة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-sm sm:text-base">${product.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>لا توجد بيانات مبيعات متاحة</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Useful Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">إجراءات سريعة</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-black dark:text-white p-3 sm:p-4 rounded-lg transition-all">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-black dark:text-white" />
                <span className="text-xs sm:text-sm font-medium">إضافة منتج</span>
              </button>
              <button className="bg-green-500/10 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/30 text-green-600 dark:text-green-400 p-3 sm:p-4 rounded-lg transition-all">
                <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-medium">طلبات جديدة</span>
              </button>
              <button className="bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 dark:hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 p-3 sm:p-4 rounded-lg transition-all">
                <TicketPercent className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-medium">كوبون جديد</span>
              </button>
              <button className="bg-orange-500/10 dark:bg-orange-500/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/30 text-orange-600 dark:text-orange-400 p-3 sm:p-4 rounded-lg transition-all">
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-medium">إدارة البنرات</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">حالة النظام</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm sm:text-base">قاعدة البيانات</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm">متصل</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm sm:text-base">الخادم</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm">يعمل</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm sm:text-base">التخزين</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm sm:text-base">آخر نسخة احتياطية</span>
                <span className="text-muted-foreground text-xs sm:text-sm">منذ ساعتين</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">النشاط الأخير</h2>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-gray-700 dark:bg-gray-300' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs sm:text-sm">{activity.action}</p>
                    <p className="text-muted-foreground text-xs">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>لا يوجد نشاط حديث</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
