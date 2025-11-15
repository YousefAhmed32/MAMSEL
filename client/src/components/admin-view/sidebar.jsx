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
import { ChartNoAxesCombined } from "lucide-react";
import { Fragment, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";

const adminSidebarMenuItems = [
  { id: "dashboard", label: "لوحة التحكم", path: "/admin/dashboard", icon: BarChart3 },
  { id: "analysis", label: "التحليلات", path: "/admin/analysis", icon: ChartLine },
  { id: "banners", label: "إدارة البنرات", path: "/admin/banners", icon: ImageIcon },
  { id: "products", label: "المنتجات", path: "/admin/products", icon: Package },
  { id: "brands", label: "العلامات التجارية", path: "/admin/brands", icon: Building2 },
  { id: "orders", label: "الطلبات", path: "/admin/orders", icon: BadgeCheck },
  { id: "users", label: "المستخدمين", path: "/admin/users", icon: Users },
  // { id: "reviews", label: "التعليقات", path: "/admin/reviews", icon: Star },
  { id: "coupon", label: "الكوبونات", path: "/admin/coupon", icon: TicketPercent },
  // { id: "settings", label: "الإعدادات", path: "/admin/settings", icon: Settings },
];

function MenuItems({ setOpen, isCollapsed = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex flex-col mt-4 sm:mt-8 space-y-2 sm:space-y-3">
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
            className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 group
              ${
                active
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 text-primary dark:text-primary shadow-[0_0_20px_rgba(210,176,101,0.2)] dark:shadow-[0_0_20px_rgba(210,176,101,0.3)]"
                  : "text-muted-foreground hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary"
              }`}
            title={isCollapsed ? menuItem.label : ""}
          >
            {/* Thin neon line indicator */}
            {active && (
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary to-primary/60 rounded-r shadow-[0_0_12px_rgba(210,176,101,0.5)]" />
            )}
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
            {!isCollapsed && <span className="truncate">{menuItem.label}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-popover dark:bg-popover border border-border text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {menuItem.label}
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Fragment>
      {/* ✅ Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 sm:w-80 bg-background/95 dark:bg-background/95 backdrop-blur-xl border-r border-border shadow-xl"
        >
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3 mt-4 text-lg font-bold text-foreground">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-2 ring-primary/20">
                  <img 
                    src="/assets/logo2.png" 
                    alt="عود الوجبة" 
                    className="w-8 h-8 object-cover rounded-full"
                  />
                </div>
                <span className="tracking-wide text-foreground dark:text-foreground">عود الوجبة Admin</span>
              </SheetTitle>
            </SheetHeader>

            <MenuItems setOpen={setOpen} />

            <div className="mt-auto border-t border-border pt-6 px-4 space-y-3">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full">
                <HelpCircle size={18} /> <span>المساعدة</span>
              </button>
              <button className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors w-full">
                <LogOut size={18} /> <span>تسجيل الخروج</span>
              </button>
              <p className="mt-6 text-xs text-muted-foreground text-center">©2025 عود الوجبة by YANYS</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ✅ Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-background/95 dark:bg-background/95 backdrop-blur-xl border-r border-border transition-all duration-300 shadow-lg ${
        isCollapsed ? 'w-20 p-3' : 'w-72 p-6'
      }`}>
        {/* Logo and Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-6 sm:mb-8`}>
          <div
            onClick={() => navigate("/admin/dashboard")}
            className={`flex items-center gap-3 cursor-pointer ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-2 ring-primary/20 flex-shrink-0">
              <img 
                src="/assets/logo2.png" 
                alt="عود الوجبة" 
                className="w-8 h-8 object-cover rounded-full"
              />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-foreground tracking-wide truncate">عود الوجبة Admin</h1>
            )}
          </div>
          
          {!isCollapsed && (
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 dark:hover:bg-primary/20 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          
          {isCollapsed && (
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 dark:hover:bg-primary/20 text-muted-foreground hover:text-foreground w-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <MenuItems isCollapsed={isCollapsed} />

        {/* Footer */}
        <div className={`mt-auto border-t border-border pt-6 text-muted-foreground text-xs ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && (
            <>
              <p className="mb-1">Version 1.0.0</p>
              <p>©2025 عود الوجبة by YANYS</p>
            </>
          )}
          {isCollapsed && (
            <p className="text-[10px]">v2.0</p>
          )}
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSidebar;
