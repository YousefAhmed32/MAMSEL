import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, DollarSign, Package, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

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
  const socketRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();

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
          paymentMethod: orderData.paymentMethod,
          orderStatus: orderData.orderStatus,
          paymentStatus: orderData.paymentStatus,
          itemsCount: orderData.itemsCount || 0
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only 20 notifications
        
        // Show toast notification
        toast({
          title: "🛒 طلب جديد!",
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'payment_received':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'order_shipped':
        return <Package className="w-5 h-5 text-purple-500" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'border-l-green-500 bg-green-500/5';
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
        className="relative text-gold-300 hover:text-white hover:bg-gold-950/20"
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
        <div className="absolute right-0 top-12 w-96 bg-navy-950/95 backdrop-blur-xl border elegant-border rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b elegant-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">إشعارات الطلبات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-gold-300 hover:text-white text-xs"
                  >
                    تعيين الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-gold-300 hover:text-white"
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
                        <h4 className="text-sm font-semibold text-white">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-gold-950 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gold-300 mb-2">
                        {notification.message}
                      </p>
                      
                      {/* Order Details */}
                      {notification.type === 'new_order' && (
                        <div className="bg-navy-950/30 rounded-lg p-3 mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gold-950" />
                            <span className="text-xs text-gold-300">{notification.customerName}</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gold-300">طريقة الدفع:</span>
                              <span className="text-gold-950">{notification.paymentMethod || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gold-300">عدد المنتجات:</span>
                              <span className="text-gold-950">{notification.itemsCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gold-300">حالة الطلب:</span>
                              <span className="text-gold-950">{notification.orderStatus || 'pending'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gold-950/20">
                            <span className="text-xs text-gold-300">المجموع:</span>
                            <span className="text-sm font-bold text-gold-950">{notification.amount} QR</span>
                          </div>
                          <Button
                            onClick={() => {
                              navigate(`/admin/orders`);
                              setIsOpen(false);
                            }}
                            className="w-full mt-2 bg-gold-950 hover:bg-gold-800 text-navy-950 text-xs py-1"
                          >
                            عرض الطلب
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gold-400" />
                          <span className="text-xs text-gold-400">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-gold-300 hover:text-white p-1"
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
                <ShoppingCart className="w-12 h-12 text-gold-300 mx-auto mb-4" />
                <p className="text-gold-300">لا توجد إشعارات</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderNotifications;
