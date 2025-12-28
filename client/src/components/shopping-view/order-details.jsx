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
  ShoppingBag,
} from "lucide-react";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  /* ================= Status Helpers ================= */

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
      case "confirmed":
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-black dark:text-white" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "on the way":
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "processing":
        return <Edit3 className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const base =
      "border rounded-xl px-3 py-1 text-xs font-medium";

    switch (status) {
      case "accepted":
      case "confirmed":
        return (
          <Badge className={`${base} bg-black text-white dark:bg-white dark:text-black`}>
            Accepted
          </Badge>
        );
      case "delivered":
        return (
          <Badge className={`${base} bg-black text-white dark:bg-white dark:text-black`}>
            Delivered
          </Badge>
        );
      case "rejected":
        return (
          <Badge className={`${base} bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400`}>
            Rejected
          </Badge>
        );
      case "processing":
        return (
          <Badge className={`${base} bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400`}>
            Processing
          </Badge>
        );
      case "on the way":
      case "shipped":
        return (
          <Badge className={`${base} bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400`}>
            On the way
          </Badge>
        );
      default:
        return (
          <Badge className={`${base} bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-white/60`}>
            Pending
          </Badge>
        );
    }
  };

  /* ================= Data ================= */

  const orderDate = orderDetails?.createdAt
    ? new Date(orderDetails.createdAt).toLocaleDateString("ar-EG")
    : "—";

  const totalAmount =
    orderDetails?.totalAfterDiscount ||
    orderDetails?.total ||
    orderDetails?.totalAmount ||
    0;

  const discountAmount =
    orderDetails?.appliedCoupon?.discountAmount || 0;

  /* ================= UI ================= */

  return (
    <DialogContent
      className="
        sm:max-w-[900px]
        rounded-2xl
        bg-white dark:bg-[#0b0b0b]
        text-gray-900 dark:text-white
        border border-gray-200 dark:border-white/10
        shadow-xl
        p-0 overflow-hidden
      "
    >
      <div className="max-h-[90vh] overflow-y-auto">
        {/* ================= Header ================= */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/5">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">
                    Order Details #{orderDetails?._id?.slice(-8)}
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/60">
                    View Order Details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(orderDetails?.orderStatus)}
              {getStatusBadge(orderDetails?.orderStatus)}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* ================= Summary ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard icon={<Calendar />} label="Order Date" value={orderDate} />
            <InfoCard
              icon={<DollarSign />}
              label="Total Amount"
              value={`${totalAmount} QR`}
              sub={discountAmount > 0 ? `Discount: ${discountAmount} QR` : null}
            />
            <InfoCard
              icon={<CreditCard />}
              label="Payment Method"
              value={
                orderDetails?.payment?.method ||
                orderDetails?.paymentMethod ||
                "—"
              }
            />
            <InfoCard
              icon={<Package />}
              label="Number of Products"
              value={
                orderDetails?.items?.length ||
                orderDetails?.cartItems?.length ||
                0
              }
            />
          </div>

          {/* ================= Products ================= */}
          <Card className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(orderDetails.items || orderDetails.cartItems || []).map(
                (item, i) => {
                  const img =
                    item.productImage ||
                    item.image ||
                    item?.productId?.image;
                  const imageUrl = img ? getImageUrl(img) : null;

                  return (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {item.title || "—"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-white/60">
                            Quantity: {item.quantity || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {item.price || 0} QR
                        </p>
                        <p className="text-sm text-gray-500 dark:text-white/60">
                          Total:{" "}
                          {(item.price || 0) *
                            (item.quantity || 0)}{" "}
                          QR
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>

          {/* ================= Shipping ================= */}
          <Card className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <InfoRow icon={<User />} label="Name" value={user?.userName} />
              <InfoRow
                icon={<Phone />}
                label="Phone"
                value={
                  orderDetails?.address?.phone ||
                  orderDetails?.addressInfo?.phone
                }
              />
              <InfoRow
                icon={<MapPin />}
                label="Address"
                value={
                  orderDetails?.address?.address ||
                  orderDetails?.addressInfo?.address
                }
              />
              {orderDetails?.address?.notes && (
                <InfoRow
                  icon={<Edit3 />}
                  label="Notes"
                  value={orderDetails.address.notes}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DialogContent>
  );
}

/* ================= Small Components ================= */

const InfoCard = ({ icon, label, value, sub }) => (
  <Card className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
    <CardContent className="p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-white/60">{label}</p>
        <p className="font-semibold">{value}</p>
        {sub && (
          <p className="text-xs text-gray-500 dark:text-white/50">
            {sub}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-white/60">
        {label}
      </p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  </div>
);

export default ShoppingOrderDetailsView;
