import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to Arabic-friendly locale string.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date to relative time (e.g., "منذ 3 ساعات").
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  return formatDate(date);
}

/**
 * Generate a display ticket number like TK-001.
 */
export function formatTicketNumber(num: number): string {
  return `TK-${String(num).padStart(3, '0')}`;
}

/**
 * Check if a renewal date is approaching (within N days).
 */
export function isRenewalSoon(renewalDate: string | Date, withinDays = 30): boolean {
  const target = new Date(renewalDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= withinDays && diffDays >= 0;
}

/**
 * Check if a renewal date is overdue.
 */
export function isRenewalOverdue(renewalDate: string | Date): boolean {
  return new Date(renewalDate) < new Date();
}
