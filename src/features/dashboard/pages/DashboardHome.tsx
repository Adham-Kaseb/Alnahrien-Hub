import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCheck, Monitor, BookOpen, Phone, KeyRound, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTicketNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Attendance states
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkingAttendance, setCheckingAttendance] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (isAdmin()) {
          const statsRes = await (supabase.rpc('get_dashboard_stats') as any);
          if (statsRes.data) setStats(statsRes.data as unknown as DashboardStats);

          const ticketsRes = await supabase.from('tickets').select('*').order('created_at', { ascending: false }).limit(3);
          if (ticketsRes.data) setRecentTickets(ticketsRes.data);
        } else {
          if (profile) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const { data } = await (supabase.from('attendance') as any)
              .select('*')
              .eq('employee_id', profile.id)
              .gte('check_in_time', todayStart.toISOString())
              .lte('check_in_time', todayEnd.toISOString());

            const attendanceLogs = data as any[];
            if (attendanceLogs && attendanceLogs.length > 0) {
              setCheckedIn(true);
              setCheckInTime(new Date(attendanceLogs[0].check_in_time).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              }));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAttendance(false);
        setLoading(false);
      }
    }

    loadData();
  }, [isAdmin, profile]);

  const handleCheckIn = async () => {
    if (!profile) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Check-in late threshold: 9:00 AM
    const isLate = hours > 9 || (hours === 9 && minutes > 0);
    const status = isLate ? 'late' : 'on_time';

    const { error } = await (supabase.from('attendance') as any).insert({
      employee_id: profile.id,
      check_in_time: now.toISOString(),
      status,
    });

    if (error) {
      toast.error('حصل مشكلة أثناء تسجيل الحضور. جرب تاني.');
    } else {
      setCheckedIn(true);
      setCheckInTime(now.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }));
      toast.success(isLate ? 'تم تسجيل حضورك بنجاح (تأخير) ⏰' : 'تم تسجيل حضورك في الموعد! منضبط 🟢');
    }
  };

  // Employee Quick Actions
  const employeeActions = [
    {
      icon: <TicketCheck size={28} />,
      title: 'بلّغ عن مشكلة جديدة',
      description: 'تواجه مشكلة في جهازك أو شبكة النت؟ سجل بلاغك لنقوم بحله فوراً.',
      to: '/helpdesk/submit',
      color: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
      btnText: 'تقديم بلاغ',
    },
    {
      icon: <BookOpen size={28} />,
      title: 'دليل الشروحات المساعدة',
      description: 'تعلم كيفية إعداد حساباتك وحل المشاكل البسيطة بشكل ذاتي وسريع.',
      to: '/knowledge',
      color: 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20',
      btnText: 'تصفح الأدلة',
    },
  ];

  // Admin Stats cards configuration
  const adminStats = [
    {
      icon: <TicketCheck size={22} />,
      title: 'بلاغات مفتوحة',
      value: stats?.open_tickets ?? 0,
      textColor: 'text-amber-600',
      to: '/helpdesk/manage',
    },
    {
      icon: <Monitor size={22} />,
      title: 'عهدة الأجهزة',
      value: stats?.total_assets ?? 0,
      textColor: 'text-cyan-600',
      to: '/assets',
    },
    {
      icon: <BookOpen size={22} />,
      title: 'الشروحات الفنية',
      value: stats?.total_guides ?? 0,
      textColor: 'text-indigo-600',
      to: '/knowledge',
    },
    {
      icon: <KeyRound size={22} />,
      title: 'تجديدات قريبة',
      value: stats?.pending_renewals ?? 0,
      textColor: 'text-rose-600',
      to: '/credentials',
    },
  ];

  const quickNavs = [
    { label: 'بلاغ جديد', to: '/helpdesk/submit', icon: <TicketCheck size={18} />, bg: 'bg-indigo-50/40 border-indigo-100/50 hover:bg-indigo-50 text-indigo-700' },
    { label: 'إدارة البلاغات', to: '/helpdesk/manage', icon: <TicketCheck size={18} />, bg: 'bg-amber-50/40 border-amber-100/50 hover:bg-amber-50 text-amber-700' },
    { label: 'عهدة الأجهزة', to: '/assets', icon: <Monitor size={18} />, bg: 'bg-cyan-50/40 border-cyan-100/50 hover:bg-cyan-50 text-cyan-700' },
    { label: 'خزنة الباسوردات', to: '/credentials', icon: <KeyRound size={18} />, bg: 'bg-violet-50/40 border-violet-100/50 hover:bg-violet-50 text-violet-700' },
    { label: 'دليل الشروحات', to: '/knowledge', icon: <BookOpen size={18} />, bg: 'bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50 text-emerald-700' },
    { label: 'أرقام الطوارئ', to: '/emergency', icon: <Phone size={18} />, bg: 'bg-rose-50/40 border-rose-100/50 hover:bg-rose-50 text-rose-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Panel */}
      <div className="relative overflow-hidden bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-950/10 border border-slate-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
              {isAdmin() ? 'نظام الإدارة الموحد' : 'بوابة تكنولوجيا المعلومات'}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              مرحباً بك، {profile?.full_name ?? 'مستخدم'} 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              {isAdmin()
                ? 'تابع حالة تذاكر الدعم الفني، وراجع الأجهزة الموزعة في العهدة والاشتراكات الفعالة للشركة.'
                : 'بوابة الدعم الفني الخاصة بك. سجل بلاغك لمتابعته مع مسؤول التقنية، أو ابحث في شروحات المساعدة الذاتية.'
              }
            </p>
          </div>

          {/* Live Status Widget */}
          <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-200">الأنظمة التقنية مستقرة</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">جميع الخوادم تعمل بشكل سليم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Attendance Check-In Widget */}
      {!isAdmin() && (
        <Card className="p-6 overflow-hidden relative bg-linear-to-br from-white to-indigo-50/20 border border-slate-200/50 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 text-right">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase">
                سجل الحضور والإنصراف
              </span>
              <h2 className="text-xl font-extrabold text-slate-800 mt-1">
                {checkedIn ? 'حالتك اليوم: حاضر نشط 🟢' : 'لم تقم بتسجيل الحضور اليوم'}
              </h2>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mt-1">
                {checkedIn 
                  ? `تم تسجيل وقت الحضور الخاص بك اليوم بنجاح في تمام الساعة ${checkInTime}. طاب يومك وعملك!`
                  : 'يرجى تسجيل حضورك اليوم عند بدء تشغيل جهازك لبدء نوبة العمل الرسمية.'
                }
              </p>
            </div>
            
            <div className="shrink-0">
              {checkingAttendance ? (
                <div className="h-12 w-36 bg-slate-100 animate-pulse rounded-xl" />
              ) : checkedIn ? (
                <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  حاضر في العمل
                </div>
              ) : (
                <button
                  onClick={handleCheckIn}
                  className="px-6 h-12 bg-linear-to-r from-indigo-600 to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  تسجيل الحضور الآن 📍
                </button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Admin Stats Grid (Clean minimalist layout) */}
      {isAdmin() && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat) => (
            <div
              key={stat.title}
              onClick={() => navigate(stat.to)}
              className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400">{stat.title}</span>
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors duration-300">
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-4">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {loading ? '...' : stat.value}
                </h2>
                <span className={`text-[10px] font-bold ${stat.textColor} bg-slate-50 px-2 py-0.5 rounded-md`}>
                  نشط
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Split Dashboard Content (2 Columns Layout) */}
      {isAdmin() ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tickets Section (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">آخر طلبات الدعم الفني</h2>
              </div>
              <button
                onClick={() => navigate('/helpdesk/manage')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                عرض الكل
                <ArrowLeft size={14} />
              </button>
            </div>

            <Card className="p-4 md:p-6 space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  لا توجد بلاغات دعم فني مفتوحة حالياً 🎉
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => navigate('/helpdesk/manage')}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2.5 transition-colors cursor-pointer group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600">
                            {formatTicketNumber(ticket.ticket_number)}
                          </span>
                          <span className="text-slate-300 text-xs">•</span>
                          <span className="text-xs font-bold text-slate-800">{ticket.employee_name}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-md">
                          {ticket.issue_description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-[10px] text-slate-400">{formatDate(ticket.created_at)}</span>
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Access Section (1/3 width) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
              <h2 className="text-lg font-bold text-slate-800">الوصول السريع للمفاتيح</h2>
            </div>
            <Card className="p-5 md:p-6">
              <div className="grid grid-cols-2 gap-3">
                {quickNavs.map((item) => (
                  <div
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${item.bg} text-center hover:scale-102 hover:shadow-xs transition-all duration-200 cursor-pointer group`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs text-indigo-500 mb-2.5 transition-transform duration-300 group-hover:scale-105">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Employee Quick Actions Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employeeActions.map((action) => (
            <div
              key={action.title}
              onClick={() => navigate(action.to)}
              className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-56"
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
    </div>
  );
}

export { DashboardHome };
