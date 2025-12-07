import { Outlet } from "react-router-dom";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import '@/i18n/config'; // Initialize i18n

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const { i18n } = useTranslation();
  
  // Force LTR direction for Admin Panel (always LTR regardless of language)
  useEffect(() => {
    const updateDirection = () => {
      // Always LTR for Admin Panel
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = i18n.language;
      document.documentElement.setAttribute('data-admin-panel', 'true');
      
      // Ensure LTR class
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    };
    
    // Set initial direction
    updateDirection();
    
    // Listen for language changes (but always keep LTR)
    i18n.on('languageChanged', updateDirection);
    
    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, [i18n]);
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            currentColor 2px,
            currentColor 4px
          )`,
        }}></div>
      </div>
      
      <AdminSidebar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
        <AdminHeader setOpen={setOpenSidebar} />
        <main className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 text-foreground overflow-x-hidden relative z-10">
          <div className="max-w-full animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
