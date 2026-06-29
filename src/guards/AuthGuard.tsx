import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

function AuthGuard() {
  const { profile } = useAuthStore();

  // Redirect to login if no profile is active
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export { AuthGuard };
