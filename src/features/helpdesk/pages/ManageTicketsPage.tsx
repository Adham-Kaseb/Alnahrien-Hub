import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/Table';
import { StatusBadge, statusConfig } from '@/components/ui/StatusBadge';
import { formatDate, formatTicketNumber } from '@/lib/utils';
import type { Ticket, TicketStatus } from '@/lib/types/database.types';
import toast from 'react-hot-toast';

interface StatusSelectProps {
  value: TicketStatus;
  onChange: (status: TicketStatus) => void;
}

function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-right">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
      >
        <StatusBadge status={value} />
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-10"
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200/60 shadow-lg p-1.5 z-20 space-y-0.5"
            >
              {(Object.keys(statusConfig) as TicketStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-slate-50 flex items-center justify-between cursor-pointer`}
                >
                  <StatusBadge status={s} />
                  {value === s && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        <span className="font-mono font-semibold text-indigo-600 text-xs">
          {formatTicketNumber(row.ticket_number)}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'التاريخ',
      render: (row) => <span className="text-slate-500 text-xs">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'employee_name',
      header: 'اسم الموظف',
      render: (row) => <span className="font-bold text-slate-800 text-xs">{row.employee_name}</span>,
    },
    {
      key: 'issue_description',
      header: 'وصف المشكلة',
      className: 'max-w-xs',
      render: (row) => (
        <p className="truncate text-slate-600 text-xs" title={row.issue_description}>
          {row.issue_description}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => (
        <StatusSelect
          value={row.status}
          onChange={(newStatus) => handleStatusChange(row.id, newStatus)}
        />
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
