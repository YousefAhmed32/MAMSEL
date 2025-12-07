import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { getImageUrl } from "@/utils/imageUtils";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle, 
  Clock, 
  XCircle,
  Truck,
  Edit3,
  ShoppingBag
} from "lucide-react";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
      case "confirmed":
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "on the way":
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-400" />;
      case "processing":
        return <Edit3 className="w-5 h-5 text-purple-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">مقبول</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">مرفوض</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">في الانتظار</Badge>;
      case "processing":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">قيد المعالجة</Badge>;
      case "on the way":
      case "shipped":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">في الطريق</Badge>;
      case "delivered":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">تم التسليم</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">في الانتظار</Badge>;
    }
  };

  const orderDate = orderDetails?.createdAt 
    ? new Date(orderDetails.createdAt).toLocaleDateString('ar-EG')
    : orderDetails?.orderDate 
      ? (typeof orderDetails.orderDate === 'string' 
          ? orderDetails.orderDate.split("T")[0] 
          : new Date(orderDetails.orderDate).toLocaleDateString('ar-EG'))
      : 'غير محدد';

  const totalAmount = orderDetails?.totalAfterDiscount || orderDetails?.total || orderDetails?.totalAmount || 0;
  const discountAmount = orderDetails?.appliedCoupon?.discountAmount || 0;
  const totalBeforeDiscount = orderDetails?.totalBeforeDiscount || totalAmount + discountAmount;

  return (
    <DialogContent className="lg:rounded-[20px] sm:max-w-[900px] bg-[#0B0F19]/95 backdrop-blur-2xl border border-gold-500/30 shadow-[0_0_25px_rgba(210,176,101,0.15)] p-0 text-white overflow-hidden">
      <div className="max-h-[90vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="luxury-gradient p-6 border-b border-gold-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gold-950/20">
                <ShoppingBag className="w-6 h-6 text-gold-950" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white glow-text">
                  تفاصيل الطلب #{orderDetails?._id?.toString().slice(-8) || 'N/A'}
                </h2>
                <p className="text-gold-300">معلومات مفصلة عن طلبك</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(orderDetails?.orderStatus)}
              {getStatusBadge(orderDetails?.orderStatus)}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="perfume-card p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gold-950/20">
                    <Calendar className="w-5 h-5 text-gold-950" />
                  </div>
                  <div>
                    <p className="text-gold-300 text-sm">تاريخ الطلب</p>
                    <p className="text-white font-semibold">{orderDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="perfume-card p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gold-300 text-sm">المبلغ الإجمالي</p>
                    <p className="text-white font-semibold">{totalAmount} QR</p>
                    {discountAmount > 0 && (
                      <p className="text-xs text-gold-300 mt-1">
                        خصم: {discountAmount} QR
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="perfume-card p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gold-300 text-sm">طريقة الدفع</p>
                    <p className="text-white font-semibold">
                      {orderDetails?.payment?.method || orderDetails?.paymentMethod || "غير محدد"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="perfume-card p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Package className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-gold-300 text-sm">عدد المنتجات</p>
                    <p className="text-white font-semibold">
                      {orderDetails?.items?.length || orderDetails?.cartItems?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="perfume-card">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                منتجات الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {(orderDetails?.items?.length > 0 || orderDetails?.cartItems?.length > 0) ? (
                <div className="space-y-4">
                  {(orderDetails.items || orderDetails.cartItems || []).map((item, i) => {
                    const productImageSrc = item.productImage || item.image || (item.productId && typeof item.productId === 'object' ? item.productId.image : '') || '';
                    const imageUrl = productImageSrc ? getImageUrl(productImageSrc) : null;
                    const placeholderUrl = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop&crop=center";
                    
                    return (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg border border-gold-500/30 overflow-hidden bg-navy-950/50 flex items-center justify-center flex-shrink-0">
                            {imageUrl ? (
                              <img 
                                src={imageUrl}
                                alt={item.title || 'Product'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = placeholderUrl;
                                }}
                              />
                            ) : (
                              <Package className="w-8 h-8 text-pink-500 dark:text-pink-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{item.title || 'N/A'}</h4>
                            <p className="text-gold-300 text-sm">الكمية: {item.quantity || 0}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{item.price || 0} QR</p>
                          <p className="text-gold-300 text-sm">
                            المجموع: {(item.price || 0) * (item.quantity || 0)} QR
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gold-300 text-center py-8">لا توجد منتجات في هذا الطلب</p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          {discountAmount > 0 && (
            <Card className="perfume-card">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gold-950" />
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gold-300">المجموع الفرعي</span>
                    <span className="text-white font-semibold">{totalBeforeDiscount - discountAmount} QR</span>
                  </div>
                  {orderDetails?.shipping > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gold-300">الشحن</span>
                      <span className="text-white font-semibold">{orderDetails.shipping} QR</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gold-300">الخصم ({orderDetails?.appliedCoupon?.code})</span>
                      <span className="text-green-400 font-semibold">-{discountAmount} QR</span>
                    </div>
                  )}
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">المجموع الإجمالي</span>
                    <span className="text-gold-950 font-bold text-lg">{totalAmount} QR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Information */}
          <Card className="perfume-card">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-950" />
                معلومات الشحن
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gold-500" />
                    <div>
                      <p className="text-gold-300 text-sm">الاسم</p>
                      <p className="text-white font-semibold">{user?.userName || "غير محدد"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gold-500" />
                    <div>
                      <p className="text-gold-300 text-sm">رقم الهاتف</p>
                      <p className="text-white font-semibold">
                        {orderDetails?.address?.phone || orderDetails?.addressInfo?.phone || "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold-500 mt-1" />
                    <div>
                      <p className="text-gold-300 text-sm">العنوان</p>
                      <p className="text-white font-semibold">
                        {orderDetails?.address?.address || orderDetails?.addressInfo?.address || "غير محدد"}
                      </p>
                      <p className="text-gold-300 text-sm">
                        {orderDetails?.address?.city || orderDetails?.addressInfo?.city || ""} -
                        {orderDetails?.address?.pincode || orderDetails?.addressInfo?.pincode || ""}
                      </p>
                    </div>
                  </div>

                  {(orderDetails?.address?.notes || orderDetails?.addressInfo?.notes) && (
                    <div className="flex items-start gap-3">
                      <Edit3 className="w-5 h-5 text-gold-500 mt-1" />
                      <div>
                        <p className="text-gold-300 text-sm">ملاحظات</p>
                        <p className="text-white font-semibold">
                          {orderDetails?.address?.notes || orderDetails?.addressInfo?.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information (if Transfer) */}
          {orderDetails?.payment?.method === 'Transfer' && orderDetails?.payment?.transferInfo && (
            <Card className="perfume-card">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-950" />
                  معلومات التحويل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gold-300 text-sm mb-1">اسم المرسل</p>
                      <p className="text-white font-semibold">
                        {orderDetails.payment.transferInfo.fullName || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gold-300 text-sm mb-1">المبلغ المحوّل</p>
                      <p className="text-white font-semibold">
                        {orderDetails.payment.transferInfo.amountTransferred || 0} QR
                      </p>
                    </div>
                  </div>
                  
                  {orderDetails.payment.status === 'awaiting_admin_approval' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <p className="text-yellow-400 font-semibold">
                          جاري مراجعة التحويل من قبل الإدارة
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {orderDetails.payment.status === 'approved' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <p className="text-green-400 font-semibold">
                          تم الموافقة على التحويل
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {orderDetails.payment.status === 'rejected' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400 font-semibold">
                          تم رفض التحويل
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
