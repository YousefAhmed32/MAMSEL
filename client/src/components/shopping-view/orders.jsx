import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { Dialog } from "../ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrderByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice.js";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { orderList, orderDetails } = useSelector(
    (state) => state.shopOrder
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(id) {
    setSelectedOrderId(id);
    dispatch(getOrderDetails(id));
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrderByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails) setOpenDetailsDialog(true);
  }, [orderDetails]);

  /* =========================
     Helpers
  ========================= */

  function getStatusBadge(orderStatus) {
    const status = orderStatus || "pending";
    const normalized = String(status).toLowerCase().trim();

    let badgeClass =
      "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-white/5 dark:text-white/70 dark:border-white/10";
    let badgeText = "Pending";

    if (["accepted", "confirmed", "delivered"].includes(normalized)) {
      badgeClass =
        "bg-black text-white border border-black dark:bg-white dark:text-black dark:border-white";
      badgeText = normalized === "delivered" ? "Delivered" : "Accepted";
    } else if (normalized === "rejected") {
      badgeClass =
        "bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30";
      badgeText = "Rejected";
    } else if (["on the way", "shipped"].includes(normalized)) {
      badgeClass =
        "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30";
      badgeText = normalized === "shipped" ? "Shipped" : "On the way";
    } else if (normalized === "processing") {
      badgeClass =
        "bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30";
      badgeText = "Processing";
    }

    return { badgeClass, badgeText };
  }

  function formatDate(orderItem) {
    if (orderItem?.createdAt) {
      return new Date(orderItem.createdAt).toLocaleDateString("ar-EG");
    }
    if (orderItem?.orderDate) {
      return orderItem.orderDate.split("T")[0];
    }
    return "—";
  }

  function getTotalAmount(orderItem) {
    return (
      orderItem?.total ||
      orderItem?.totalAfterDiscount ||
      orderItem?.totalAmount ||
      0
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <>
      <Card
        className="
          rounded-2xl
          backdrop-blur-md
          bg-white dark:bg-[#0b0b0b]
          text-gray-900 dark:text-white
          shadow-lg dark:shadow-[0_0_25px_rgba(0,0,0,0.6)]
          border border-gray-200 dark:border-white/10
        "
      >
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl tracking-wide text-center sm:text-right">
            Order History
          </CardTitle>
        </CardHeader>

        <CardContent className="p-2 sm:p-6">
          {/* ================= Mobile / Tablet ================= */}
          <div className="block lg:hidden space-y-3">
            {orderList?.length > 0 ? (
              orderList.map((orderItem) => {
                const { badgeClass, badgeText } = getStatusBadge(
                  orderItem?.orderStatus
                );

                return (
                  <div
                    key={orderItem?._id}
                    className="
                      rounded-xl p-4
                      bg-gray-50 dark:bg-white/5
                      border border-gray-200 dark:border-white/10
                      hover:bg-gray-100 dark:hover:bg-white/10
                      transition-all
                    "
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between flex-wrap gap-2">
                        <span className="text-sm font-mono">
                          #{orderItem?._id?.substring(0, 8)}…
                        </span>
                        <span className="text-sm text-gray-500 dark:text-white/60">
                          {formatDate(orderItem)}
                        </span>
                      </div>

                      <Badge
                        className={`w-fit py-1 px-3 rounded-xl text-xs ${badgeClass}`}
                      >
                        {badgeText}
                      </Badge>

                      <div className="text-sm text-gray-600 dark:text-white/70">
                        Payment Method:{" "}
                        {orderItem?.payment?.method ||
                          orderItem?.paymentMethod ||
                          "—"}
                      </div>

                      <div className="flex justify-between items-end pt-3 border-t border-gray-200 dark:border-white/10">
                        <div>
                          <p className="text-lg font-semibold">
                            {getTotalAmount(orderItem)} QR
                          </p>
                          {orderItem?.appliedCoupon?.discountAmount > 0 && (
                            <p className="text-xs text-gray-500 dark:text-white/50">
                              Discount: {orderItem.appliedCoupon.discountAmount} QR
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                          className="
                            bg-black text-white
                            dark:bg-white dark:text-black
                            hover:opacity-90
                            px-4 py-2 rounded-xl
                          "
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-white/60">
                No orders found
              </p>
            )}
          </div>

          {/* ================= Desktop ================= */}
          <div className="hidden lg:block overflow-x-auto">
            <Table className="text-gray-900 dark:text-white">
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-white/10">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {orderList?.length > 0 ? (
                  orderList.map((orderItem) => {
                    const { badgeClass, badgeText } = getStatusBadge(
                      orderItem?.orderStatus
                    );

                    return (
                      <TableRow
                        key={orderItem?._id}
                        className="hover:bg-gray-100 dark:hover:bg-white/5"
                      >
                        <TableCell className="font-mono">
                          {orderItem?._id?.substring(0, 8)}…
                        </TableCell>
                        <TableCell>{formatDate(orderItem)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`py-1 px-3 rounded-xl ${badgeClass}`}
                          >
                            {badgeText}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-white/70">
                          {orderItem?.payment?.method ||
                            orderItem?.paymentMethod ||
                            "—"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {getTotalAmount(orderItem)} QR
                          {orderItem?.appliedCoupon?.discountAmount > 0 && (
                            <span className="block text-xs text-gray-500 dark:text-white/50">
                              Discount: {orderItem.appliedCoupon.discountAmount} QR
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() =>
                              handleFetchOrderDetails(orderItem?._id)
                            }
                            className="
                              bg-black text-white
                              dark:bg-white dark:text-black
                            
                              px-4 py-2 rounded-xl
                            "
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-gray-500 dark:text-white/60"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ================= Dialog ================= */}
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
        {orderDetails && (
          <ShoppingOrderDetailsView orderDetails={orderDetails} />
        )}
      </Dialog>
    </>
  );
}

export default ShoppingOrders;
