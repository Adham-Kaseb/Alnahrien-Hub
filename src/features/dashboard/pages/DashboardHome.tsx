import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCheck, Monitor, BookOpen, Phone, KeyRound, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
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
      icon: <TicketCheck size={28} />,
      title: 'بلّغ عن مشكلة جديدة',
      description: 'تواجه مشكلة في جهازك أو شبكة النت؟ سجل بلاغك لنقوم بحله فوراً.',
      to: '/helpdesk/submit',
      color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
      btnText: 'تقديم بلاغ',
    },
    {
      icon: <BookOpen size={28} />,
      title: 'دليل الشروحات المساعدة',
      description: 'تعلم كيفية إعداد حساباتك وحل المشاكل البسيطة بشكل ذاتي وسريع.',
      to: '/knowledge',
      color: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
      btnText: 'تصفح الأدلة',
    },
  ];

  // Stat cards for admin
  const adminStats = [
    {
      icon: <TicketCheck size={24} />,
      title: 'بلاغات مفتوحة',
      value: stats?.open_tickets ?? 0,
      color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      borderColor: 'border-b-amber-500',
      to: '/helpdesk/manage',
    },
    {
      icon: <Monitor size={24} />,
      title: 'عهدة الأجهزة',
      value: stats?.total_assets ?? 0,
      color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
      borderColor: 'border-b-cyan-500',
      to: '/assets',
    },
    {
      icon: <BookOpen size={24} />,
      title: 'الشروحات الفنية',
      value: stats?.total_guides ?? 0,
      color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
      borderColor: 'border-b-indigo-500',
      to: '/knowledge',
    },
    {
      icon: <KeyRound size={24} />,
      title: 'تجديدات قريبة',
      value: stats?.pending_renewals ?? 0,
      color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
      borderColor: 'border-b-rose-500',
      to: '/credentials',
    },
  ];

  const quickNavs = [
    { label: 'بلاغ جديد', to: '/helpdesk/submit', icon: <TicketCheck size={20} />, bg: 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300' },
    { label: 'إدارة البلاغات', to: '/helpdesk/manage', icon: <TicketCheck size={20} />, bg: 'bg-amber-50/50 border-amber-100 hover:border-amber-300' },
    { label: 'عهدة الأجهزة', to: '/assets', icon: <Monitor size={20} />, bg: 'bg-cyan-50/50 border-cyan-100 hover:border-cyan-300' },
    { label: 'الباسوردات والاشتراكات', to: '/credentials', icon: <KeyRound size={20} />, bg: 'bg-violet-50/50 border-violet-100 hover:border-violet-300' },
    { label: 'دليل الشروحات', to: '/knowledge', icon: <BookOpen size={20} />, bg: 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300' },
    { label: 'أرقام الطوارئ', to: '/emergency', icon: <Phone size={20} />, bg: 'bg-rose-50/50 border-rose-100 hover:border-rose-300' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Panel */}
      <div className="relative overflow-hidden bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
              {isAdmin() ? 'نظام الإدارة الموحد' : 'بوابة تكنولوجيا المعلومات'}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              مرحباً بك، {profile?.full_name ?? 'مستخدم'} 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              {isAdmin()
                ? 'تابع حالة تذاكر الدعم الفني، وراجع الأجهزة الموزعة في العهدة والاشتراكات الفعالة للشركة.'
                : 'بوابة الدعم الفني الخاصة بك. سجل بلاغك لمتابعته مع مسؤول التقنية، أو ابحث في شروحات المساعدة الذاتية.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      {isAdmin() && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat) => (
            <div
              key={stat.title}
              onClick={() => navigate(stat.to)}
              className={`bg-white p-6 rounded-3xl border border-slate-200/80 border-b-4 ${stat.borderColor} shadow-soft hover:-translate-y-1.5 hover:shadow-medium transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <h2 className="text-4xl font-black text-slate-800 mt-1">
                  {loading ? '...' : stat.value}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions (Employee) */}
      {!isAdmin() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employeeActions.map((action) => (
            <div
              key={action.title}
              onClick={() => navigate(action.to)}
              className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-56"
            >
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shrink-0`}>
                  {action.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">{action.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{action.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 self-start group">
                {action.btnText}
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Quick Navigation */}
      {isAdmin() && (
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-800">الوصول السريع للمفاتيح</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickNavs.map((item) => (
              <div
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${item.bg} text-slate-700 font-medium hover:shadow-soft transition-all duration-200 cursor-pointer`}
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs text-indigo-500">
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export { DashboardHome };

