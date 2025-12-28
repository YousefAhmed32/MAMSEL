import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, DollarSign, Package, Clock, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import axios from 'axios';

// Mock real-time order notifications (fallback)
const mockOrderNotifications = [
  {
    id: 1,
    type: 'new_order',
    title: 'طلب جديد',
    message: 'عميل جديد: أحمد محمد - طلب بقيمة $250',
    timestamp: new Date().toISOString(),
    isRead: false,
    orderId: 'ORD-001',
    customerName: 'أحمد محمد',
    customerEmail: 'ahmed@example.com',
    amount: 250,
    products: [
      { name: 'شانيل رقم 5', quantity: 1, price: 150 },
      { name: 'ديور سوفاج', quantity: 1, price: 100 }
    ],
    shippingAddress: 'القاهرة، مصر',
    paymentMethod: 'PayPal'
  },
  {
    id: 2,
    type: 'payment_received',
    title: 'دفع مستلم',
    message: 'تم استلام دفعة بقيمة $180 من سارة أحمد',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    orderId: 'ORD-002',
    customerName: 'سارة أحمد',
    amount: 180,
    paymentMethod: 'Credit Card'
  },
  {
    id: 3,
    type: 'order_shipped',
    title: 'تم شحن الطلب',
    message: 'تم شحن طلب عمر حسن - رقم التتبع: TRK-789',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isRead: true,
    orderId: 'ORD-003',
    customerName: 'عمر حسن',
    trackingNumber: 'TRK-789'
  }
];

function OrderNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const socketRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch pending orders from API
  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/orders-new?status=pending`,
        { withCredentials: true }
      );
      
      if (response.data.success && response.data.data) {
        const orders = response.data.data;
        const existingNotificationIds = new Set(
          JSON.parse(localStorage.getItem('orderNotifications') || '[]').map(n => n.orderId)
        );
        
        const newNotifications = orders
          .filter(order => !existingNotificationIds.has(order._id))
          .map(order => ({
            id: Date.now() + Math.random(),
            type: 'new_order',
            title: 'طلب جديد',
            message: `طلب جديد #${order.orderNumber || order._id.slice(-6)} - ${order.payment?.method || 'غير محدد'} - ${order.total} QR`,
            timestamp: new Date(order.createdAt || Date.now()).toISOString(),
            isRead: false,
            orderId: order._id,
            orderNumber: order.orderNumber,
            customerName: order.userName || order.userId?.name || 'مستخدم',
            amount: order.total,
            totalBeforeDiscount: order.totalBeforeDiscount,
            subtotal: order.subtotal,
            shipping: order.shipping,
            discount: order.discount,
            paymentMethod: order.payment?.method || order.paymentMethod,
            orderStatus: order.orderStatus,
            paymentStatus: order.payment?.status,
            itemsCount: order.items?.length || 0,
            items: order.items || [],
            address: order.address
          }));
        
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 50));
        }
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user?.role === 'admin') {
      const savedNotifications = localStorage.getItem('orderNotifications');
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed);
        } catch (error) {
          console.error('Error loading notifications from localStorage:', error);
        }
      }
      
      // Fetch pending orders from API
      fetchPendingOrders();
    }
  }, [user]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user?.role === 'admin' && notifications.length >= 0) {
      localStorage.setItem('orderNotifications', JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Initialize Socket.io connection for admin users
  useEffect(() => {
    if (user?.role === 'admin') {
      // Connect to Socket.io server
      socketRef.current = io(import.meta.env.VITE_API_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Connected to Socket.io server');
        // Join admin room
        socketRef.current.emit('joinAdminRoom', { userId: user.id });
      });

      // Listen for new order notifications
      socketRef.current.on('newOrder', (orderData) => {
        console.log('📢 New order notification received:', orderData);
        
        const newNotification = {
          id: Date.now(),
          type: 'new_order',
          title: 'طلب جديد',
          message: orderData.message || `طلب جديد #${orderData.orderNumber} - ${orderData.paymentMethod} - ${orderData.total} QR`,
          timestamp: new Date(orderData.createdAt || Date.now()).toISOString(),
          isRead: false,
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          customerName: orderData.userName || 'مستخدم',
          amount: orderData.total,
          totalBeforeDiscount: orderData.totalBeforeDiscount,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          discount: orderData.discount,
          paymentMethod: orderData.paymentMethod,
          orderStatus: orderData.orderStatus,
          paymentStatus: orderData.paymentStatus,
          itemsCount: orderData.itemsCount || 0,
          items: orderData.items || [],
          address: orderData.address
        };

        setNotifications(prev => {
          const updated = [newNotification, ...prev.filter(n => n.orderId !== orderData.orderId)];
          return updated.slice(0, 50); // Keep only 50 notifications
        });
        
        // Show toast notification
        toast({
          title: "🛒 طلب جديد!",
          description: `طلب #${orderData.orderNumber} من ${orderData.userName} - ${orderData.total} QR`,
          variant: "default",
        });
      });

      // Listen for order confirmation notifications
      socketRef.current.on('orderConfirmed', (orderData) => {
        console.log('✅ Order confirmation notification received:', orderData);
        
        const newNotification = {
          id: Date.now(),
          type: 'order_confirmed',
          title: 'تم تأكيد الطلب',
          message: orderData.message || `تم تأكيد الطلب #${orderData.orderNumber} - ${orderData.userName} - ${orderData.total} QR`,
          timestamp: new Date(orderData.confirmedAt || Date.now()).toISOString(),
          isRead: false,
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          customerName: orderData.userName || 'مستخدم',
          amount: orderData.total,
          totalBeforeDiscount: orderData.totalBeforeDiscount,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          discount: orderData.discount,
          paymentMethod: orderData.paymentMethod,
          orderStatus: orderData.orderStatus,
          paymentStatus: orderData.paymentStatus,
          itemsCount: orderData.itemsCount || 0,
          items: orderData.items || [],
          address: orderData.address
        };

        setNotifications(prev => {
          const updated = [newNotification, ...prev.filter(n => n.orderId !== orderData.orderId)];
          return updated.slice(0, 50); // Keep only 50 notifications
        });
        
        // Show toast notification
        toast({
          title: "✅ تم تأكيد الطلب!",
          description: `طلب #${orderData.orderNumber} من ${orderData.userName} - ${orderData.total} QR`,
          variant: "default",
        });
      });

      // Listen for order updates
      socketRef.current.on('orderUpdate', (updateData) => {
        console.log('📢 Order update received:', updateData);
        // Update notification if order exists
        setNotifications(prev => prev.map(notif => 
          notif.orderId === updateData.orderId 
            ? { ...notif, orderStatus: updateData.orderStatus }
            : notif
        ));
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.io server');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, toast]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, isRead: true })
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Fetch order details and open dialog
  const handleViewOrder = async (notification) => {
    setIsLoadingOrderDetails(true);
    setOrderDetailsDialogOpen(true);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/orders-new/${notification.orderId}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        // Mark notification as read
        markAsRead(notification.id);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في جلب تفاصيل الطلب",
          variant: "destructive",
        });
        setOrderDetailsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب تفاصيل الطلب",
        variant: "destructive",
      });
      setOrderDetailsDialogOpen(false);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  // Approve order
  const handleApproveOrder = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/orders-new/${selectedOrder._id}/approve`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast({
          title: "✅ تمت الموافقة",
          description: "تمت الموافقة على الطلب بنجاح",
          variant: "default",
        });
        
        // Remove notification if approved
        setNotifications(prev => prev.filter(notif => notif.orderId !== selectedOrder._id));
        
        setOrderDetailsDialogOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في الموافقة على الطلب",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject order
  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    
    if (!rejectNote.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال سبب الرفض",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/orders-new/${selectedOrder._id}/reject`,
        { adminNote: rejectNote },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast({
          title: "❌ تم الرفض",
          description: "تم رفض الطلب بنجاح",
          variant: "default",
        });
        
        // Remove notification if rejected
        setNotifications(prev => prev.filter(notif => notif.orderId !== selectedOrder._id));
        
        setOrderDetailsDialogOpen(false);
        setSelectedOrder(null);
        setRejectNote('');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في رفض الطلب",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ALL GOLD/YELLOW CLASSES REPLACED WITH BLACK/GRAY
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'order_confirmed':
        return <CheckCircle className="w-5 h-5 text-black dark:text-gray-100" />;
      case 'payment_received':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'order_shipped':
        return <Package className="w-5 h-5 text-pink-500 dark:text-pink-400" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'border-l-green-500 bg-green-500/5';
      case 'order_confirmed':
        return 'border-l-black dark:border-l-gray-100 bg-black/5 dark:bg-gray-100/5';
      case 'payment_received':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'order_shipped':
        return 'border-l-purple-500 bg-purple-500/5';
      default:
        return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return time.toLocaleDateString('ar-SA');
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-black dark:text-gray-100 hover:text-white hover:bg-black/20 dark:hover:bg-gray-900/20"
      >
        <ShoppingCart className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 dark:bg-navy-950/95 bg-white/90 backdrop-blur-xl border elegant-border rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b elegant-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black dark:text-gray-100">إشعارات الطلبات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-black dark:text-gray-100 hover:text-white text-xs"
                  >
                    تعيين الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-black dark:text-gray-100 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-navy-950/50 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-black dark:text-gray-100">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-black dark:bg-gray-100 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-black dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>
                      
                      {/* Order Details */}
                      {(notification.type === 'new_order' || notification.type === 'order_confirmed') && (
                        <div className="bg-navy-950/30 rounded-lg p-3 mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-black dark:text-gray-100" />
                            <span className="text-xs text-black dark:text-gray-100 font-semibold">{notification.customerName}</span>
                          </div>
                          
                          {/* Order Items */}
                          {notification.items && notification.items.length > 0 && (
                            <div className="mb-2 space-y-1">
                              <div className="text-xs font-semibold text-black dark:text-gray-100 mb-1">المنتجات:</div>
                              {notification.items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs bg-navy-950/40 rounded px-2 py-1">
                                  <span className="text-black dark:text-gray-100 truncate flex-1">{item.title}</span>
                                  <span className="text-black dark:text-gray-100 ml-2">×{item.quantity}</span>
                                  <span className="text-black dark:text-gray-100 ml-2">{item.total} QR</span>
                                </div>
                              ))}
                              {notification.items.length > 3 && (
                                <div className="text-xs text-gray-400 text-center">
                                  +{notification.items.length - 3} منتج آخر
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="space-y-1 text-xs border-t border-black/20 dark:border-gray-100/20 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-black dark:text-gray-100">طريقة الدفع:</span>
                              <span className="text-black dark:text-gray-100">{notification.paymentMethod || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-black dark:text-gray-100">عدد المنتجات:</span>
                              <span className="text-black dark:text-gray-100">{notification.itemsCount || 0}</span>
                            </div>
                            {notification.subtotal && (
                              <div className="flex justify-between">
                                <span className="text-black dark:text-gray-100">المجموع الفرعي:</span>
                                <span className="text-black dark:text-gray-100">{notification.subtotal} QR</span>
                              </div>
                            )}
                            {notification.shipping !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-black dark:text-gray-100">الشحن:</span>
                                <span className="text-black dark:text-gray-100">{notification.shipping} QR</span>
                              </div>
                            )}
                            {notification.discount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-black dark:text-gray-100">الخصم:</span>
                                <span className="text-green-400">-{notification.discount} QR</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-black dark:text-gray-100">حالة الطلب:</span>
                              <span className="text-black dark:text-gray-100">{notification.orderStatus || 'pending'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/20 dark:border-gray-100/20">
                            <span className="text-xs text-black dark:text-gray-100 font-semibold">المجموع الكلي:</span>
                            <span className="text-sm font-bold text-black dark:text-gray-100">{notification.amount} QR</span>
                          </div>
                          <Button
                            // onClick={() => handleViewOrder(notification)}
                            onClick={() => navigate(`/admin/orders`)}
                            className="w-full mt-2 bg-black hover:bg-gray-800 text-white text-xs py-1"
                          >
                            عرض الطلب
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-black dark:text-gray-100 hover:text-white p-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-400 hover:text-red-300 p-1"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-black dark:text-gray-100 mx-auto mb-4" />
                <p className="text-black dark:text-gray-100">لا توجد إشعارات</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-gray-100">
              تفاصيل الطلب #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
            </DialogTitle>
            <DialogDescription className="text-black dark:text-gray-300">
              {selectedOrder?.userName || 'مستخدم'}
            </DialogDescription>
          </DialogHeader>

          {isLoadingOrderDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-gray-100"></div>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-4">
              {/* Order Status */}
              <div className="bg-navy-950/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-black dark:text-gray-100">حالة الطلب:</span>
                  <Badge className={`${
                    selectedOrder.orderStatus === 'pending' ? 'bg-yellow-500' :
                    selectedOrder.orderStatus === 'processing' ? 'bg-blue-500' :
                    selectedOrder.orderStatus === 'cancelled' ? 'bg-red-500' :
                    'bg-green-500'
                  } text-white`}>
                    {selectedOrder.orderStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-black dark:text-gray-100">حالة الدفع:</span>
                  <Badge className={`${
                    selectedOrder.payment?.status === 'approved' ? 'bg-green-500' :
                    selectedOrder.payment?.status === 'rejected' ? 'bg-red-500' :
                    'bg-yellow-500'
                  } text-white`}>
                    {selectedOrder.payment?.status || 'pending'}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-navy-950/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-black dark:text-gray-100 mb-3">المنتجات:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-navy-950/40 rounded p-2">
                        {item.productImage && (
                          <img 
                            src={item.productImage} 
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black dark:text-gray-100">{item.title}</p>
                          <p className="text-xs text-gray-400">الكمية: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-black dark:text-gray-100">
                          {item.total} QR
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-navy-950/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-black dark:text-gray-100 mb-2">ملخص الطلب:</h4>
                {selectedOrder.subtotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black dark:text-gray-100">المجموع الفرعي:</span>
                    <span className="text-black dark:text-gray-100">{selectedOrder.subtotal} QR</span>
                  </div>
                )}
                {selectedOrder.shipping !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black dark:text-gray-100">الشحن:</span>
                    <span className="text-black dark:text-gray-100">{selectedOrder.shipping} QR</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black dark:text-gray-100">الخصم:</span>
                    <span className="text-green-400">-{selectedOrder.discount} QR</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-black/20 dark:border-gray-100/20">
                  <span className="text-black dark:text-gray-100">المجموع الكلي:</span>
                  <span className="text-black dark:text-gray-100">{selectedOrder.total} QR</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-navy-950/30 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-black dark:text-gray-100">طريقة الدفع:</span>
                  <span className="text-sm text-black dark:text-gray-100">
                    {selectedOrder.payment?.method || selectedOrder.paymentMethod || 'غير محدد'}
                  </span>
                </div>
              </div>

              {/* Address */}
              {selectedOrder.address && (
                <div className="bg-navy-950/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-black dark:text-gray-100 mb-2">عنوان الشحن:</h4>
                  <p className="text-sm text-black dark:text-gray-300">
                    {typeof selectedOrder.address === 'string' 
                      ? selectedOrder.address 
                      : `${selectedOrder.address.street || ''}, ${selectedOrder.address.city || ''}, ${selectedOrder.address.country || ''}`
                    }
                  </p>
                </div>
              )}

              {/* Payment Proof */}
              {selectedOrder.payment?.proofImage?.url && (
                <div className="bg-navy-950/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-black dark:text-gray-100 mb-2">إثبات الدفع:</h4>
                  <img 
                    src={selectedOrder.payment.proofImage.url} 
                    alt="Payment proof"
                    className="w-full max-w-md rounded-lg"
                  />
                </div>
              )}

              {/* Reject Note Input */}
              {(selectedOrder.orderStatus === 'pending' || selectedOrder.payment?.status === 'awaiting_admin_approval') && (
                <div className="bg-navy-950/30 rounded-lg p-4">
                  <label className="text-sm font-semibold text-black dark:text-gray-100 mb-2 block">
                    ملاحظة الرفض (مطلوبة عند الرفض):
                  </label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="أدخل سبب الرفض..."
                    className="w-full p-2 border border-black/20 dark:border-gray-100/20 rounded bg-white dark:bg-navy-950 text-black dark:text-gray-100 min-h-[80px]"
                  />
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="flex gap-2">
            {(selectedOrder?.orderStatus === 'pending' || selectedOrder?.payment?.status === 'awaiting_admin_approval') && (
              <>
                <Button
                  onClick={handleRejectOrder}
                  disabled={isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isProcessing ? 'جاري المعالجة...' : 'رفض الطلب'}
                </Button>
                <Button
                  onClick={handleApproveOrder}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isProcessing ? 'جاري المعالجة...' : 'موافقة على الطلب'}
                </Button>
              </>
            )}
            <Button
              onClick={() => {
                setOrderDetailsDialogOpen(false);
                setSelectedOrder(null);
                setRejectNote('');
              }}
              variant="outline"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderNotifications;
