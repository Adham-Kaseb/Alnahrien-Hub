import { Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const { profile, isAdmin } = useAuthStore();

  return (
    <header className="h-20 border-b border-slate-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-40 shadow-xs">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Breadcrumbs Navigation (Right side in RTL) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all border border-slate-200/60 cursor-pointer ml-1.5"
            title="القائمة"
          >
            <Menu size={20} />
          </button>
          <span className="text-slate-600 text-sm font-bold">
            لوحة التحكم الرئيسية
          </span>
        </div>

        {/* User Profile & Actions Widget (Left side in RTL) */}
        <div className="flex items-center gap-5">
          {/* Notification Button */}
          <button
            className="relative p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-100 hover:scale-105 transition-all border border-slate-200/60 cursor-pointer"
            title="الإشعارات"
          >
            <Bell size={19} />
            {/* Pulsing indicator */}
            <span className="absolute top-2 left-2 w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* User Info Avatar */}
          <div className="flex items-center gap-3.5">
            <div className="text-right hidden md:block">
              <p className="text-sm font-extrabold text-slate-800 leading-tight">
                {profile?.full_name ?? "مستخدم"}
              </p>
              <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
                {isAdmin() ? "مسؤول النظام" : "موظف"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo-600/15 border border-indigo-400/20 hover:scale-105 transition-transform duration-200 cursor-pointer">
              {profile?.full_name?.charAt(0) ?? "?"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export { Header };
