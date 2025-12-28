import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice.js";
import { Badge } from "../ui/badge";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Eye,
  MoreVertical,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Truck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();
  const { t: translate } = useTranslation();
  const t = translate || ((key) => key); // Fallback to return key if t is undefined

  function handleFetchOrderDetails(getId) {
    setSelectedOrderId(getId);
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  const filteredOrders = orderList?.filter(order => {
    const orderDate = order.createdAt || order.orderDate;
    const matchesSearch = order._id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment?.method?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.orderStatus === filterStatus;
    const matchesDate = filterDate === "all" ||
      (filterDate === "today" && orderDate && new Date(orderDate).toDateString() === new Date().toDateString()) ||
      (filterDate === "week" && orderDate && new Date(orderDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filterDate === "month" && orderDate && new Date(orderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  // جميع ألوان الأصفر أو الذهبي تم استبدالها بالأسود مع دعم الوضعين الفاتح والداكن
  const getStatusIcon = (status) => {
    if (!status) return <Clock className="w-4 h-4 text-muted-foreground" />;

    const normalizedStatus = String(status).toLowerCase().trim();

    switch (normalizedStatus) {
      case "confirmed":
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "pending":
        // اللون الأسود لكل من الوضعين
        return <Clock className="w-4 h-4 text-black dark:text-white" />;
      case "processing":
        return <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "on the way":
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return <Badge className="bg-muted text-muted-foreground border-border">{t('orders.undefined')}</Badge>;
    }

    const normalizedStatus = String(status).toLowerCase().trim();

    switch (normalizedStatus) {
      case "confirmed":
      case "accepted":
        return <Badge className="bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">{t('orders.accepted')}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">{t('orders.rejected')}</Badge>;
      case "pending":
        // اسود كامل مكان الأصفر/الذهبي
        return (
          <Badge className="bg-black/10 dark:bg-black text-black dark:text-white border border-black/30 dark:border-white/30">
            {t('orders.pending')}
          </Badge>
        );
      case "processing":
        return <Badge className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">{t('orders.processing')}</Badge>;
      case "on the way":
        return <Badge className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">{t('orders.onTheWay')}</Badge>;
      case "shipped":
        return <Badge className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">{t('orders.shipped')}</Badge>;
      case "delivered":
        return <Badge className="bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">{t('orders.delivered')}</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">{t('orders.cancelled')}</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">{status || t('orders.undefined')}</Badge>;
    }
  };

  const totalRevenue = orderList?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
  const confirmedOrders = orderList?.filter(order => order.orderStatus === "confirmed").length || 0;
  const pendingOrders = orderList?.filter(order => order.orderStatus === "pending").length || 0;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-black/10 dark:bg-black backdrop-blur-sm">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-black dark:text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              {t('orders.title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            {t('orders.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-black/10 dark:bg-black">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{orderList?.length || 0}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{t('orders.totalOrders')}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 dark:bg-green-500/20">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{confirmedOrders}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">طلبات مؤكدة</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              {/* خلفية البطاقة المعلقة: أسود فقط ولا يوجد ذهبي أو أصفر */}
              <div className="p-2 sm:p-3 rounded-xl bg-black/10 dark:bg-black">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{pendingOrders}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{t('orders.pendingOrders')}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">${totalRevenue.toFixed(2)}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">إجمالي الإيرادات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t('orders.searchFilters')}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('orders.searchOrders')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm sm:text-base min-w-[140px]"
            >
              <option value="all">{t('orders.allStatuses')}</option>
              <option value="pending">{t('orders.pending')}</option>
              <option value="accepted">{t('orders.accepted')}</option>
              <option value="rejected">{t('orders.rejected')}</option>
              <option value="processing">{t('orders.processing')}</option>
              <option value="on the way">{t('orders.onTheWay')}</option>
              <option value="shipped">{t('orders.shipped')}</option>
              <option value="delivered">{t('orders.delivered')}</option>
              <option value="cancelled">{t('orders.cancelled')}</option>
            </select>

            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm sm:text-base min-w-[140px]"
            >
              <option value="all">{t('orders.allDates')}</option>
              <option value="today">{t('orders.today')}</option>
              <option value="week">{t('orders.thisWeek')}</option>
              <option value="month">{t('orders.thisMonth')}</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((orderItem) => (
              <div key={orderItem._id} className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0 flex-1 w-full lg:w-auto">
                    <div className="p-2 sm:p-3 rounded-xl bg-black/10 dark:bg-black flex-shrink-0">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                        <h3 className="text-foreground font-semibold text-base sm:text-lg">
                          <span dir={i18n.language === "ar" ? "rtl" : "ltr"} style={{ unicodeBidi: "isolate", direction: i18n.language === "ar" ? "rtl" : "ltr" }}>
                            {t('orders.orderNumber', { number: orderItem._id.slice(-8) })}
                          </span>
                        </h3>
                        {getStatusIcon(orderItem.orderStatus || 'pending')}
                        {getStatusBadge(orderItem.orderStatus || 'pending')}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{orderItem.createdAt ? new Date(orderItem.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') :
                            orderItem.orderDate ? orderItem.orderDate.split("T")[0] : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {orderItem.total || orderItem.totalAfterDiscount || orderItem.totalAmount || 0} QR
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{orderItem.items?.length || orderItem.cartItems?.length || 0} {t('orders.products')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{t('orders.paymentMethod')}: {orderItem.payment?.method || 'N/A'}</span>
                        </div>
                        {orderItem.payment?.method === 'Transfer' && orderItem.payment?.transferInfo && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <span className="truncate">{t('orders.transfer')}: {orderItem.payment.transferInfo.fullName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <Button
                      onClick={() => handleFetchOrderDetails(orderItem._id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2 px-4 sm:px-6 py-2 text-xs sm:text-sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t('orders.viewDetails')}</span>
                      <span className="sm:hidden">{t('orders.view')}</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
                          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem className="text-foreground hover:bg-green-500/10 dark:hover:bg-green-500/20">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t('orders.confirmOrder')}
                        </DropdownMenuItem>
                        {/* لا أصفر! تم استبدال الأصفر أو الذهبي بالأسود فقط ودعم الداكن */}
                        <DropdownMenuItem className="text-foreground hover:bg-black/10 dark:hover:bg-black dark:hover:text-white">
                          <Clock className="w-4 h-4 mr-2 text-black dark:text-white" />
                          {t('orders.setPending')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-foreground hover:bg-red-500/10 dark:hover:bg-red-500/20">
                          <XCircle className="w-4 h-4 mr-2" />
                          {t('orders.rejectOrder')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground text-base sm:text-lg font-semibold mb-2">{t('orders.noOrdersFound')}</p>
              <p className="text-muted-foreground text-sm">{t('orders.noOrdersMatchFilters')}</p>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={openDetailsDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDetailsDialog(false);
            dispatch(resetOrderDetails());
            setSelectedOrderId(null);
          }
        }}
      >
        {orderDetails && <AdminOrderDetailsView orderDetails={orderDetails} />}
      </Dialog>
    </div>
  );
}

export default AdminOrdersView;
