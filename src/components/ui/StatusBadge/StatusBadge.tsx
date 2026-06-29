import type { TicketStatus } from '@/lib/types/database.types';
import { Badge } from '@/components/ui/Badge';

interface StatusBadgeProps {
  status: TicketStatus;
}

const statusConfig: Record<TicketStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }> = {
  pending: { label: 'جديد 🟡', variant: 'warning' },
  in_progress: { label: 'جاري التصليح 🔵', variant: 'info' },
  resolved: { label: 'خلصت خلاص ✅', variant: 'success' },
  waiting_parts: { label: 'محتاجة قطع غيار 🔴', variant: 'danger' },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

export { StatusBadge, statusConfig };
export type { StatusBadgeProps };
