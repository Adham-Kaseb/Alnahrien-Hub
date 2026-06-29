import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

function Header() {
  const { profile, isAdmin } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-8">
        {/* Welcome */}
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            أهلاً{profile?.full_name ? `، ${profile.full_name}` : ''} 👋
          </h2>
          <p className="text-xs text-slate-400">
            {isAdmin() ? 'لوحة تحكم مسؤول النظام' : 'بوابة الدعم الفني'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="الإشعارات"
          >
            <Bell size={20} />
            {/* Notification dot */}
            <span className="absolute top-2 left-2 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}

export { Header };
