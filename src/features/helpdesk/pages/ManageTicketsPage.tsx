import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

import { DataTable, type Column } from '@/components/ui/Table';
import { StatusBadge, statusConfig } from '@/components/ui/StatusBadge';
import { formatDate, formatTicketNumber } from '@/lib/utils';
import type { Ticket, TicketStatus } from '@/lib/types/database.types';
import toast from 'react-hot-toast';

function ManageTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('حصل مشكلة في تحميل البلاغات');
    } else {
      setTickets(data ?? []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    const { error } = await (supabase.from('tickets') as any)
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (error) {
      toast.error('مقدرناش نحدّث الحالة');
    } else {
      toast.success('تم تحديث الحالة ✅');
      fetchTickets();
    }
  };

  const columns: Column<Ticket>[] = [
    {
      key: 'ticket_number',
      header: 'رقم البلاغ',
      render: (row) => (
        <span className="font-mono font-semibold text-indigo-600">
          {formatTicketNumber(row.ticket_number)}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'التاريخ',
      render: (row) => <span className="text-slate-500">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'employee_name',
      header: 'اسم الموظف',
      render: (row) => <span className="font-medium">{row.employee_name}</span>,
    },
    {
      key: 'issue_description',
      header: 'وصف المشكلة',
      className: 'max-w-xs',
      render: (row) => (
        <p className="truncate text-slate-600" title={row.issue_description}>
          {row.issue_description}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value as TicketStatus)}
          className="bg-transparent text-sm border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {(Object.keys(statusConfig) as TicketStatus[]).map((s) => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إدارة الدعم الفني 🎫</h1>
        <p className="text-slate-500 mt-1">كل البلاغات في مكان واحد</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          الكل
        </button>
        {(Object.keys(statusConfig) as TicketStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <StatusBadge status={s} />
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <DataTable
        columns={columns}
        data={tickets}
        keyField="id"
        isLoading={loading}
        emptyMessage="لا توجد بلاغات حالياً 🎉"
      />
    </div>
  );
}

export { ManageTicketsPage };
