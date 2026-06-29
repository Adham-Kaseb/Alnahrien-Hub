import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Guards
import { AuthGuard } from '@/guards/AuthGuard';
import { RoleGuard } from '@/guards/RoleGuard';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Dashboard
import { DashboardHome } from '@/features/dashboard/pages/DashboardHome';

// Helpdesk
import { SubmitTicketPage } from '@/features/helpdesk/pages/SubmitTicketPage';
import { ManageTicketsPage } from '@/features/helpdesk/pages/ManageTicketsPage';

// Assets
import { AssetManagementPage } from '@/features/assets/pages/AssetManagementPage';

// Credentials
import { CredentialsPage } from '@/features/credentials/pages/CredentialsPage';

// Knowledge Base
import { KnowledgeBasePage } from '@/features/knowledge/pages/KnowledgeBasePage';

// Emergency
import { EmergencyContactsPage } from '@/features/emergency/pages/EmergencyContactsPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'IBM Plex Sans Arabic, Inter, system-ui',
            direction: 'rtl',
            borderRadius: '1rem',
            padding: '12px 20px',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            {/* All Roles */}
            <Route path="/" element={<DashboardHome />} />
            <Route path="/helpdesk/submit" element={<SubmitTicketPage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />

            {/* Admin Only */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/helpdesk/manage" element={<ManageTicketsPage />} />
              <Route path="/assets" element={<AssetManagementPage />} />
              <Route path="/credentials" element={<CredentialsPage />} />
              <Route path="/emergency" element={<EmergencyContactsPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
              <p className="text-slate-500 mb-6">الصفحة مش موجودة</p>
              <a href="/" className="text-indigo-600 font-medium hover:underline">
                الرجوع للرئيسية
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
