import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCheck, Monitor, BookOpen, Phone, KeyRound, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  open_tickets: number;
  total_assets: number;
  total_guides: number;
  pending_renewals: number;
}

function DashboardHome() {
  const { profile, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin()) {
      supabase.rpc('get_dashboard_stats').then(({ data }) => {
        if (data) setStats(data as unknown as DashboardStats);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Quick actions for employees
  const employeeActions = [
    {
      icon: <TicketCheck size={24} />,
      title: 'بلّغ عن مشكلة',
      description: 'عندك مشكلة في جهازك أو النت؟ بلّغنا!',
      to: '/helpdesk/submit',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: <BookOpen size={24} />,
      title: 'الشروحات',
      description: 'اتعلم إزاي تحل المشاكل البسيطة بنفسك',
      to: '/knowledge',
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  // Stat cards for admin
  const adminStats = [
    {
      icon: <TicketCheck size={22} />,
      title: 'بلاغات مفتوحة',
      value: stats?.open_tickets ?? 0,
      color: 'bg-amber-50 text-amber-600',
      to: '/helpdesk/manage',
    },
    {
      icon: <Monitor size={22} />,
      title: 'إجمالي الأجهزة',
      value: stats?.total_assets ?? 0,
      color: 'bg-cyan-50 text-cyan-600',
      to: '/assets',
    },
    {
      icon: <BookOpen size={22} />,
      title: 'الشروحات',
      value: stats?.total_guides ?? 0,
      color: 'bg-indigo-50 text-indigo-600',
      to: '/knowledge',
    },
    {
      icon: <KeyRound size={22} />,
      title: 'تجديدات قريبة',
      value: stats?.pending_renewals ?? 0,
      color: 'bg-rose-50 text-rose-600',
      to: '/credentials',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          مرحباً، {profile?.full_name ?? 'مستخدم'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {isAdmin() ? 'ملخص سريع عن حالة النظام' : 'إيه اللي تحب تعمله النهارده؟'}
        </p>
      </div>

      {/* Admin Stats Grid */}
      {isAdmin() && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {adminStats.map((stat) => (
            <Card
              key={stat.title}
              hover
              className="cursor-pointer"
              onClick={() => navigate(stat.to)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions (Employee) */}
      {!isAdmin() && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {employeeActions.map((action) => (
            <Card key={action.title} hover className="cursor-pointer" onClick={() => navigate(action.to)}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center shrink-0`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Quick Navigation */}
      {isAdmin() && (
        <Card>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            الوصول السريع
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'بلاغ جديد', to: '/helpdesk/submit', icon: <TicketCheck size={18} /> },
              { label: 'إدارة البلاغات', to: '/helpdesk/manage', icon: <TicketCheck size={18} /> },
              { label: 'عهدة الأجهزة', to: '/assets', icon: <Monitor size={18} /> },
              { label: 'الباسوردات', to: '/credentials', icon: <KeyRound size={18} /> },
              { label: 'الشروحات', to: '/knowledge', icon: <BookOpen size={18} /> },
              { label: 'أرقام الطوارئ', to: '/emergency', icon: <Phone size={18} /> },
            ].map((item) => (
              <Button
                key={item.to}
                variant="outline"
                className="justify-start gap-2 h-12"
                onClick={() => navigate(item.to)}
              >
                <span className="text-indigo-500">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export { DashboardHome };
