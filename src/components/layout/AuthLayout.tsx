import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/25 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Alnahrien Hub</h1>
          <p className="text-sm text-slate-500 mt-1">بوابة تكنولوجيا المعلومات الداخلية</p>
        </div>

        {/* Auth form outlet */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Alnahrien Hub. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}

export { AuthLayout };
