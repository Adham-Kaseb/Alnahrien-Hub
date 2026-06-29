import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { AppRole } from '@/lib/types/database.types';

interface RoleGuardProps {
  allowedRoles: AppRole[];
}

function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { role } = useAuthStore();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export { RoleGuard };
