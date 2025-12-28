import { useState, useEffect } from 'react';
import { Bell, X, ShoppingCart, User, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

// Mock notifications data - replace with real API calls
const mockNotifications = [
  // ... نفس البيانات السابقة (لا يوجد سبب لتغيير البيانات الوهمية)
];

function NotificationSystem() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      case 'low_stock':
        return <Package className="w-5 h-5 text-pink-500 dark:text-pink-400" />;
      case 'new_review':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // الأسود بدرجاته بدلا من الذهبي/الأصفر (وتغيير الأصفر في التنبيهات المنخفضة للمخزون)
  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'border-l-green-500 bg-green-500/5';
      case 'payment_received':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'low_stock':
        // كان أصفر، خلي الرمادي داكن أو أسود مخفف
        return 'border-l-gray-800 dark:border-l-gray-200 bg-gray-200/10 dark:bg-gray-800/10';
      case 'new_review':
        return 'border-l-purple-500 bg-purple-500/5';
      default:
        return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 dark:bg-neutral-900/95 bg-white/90 backdrop-blur-xl border elegant-border rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b elegant-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black dark:text-white">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-200 text-xs"
                  >
                    تعيين الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
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
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-black/10 dark:hover:bg-white/5 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-black dark:text-white">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
                        )}
                      </div>

                      <p className="text-sm text-gray-800 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700 dark:text-gray-400">
                          {notification.timestamp}
                        </span>

                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-200 p-1"
                            >
                              تعيين كمقروء
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-400 hover:text-red-300 p-1"
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
                <p className="text-black dark:text-white">لا توجد إشعارات</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationSystem;
