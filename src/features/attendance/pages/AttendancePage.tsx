import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DataTable, type Column } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { CalendarCheck, CheckCircle2, AlertTriangle, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface AttendanceLog {
  id: string;
  employee_id: string;
  check_in_time: string;
  status: 'on_time' | 'late';
  notes: string | null;
  employeeName?: string;
  employeeEmail?: string;
}

interface CommitmentStats {
  name: string;
  rate: number;
  onTime: number;
  total: number;
}

function AttendanceChart({ data }: { data: CommitmentStats[] }) {
  if (data.length === 0) {
    return (
      <div className="text-slate-400 text-xs text-center py-12 font-semibold">
        لا توجد بيانات حضور كافية حالياً لعرض المخطط البياني.
      </div>
    );
  }

  const chartHeight = 180;
  const barWidth = 44;
  const gap = 40;
  const paddingX = 50;
  const paddingY = 30;
  
  // Ensure chart takes up full width comfortably
  const chartWidth = Math.max(data.length * (barWidth + gap) + paddingX * 2, 480);

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
      <svg width={chartWidth} height={chartHeight + paddingY * 2} className="mx-auto select-none">
        {/* SVG Gradients definitions */}
        <defs>
          <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = chartHeight - (val / 100) * chartHeight + paddingY;
          return (
            <g key={val} className="opacity-75">
              <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={paddingX - 16} y={y + 4} textAnchor="end" className="text-[10px] font-black fill-slate-400">{val}%</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = paddingX + idx * (barWidth + gap) + 20;
          const barHeight = Math.max((item.rate / 100) * chartHeight, 8);
          const y = chartHeight - barHeight + paddingY;

          // Color based on commitment rate
          let barFill = 'url(#emeraldGrad)';
          let barBorder = 'stroke-emerald-600';
          if (item.rate < 75) {
            barFill = 'url(#roseGrad)';
            barBorder = 'stroke-rose-600';
          } else if (item.rate < 90) {
            barFill = 'url(#amberGrad)';
            barBorder = 'stroke-amber-600';
          }

          return (
            <g key={item.name} className="group cursor-pointer">
              {/* Hover Highlight Pill */}
              <rect
                x={x - 8}
                y={paddingY - 10}
                width={barWidth + 16}
                height={chartHeight + 20}
                rx={14}
                className="fill-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={8}
                className={`${barBorder} stroke-1 transition-all duration-300`}
                fill={barFill}
              />

              {/* Rate percentage text */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-[11px] font-black fill-slate-800 transition-all duration-200"
              >
                {Math.round(item.rate)}%
              </text>

              {/* Attendance ratio on hover */}
              <text
                x={x + barWidth / 2}
                y={y - 22}
                textAnchor="middle"
                className="text-[9px] font-bold fill-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                حضر {item.onTime} من {item.total}
              </text>

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + paddingY + 18}
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-600"
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [empSearchTerm, setEmpSearchTerm] = useState('');

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const [logsRes, profilesRes] = await Promise.all([
        supabase.from('attendance').select('*').order('check_in_time', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email, role, phone')
      ]);

      if (logsRes.error) throw logsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const logsData = (logsRes.data || []) as any[];
      const profilesData = (profilesRes.data || []) as any[];

      // Create profiles lookup map
      const profilesMap: Record<string, { full_name: string; email: string }> = {};
      profilesData.forEach((p) => {
        profilesMap[p.id] = { full_name: p.full_name, email: p.email };
      });

      // Map profiles information to attendance logs
      const mappedLogs: AttendanceLog[] = logsData.map((log) => ({
        ...log,
        employeeName: profilesMap[log.employee_id]?.full_name ?? 'موظف غير معروف',
        employeeEmail: profilesMap[log.employee_id]?.email ?? '-',
      }));

      setLogs(mappedLogs);

      // Map all registered profiles with their attendance statistics
      const mappedEmployees = profilesData.map((p) => {
        const pLogs = logsData.filter((log) => log.employee_id === p.id);
        const total = pLogs.length;
        const onTime = pLogs.filter((log) => log.status === 'on_time').length;
        return {
          id: p.id,
          fullName: p.full_name,
          email: p.email,
          phone: p.phone || '-',
          role: p.role === 'admin' ? 'مدير النظام' : 'موظف',
          totalCheckIns: total,
          commitmentRate: total > 0 ? Math.round((onTime / total) * 100) : null,
        };
      });
      setEmployees(mappedEmployees);
    } catch (error) {
      toast.error('مقدرناش نحمل بيانات الحضور');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Compute stats metrics
  const totalLogs = logs.length;
  const onTimeCount = logs.filter((log) => log.status === 'on_time').length;
  const lateCount = logs.filter((log) => log.status === 'late').length;
  const commitmentRate = totalLogs > 0 ? (onTimeCount / totalLogs) * 100 : 0;

  // Group logs by employee to calculate individual commitment chart data
  const employeeStatsMap: Record<string, { name: string; onTime: number; total: number }> = {};
  logs.forEach((log) => {
    const name = log.employeeName ?? 'موظف غير معروف';
    if (!employeeStatsMap[log.employee_id]) {
      employeeStatsMap[log.employee_id] = { name, onTime: 0, total: 0 };
    }
    employeeStatsMap[log.employee_id].total += 1;
    if (log.status === 'on_time') {
      employeeStatsMap[log.employee_id].onTime += 1;
    }
  });

  const chartData: CommitmentStats[] = Object.values(employeeStatsMap).map((item) => ({
    name: item.name,
    onTime: item.onTime,
    total: item.total,
    rate: item.total > 0 ? (item.onTime / item.total) * 100 : 0,
  }));

  // Filter logs for Table search
  const filteredLogs = logs.filter((log) =>
    log.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.employeeEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter registered employees for search
  const filteredEmployees = employees.filter((emp) =>
    emp.fullName?.toLowerCase().includes(empSearchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(empSearchTerm.toLowerCase())
  );

  const columns: Column<AttendanceLog>[] = [
    {
      key: 'employeeName',
      header: 'اسم الموظف',
      render: (row) => <span className="font-bold text-slate-800 text-xs">{row.employeeName}</span>,
    },
    {
      key: 'check_in_time',
      header: 'تاريخ وتوقيت الحضور',
      render: (row) => {
        const date = new Date(row.check_in_time);
        return (
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-700">{formatDate(row.check_in_time)}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-0.5">
              {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'حالة الحضور',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
            row.status === 'on_time'
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15'
              : 'bg-rose-500/10 text-rose-600 border border-rose-500/15'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'on_time' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {row.status === 'on_time' ? 'منضبط' : 'متأخر'}
        </span>
      ),
    },
  ];

  const employeeColumns: Column<any>[] = [
    {
      key: 'fullName',
      header: 'اسم الموظف',
      render: (row) => <span className="font-bold text-slate-800 text-xs">{row.fullName}</span>,
    },
    {
      key: 'email',
      header: 'البريد الإلكتروني',
      render: (row) => <span className="text-slate-600 text-xs font-mono">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'الصلاحية',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
          row.role === 'مدير النظام' 
            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
            : 'bg-slate-50 text-slate-600 border border-slate-100'
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'رقم الهاتف',
      render: (row) => <span className="text-slate-500 text-xs font-mono">{row.phone}</span>,
    },
    {
      key: 'totalCheckIns',
      header: 'إجمالي الحضور',
      render: (row) => <span className="text-slate-700 font-bold text-xs">{row.totalCheckIns} أيام</span>,
    },
    {
      key: 'commitmentRate',
      header: 'معدل الالتزام العام',
      render: (row) => {
        if (row.commitmentRate === null) {
          return <span className="text-slate-400 text-xs font-bold">لا توجد سجلات 📅</span>;
        }
        
        let color = 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (row.commitmentRate < 75) color = 'text-rose-600 bg-rose-50 border-rose-100';
        else if (row.commitmentRate < 90) color = 'text-amber-600 bg-amber-50 border-amber-100';
        
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black border ${color}`}>
            {row.commitmentRate}%
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
            <CalendarCheck size={22} />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-slate-800">سجل حضور وانصراف الموظفين</h1>
            <p className="text-slate-400 text-xs mt-1">متابعة دقة مواعيد الموظفين وتحليل الالتزام بالعمل اليومي</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs flex items-center justify-between group">
          <div className="space-y-1 text-right">
            <span className="text-xs font-bold text-slate-400">إجمالي حضور الموظفين</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{loading ? '...' : totalLogs}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs flex items-center justify-between group">
          <div className="space-y-1 text-right">
            <span className="text-xs font-bold text-slate-400">معدل الانضباط والالتزام</span>
            <h2 className="text-2xl font-black text-emerald-600 tracking-tight mt-1">
              {loading ? '...' : `${Math.round(commitmentRate)}%`}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs flex items-center justify-between group">
          <div className="space-y-1 text-right">
            <span className="text-xs font-bold text-slate-400">إجمالي حالات التأخير</span>
            <h2 className="text-2xl font-black text-rose-600 tracking-tight mt-1">{loading ? '...' : lateCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Analytics Chart (Spacious Full Width Card) */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="text-right">
            <h3 className="text-base font-extrabold text-slate-800">تحليل نسب انضباط حضور الموظفين</h3>
            <p className="text-slate-400 text-xs mt-0.5">معدل وصول الموظف في الموعد المحدد (قبل الساعة 9:00 صباحاً)</p>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>ملتزم بالكامل (90%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>انضباط متوسط (75% - 89%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>غير ملتزم (أقل من 75%)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-44 w-full bg-slate-50 animate-pulse rounded-2xl" />
        ) : (
          <AttendanceChart data={chartData} />
        )}
      </Card>

      {/* Logs Table (Spacious Full Width Card) */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="text-right">
            <h3 className="text-base font-extrabold text-slate-800">سجل تسجيل الحضور المباشر</h3>
            <p className="text-slate-400 text-xs mt-0.5">قائمة كاملة توضح تواريخ وتوقيتات حضور كافة الموظفين بالتفصيل</p>
          </div>

          {/* Integrated Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث باسم الموظف أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>
        </div>

        <DataTable
          columns={columns as any}
          data={filteredLogs}
          isLoading={loading}
          emptyMessage="لم يقم أي موظف بتسجيل الحضور بعد 📅"
          keyField="id"
        />
      </Card>

      {/* Registered Employees Table (Spacious Full Width Card) */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="text-right">
            <h3 className="text-base font-extrabold text-slate-800">قائمة كافة الموظفين المسجلين</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">عرض الموظفين المسجلين في النظام وإحصائيات الحضور والالتزام الخاصة بكل منهم</p>
          </div>

          {/* Integrated Employee Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث باسم الموظف أو البريد..."
              value={empSearchTerm}
              onChange={(e) => setEmpSearchTerm(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>
        </div>

        <DataTable
          columns={employeeColumns as any}
          data={filteredEmployees}
          isLoading={loading}
          emptyMessage="لا يوجد موظفون مسجلون حالياً في النظام 📅"
          keyField="id"
        />
      </Card>
    </div>
  );
}
