import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Crown,
  Star,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
  ShoppingCart,
  FileText,
  Hash
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  getAllUsers, 
  updateUserStatus, 
  getUsersStats,
  getUserDetails
} from "@/store/admin/users-slice";

function AdminUsers() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { users, stats, isLoading, error, userDetails } = useSelector((state) => state.adminUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch users and stats on component mount and when filters change
  useEffect(() => {
    dispatch(getAllUsers({ 
      role: filterRole, 
      status: filterStatus, 
      search: searchTerm 
    }));
    dispatch(getUsersStats(timeFilter));
  }, [dispatch, filterRole, filterStatus, timeFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(getAllUsers({ 
        role: filterRole, 
        status: filterStatus, 
        search: searchTerm 
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, filterRole, filterStatus]);

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await dispatch(updateUserStatus({ userId, status: newStatus })).unwrap();
      // Refresh users list
      dispatch(getAllUsers({ 
        role: filterRole, 
        status: filterStatus, 
        search: searchTerm 
      }));
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const handleViewDetails = async (userId) => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
    try {
      await dispatch(getUserDetails(userId)).unwrap();
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير متاح";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getAvatar = (user) => {
    if (user.userName) {
      return user.userName.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const filteredUsers = users || [];

  const getTimeBasedStats = () => {
    if (!stats) {
      return {
        lastHour: 0,
        last7Days: 0,
        last30Days: 0,
        totalRevenue: 0,
        avgOrderValue: 0
      };
    }

    return {
      lastHour: stats.lastHourActive || 0,
      last7Days: timeFilter === "7d" ? (stats.newUsers || 0) : 0,
      last30Days: timeFilter === "30d" ? (stats.newUsers || 0) : 0,
      totalRevenue: stats.totalRevenue || 0,
      avgOrderValue: stats.avgOrderValue || 0
    };
  };

  const displayStats = getTimeBasedStats();

  const getTimeframeLabel = () => {
    const labels = {
      "24h": t('dashboard.timeFilters.24h'),
      "7d": t('dashboard.timeFilters.7d'),
      "30d": t('dashboard.timeFilters.30d'),
      "3m": t('dashboard.timeFilters.3m'),
      "1y": t('dashboard.timeFilters.1y'),
      "all": t('users.sinceCreation')
    };
    return labels[timeFilter] || t('users.sinceCreation');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">{t('users.active')}</Badge>;
      case "inactive":
        return <Badge className="bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">{t('users.inactive')}</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">غير محدد</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/30">{t('users.admin')}</Badge>;
      case "user":
      case "customer":
        return <Badge className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">{t('users.user')}</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">غير محدد</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription) => {
    switch (subscription) {
      case "premium":
        return <Badge className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 flex items-center gap-1">
          <Crown className="w-3 h-3" /> مميز
        </Badge>;
      case "basic":
        return <Badge className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">عادي</Badge>;
      case "admin":
        return <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
          <Shield className="w-3 h-3" /> إدارة
        </Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">غير محدد</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-primary/10 dark:bg-primary/20 backdrop-blur-sm">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              {t('users.title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            {t('users.subtitle')}
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <div className="flex bg-muted/50 dark:bg-muted/30 rounded-xl p-1 gap-1">
            {[
              { key: "24h", label: "24س", icon: Clock, fullLabel: "آخر 24 ساعة" },
              { key: "7d", label: "7أ", icon: Calendar, fullLabel: "آخر 7 أيام" },
              { key: "30d", label: "30ي", icon: BarChart3, fullLabel: "آخر 30 يوم" },
              { key: "3m", label: "3ش", icon: TrendingUp, fullLabel: "آخر 3 أشهر" },
              { key: "1y", label: "سنة", icon: LineChart, fullLabel: "آخر سنة" },
              { key: "all", label: "الكل", icon: Star, fullLabel: "منذ الإنشاء" }
            ].map(({ key, label, fullLabel, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => setTimeFilter(key)}
                variant={timeFilter === key ? "default" : "ghost"}
                className={`px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
                  timeFilter === key 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                title={fullLabel}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{fullLabel}</span>
                <span className="sm:hidden">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Users */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {stats?.totalUsers || 0}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">{t('users.totalUsers')}</p>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stats?.newUsers || 0} جديد ({getTimeframeLabel()})
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 dark:bg-green-500/20">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {stats?.activeUsers || 0}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">{t('users.activeUsers')}</p>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t('users.fromLastWeek')}
            </div>
          </div>

          {/* Time-based Active Users */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {timeFilter === "24h" ? (stats?.lastHourActive || 0) : (stats?.newUsers || 0)}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {timeFilter === "24h" ? t('users.activeLast24h') : 
               timeFilter === "7d" ? t('users.newIn7Days') : 
               timeFilter === "30d" ? t('users.newIn30Days') :
               timeFilter === "3m" ? t('users.newIn3Months') :
               timeFilter === "1y" ? t('users.newInYear') : t('users.sinceCreation')}
            </p>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stats?.newUsers || 0} {t('users.newUser')}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">إجمالي الإيرادات</p>
            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {getTimeframeLabel()}
            </div>
          </div>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Premium Users */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats?.premiumUsers || 0}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{t('users.premiumSubscribers')}</p>
              </div>
            </div>
            <div className="w-full bg-muted/50 dark:bg-muted/30 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats?.totalUsers ? ((stats.premiumUsers || 0) / stats.totalUsers * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Verified Users */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 dark:bg-green-500/20">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats?.verifiedUsers || 0}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{t('users.verifiedUsers')}</p>
              </div>
            </div>
            <div className="w-full bg-muted/50 dark:bg-muted/30 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats?.totalUsers ? ((stats.verifiedUsers || 0) / stats.totalUsers * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  ${Math.round(stats?.avgOrderValue || 0)}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">متوسط قيمة الطلب</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              من {filteredUsers.filter(u => u.totalOrders > 0).length} عميل نشط
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t('users.searchFilters')}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('users.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm sm:text-base min-w-[140px]"
            >
              <option value="all">{t('users.allRolesOption')}</option>
              <option value="user">{t('users.customersOption')}</option>
              <option value="admin">{t('users.adminsOption')}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm sm:text-base min-w-[140px]"
            >
              <option value="all">{t('users.allStatusesOption')}</option>
              <option value="active">{t('users.activeOption')}</option>
              <option value="inactive">{t('users.inactiveOption')}</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              قائمة المستخدمين
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
              <Users className="w-4 h-4" />
              <span>{filteredUsers.length} مستخدم</span>
            </div>
          </div>
          
          {isLoading && filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{t('users.errorFetching')}: {error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('users.noUsers')}</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id || user.id}
                  className="group flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/50 transition-all duration-300 border border-border hover:border-primary/30"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0 flex-1 w-full lg:w-auto">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-base sm:text-xl">
                          {getAvatar(user)}
                        </span>
                      </div>
                      {user.isVerified !== false && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-foreground font-semibold text-base sm:text-lg truncate">{user.userName || user.name || "مستخدم"}</h3>
                        {getSubscriptionBadge(user.subscription || (user.role === "admin" ? "admin" : "basic"))}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{user.phone || user.address?.phone || "غير متاح"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{user.address?.city || user.location || "غير متاح"}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{t('users.joined')}: {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{t('users.lastLogin')}: {formatDate(user.lastLogin)}</span>
                        </div>
                        {user.role !== "admin" && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 flex-shrink-0" />
                            <span>{user.totalOrders || 0} {t('users.orders')} • ${(user.totalSpent || 0).toFixed(2)} {t('users.spending')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(user.status)}
                      {getRoleBadge(user.role)}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        {user.role !== "admin" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(user._id || user.id, user.status)}
                            className="text-foreground hover:bg-muted"
                          >
                            {user.status === "active" ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                {t('users.deactivate')}
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                {t('users.activate')}
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-foreground hover:bg-muted">
                          <Mail className="w-4 h-4 mr-2" />
                          {t('users.sendEmail')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleViewDetails(user._id || user.id)}
                          className="text-foreground hover:bg-muted"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {t('users.viewDetails')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto bg-background border-border">
          <SheetHeader>
            <SheetTitle className="text-foreground text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              {t('users.userDetails')}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {t('users.viewAllOrders')}
            </SheetDescription>
          </SheetHeader>

          {isLoading && !userDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : userDetails ? (
            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              {/* User Info */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-lg sm:text-xl">
                      {userDetails.avatar || getAvatar(userDetails)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">{userDetails.userName || "مستخدم"}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base truncate">{userDetails.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {getStatusBadge(userDetails.status)}
                      {getRoleBadge(userDetails.role)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">إجمالي الطلبات</p>
                    <p className="text-foreground font-bold">{userDetails.totalOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">إجمالي الإنفاق</p>
                    <p className="text-foreground font-bold">${(userDetails.totalSpent || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">تاريخ الانضمام</p>
                    <p className="text-foreground font-bold text-xs">{formatDate(userDetails.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">آخر دخول</p>
                    <p className="text-foreground font-bold text-xs">{formatDate(userDetails.lastLogin)}</p>
                  </div>
                </div>
              </div>

              {/* Orders Section */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t('users.ordersSection', { count: userDetails.orders?.length || 0 })}
                </h3>
                {userDetails.orders && userDetails.orders.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                    {userDetails.orders.map((order) => (
                      <div key={order._id} className="bg-muted/50 dark:bg-muted/30 p-3 sm:p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground font-semibold text-sm sm:text-base">
                              طلب #{order._id.toString().slice(-8)}
                            </p>
                            <p className="text-muted-foreground text-xs sm:text-sm">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-foreground font-bold text-sm sm:text-base">${(order.total || order.totalAmount || 0).toFixed(2)}</p>
                            <Badge className={`mt-1 text-xs ${
                              order.orderStatus === 'delivered' ? 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                              order.orderStatus === 'pending' ? 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                              order.orderStatus === 'cancelled' ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                              'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            }`}>
                              {order.orderStatus || 'pending'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items && order.items.length > 0 && (
                            <div>
                                <p className="text-muted-foreground text-xs sm:text-sm mb-2">{t('users.productsLabel')}</p>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 bg-background p-2 rounded">
                                    {item.productImage && (
                                      <img 
                                        src={item.productImage} 
                                        alt={item.title}
                                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-foreground text-xs sm:text-sm truncate">{item.title}</p>
                                      <p className="text-muted-foreground text-xs">
                                        {t('users.quantity')}: {item.quantity} × ${item.price}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {order.address && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-muted-foreground text-xs sm:text-sm">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {order.address.address}, {order.address.city}
                                {order.address.phone && ` - ${order.address.phone}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  ) : (
                  <p className="text-muted-foreground text-center py-8">{t('users.noOrders')}</p>
                )}
              </div>

              {/* Addresses Section */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t('users.addressesSection', { count: userDetails.addresses?.length || 0 })}
                </h3>
                {userDetails.addresses && userDetails.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {userDetails.addresses.map((address) => (
                      <div key={address._id} className="bg-muted/50 dark:bg-muted/30 p-3 sm:p-4 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-semibold text-sm sm:text-base truncate">{address.address}</p>
                              <p className="text-muted-foreground text-xs sm:text-sm">{address.city}</p>
                            </div>
                          </div>
                          {address.pincode && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                              <Hash className="w-3 h-3 flex-shrink-0" />
                              {address.pincode}
                            </div>
                          )}
                          {address.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              {address.phone}
                            </div>
                          )}
                          {address.notes && (
                            <div className="flex items-start gap-2 text-muted-foreground text-xs sm:text-sm mt-2 pt-2 border-t border-border">
                              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{address.notes}</span>
                            </div>
                          )}
                          <p className="text-muted-foreground text-xs mt-2">
                            أضيف في: {formatDate(address.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('users.noAddresses')}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-destructive">
              <p>{t('users.failedToFetch')}</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminUsers;
