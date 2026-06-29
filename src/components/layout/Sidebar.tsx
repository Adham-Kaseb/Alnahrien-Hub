import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  TicketCheck,
  Monitor,
  KeyRound,
  BookOpen,
  Phone,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  onClose?: () => void;
}


interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { to: '/', label: 'الرئيسية', icon: <Home size={20} /> },
  { to: '/helpdesk/submit', label: 'بلّغ عن مشكلة', icon: <TicketCheck size={20} /> },
  { to: '/helpdesk/manage', label: 'إدارة الدعم الفني', icon: <TicketCheck size={20} />, adminOnly: true },
  { to: '/assets', label: 'عهدة الأجهزة', icon: <Monitor size={20} />, adminOnly: true },
  { to: '/credentials', label: 'الاشتراكات والباسوردات', icon: <KeyRound size={20} />, adminOnly: true },
  { to: '/knowledge', label: 'الشروحات', icon: <BookOpen size={20} /> },
  { to: '/emergency', label: 'أرقام الطوارئ', icon: <Phone size={20} />, adminOnly: true },
];

function Sidebar({ onClose }: SidebarProps) {
  const { profile, isAdmin, reset } = useAuthStore();
  const navigate = useNavigate();

  const visibleItems = allNavItems.filter(
    (item) => !item.adminOnly || isAdmin()
  );

  const handleLogout = () => {
    reset();
    navigate('/login');
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col shadow-2xl border-l border-slate-800/40">
      {/* Logo & Mobile Close button */}
      <div className="p-6 pb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">Alnahrien Hub</h1>
            <p className="text-slate-500 text-xs">البوابة الإلكترونية الموحدة</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-slate-800/60" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border-r-4 border-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4">
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 border border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-900/30">
              <span className="text-white font-bold text-sm">
                {profile?.full_name?.charAt(0) ?? '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">
                {profile?.full_name ?? 'مستخدم'}
              </p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                {isAdmin() ? 'مسؤول النظام' : 'موظف'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };
