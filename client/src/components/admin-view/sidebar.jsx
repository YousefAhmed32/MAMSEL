import {
  BadgeCheck,
  ChartLine,
  ShoppingBasket,
  TicketPercent,
  LogOut,
  HelpCircle,
  Images,
  Users,
  Settings,
  BarChart3,
  Package,
  Star,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Fragment, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

const adminSidebarMenuItems = [
  { id: "dashboard", key: "sidebar.dashboard", path: "/admin/dashboard", icon: BarChart3 },
  // { id: "analysis", key: "sidebar.analysis", path: "/admin/analysis", icon: ChartLine },
  { id: "banners", key: "sidebar.banners", path: "/admin/banners", icon: ImageIcon },
  { id: "products", key: "sidebar.products", path: "/admin/products", icon: Package },
  { id: "brands", key: "sidebar.brands", path: "/admin/brands", icon: Building2 },
  { id: "orders", key: "sidebar.orders", path: "/admin/orders", icon: BadgeCheck },
  // { id: "users", key: "sidebar.users", path: "/admin/users", icon: Users },
  // { id: "coupon", key: "sidebar.coupon", path: "/admin/coupon", icon: TicketPercent },
];

function MenuItems({ setOpen, isCollapsed = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="flex px-[2px] flex-col mt-4 sm:mt-8 space-y-1.5 sm:space-y-2 overflow-x-hidden overflow-y-hidden">
      {adminSidebarMenuItems.map((menuItem) => {
        const Icon = menuItem.icon;
        const active = location.pathname === menuItem.path;

        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              if (setOpen) setOpen(false);
            }}
            className={`
              group relative flex items-center gap-3 px-4 py-3 
              text-sm font-medium rounded-xl cursor-pointer 
              transition-all duration-300 ease-in-out
              ${
                active
                  ? "bg-gradient-to-r from-black/10 via-black/5 to-transparent dark:from-black/30 dark:via-black/20 dark:to-transparent text-black dark:text-white shadow-lg shadow-black/10 dark:shadow-black/30 scale-[1.02]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 hover:scale-[1.01]"
              }
            `}
            title={isCollapsed ? t(menuItem.key) : ""}
          >
            {/* Active indicator - Black Glow line */}
            {active && (
              <>
                <span className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-black via-gray-700 to-black rounded-l-full shadow-[0_0_8px_rgba(0,0,0,0.4)] dark:shadow-[0_0_12px_rgba(0,0,0,0.7)]" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-black/5 to-transparent dark:from-black/10 dark:to-transparent animate-pulse" />
              </>
            )}
            
            {/* Icon with glow effect when active */}
            <div className={`relative ${active ? 'animate-pulse' : ''}`}>
              <Icon 
                className={`
                  w-5 h-5 flex-shrink-0 transition-all duration-300
                  ${active 
                    ? "text-black dark:text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]" 
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                  }
                `} 
              />
              {active && (
                <div className="absolute inset-0 w-5 h-5 bg-black/15 dark:bg-black/25 rounded-full blur-sm animate-ping" />
              )}
            </div>
            
            {!isCollapsed && (
              <span className="truncate font-medium">{t(menuItem.key)}</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap border border-gray-700 dark:border-gray-700">
                {t(menuItem.key)}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800" />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function AdminSidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <Fragment>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 sm:w-80 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-2xl p-0"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
              <SheetTitle className="flex items-center gap-3">
                <div
                  onClick={() => navigate("/admin/dashboard")}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <img 
                      src="/assets/mamsal-logo1.png" 
                      alt="MAMSEL" 
                      className="w-[140px] h-7 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 dark:bg-white/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <MenuItems setOpen={setOpen} />
            </div>

            <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4 px-4 pb-6 space-y-2">
              <button 
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 w-full group"
              >
                <HelpCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span>{t('sidebar.help')}</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 w-full group"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                <span>{t('sidebar.logout')}</span>
              </button>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-500 text-center">{t('sidebar.copyright')}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col 
        bg-white/95 dark:bg-[#0a0a0a]/95 
        backdrop-blur-xl 
        border-r border-gray-200 dark:border-gray-800 
        shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20 px-3' : 'w-72 px-6'}
      `}>
        {/* Logo and Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'} mb-8 pt-6`}>
          <div
            onClick={() => navigate("/admin/dashboard")}
            className={`flex items-center gap-3 cursor-pointer group ${isCollapsed ? 'w-full justify-center' : ''}`}
          >
            <div className="relative">
              <img 
                src="/assets/mamsal-logo1.png" 
                alt="MAMSEL" 
                className={`object-cover transition-all duration-300 group-hover:scale-105 ${isCollapsed ? 'w-12 h-12 rounded-full' : 'w-[140px] h-7'}`}
              />
              <div className="absolute inset-0 bg-black/10 dark:bg-white/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
          
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-black/10 dark:hover:bg-black/20 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-110"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <MenuItems isCollapsed={isCollapsed} />
        </div>

        {/* Logout Button */}
        <div className={`mt-auto border-t border-gray-200 dark:border-gray-800 pt-4 pb-6 ${isCollapsed ? 'px-0' : 'px-2'}`}>
          <button
            onClick={handleLogout}
            className={`
              group flex items-center gap-3 px-4 py-2.5 
              text-sm font-medium rounded-xl 
              cursor-pointer transition-all duration-300 
              w-full
              text-red-600 dark:text-red-400 
              hover:text-red-700 dark:hover:text-red-300 
              hover:bg-red-50 dark:hover:bg-red-900/20
              hover:scale-[1.02]
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? t('sidebar.logout') : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="truncate">{t('sidebar.logout')}</span>}
          </button>
        </div>

        {/* Footer */}
        <div className={`border-t border-gray-200 dark:border-gray-800 pt-4 pb-6 text-gray-500 dark:text-gray-500 text-xs ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && (
            <>
              <p className="mb-1 font-medium">{t('sidebar.version')} 2.0.0</p>
              <p>{t('sidebar.copyright')}</p>
            </>
          )}
          {isCollapsed && (
            <p className="text-[10px] font-medium">v2.0</p>
          )}
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSidebar;
