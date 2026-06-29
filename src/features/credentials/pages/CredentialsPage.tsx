import { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, EyeOff, Copy, KeyRound, CreditCard, ExternalLink, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { isRenewalSoon, isRenewalOverdue, formatDate } from '@/lib/utils';
import type { Credential } from '@/lib/types/database.types';

function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'billing' | 'password'>('billing');

  const [form, setForm] = useState({
    service_name: '',
    payment_method: '',
    renewal_date: '',
    platform_url: '',
    username_email: '',
    encrypted_password: '',
  });

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('credentials').select('*').order('created_at', { ascending: false });
    if (error) toast.error('حصل مشكلة في تحميل البيانات');
    else setCredentials(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const billingItems = credentials.filter((c) => c.credential_type === 'billing');
  const passwordItems = credentials.filter((c) => c.credential_type === 'password');

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ! 📋');
  };

  const openModal = (type: 'billing' | 'password') => {
    setModalType(type);
    setForm({ service_name: '', payment_method: '', renewal_date: '', platform_url: '', username_email: '', encrypted_password: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.service_name.trim()) { toast.error('اكتب اسم الخدمة'); return; }

    const { error } = await supabase.from('credentials').insert({
      credential_type: modalType,
      service_name: form.service_name,
      payment_method: modalType === 'billing' ? form.payment_method : null,
      renewal_date: modalType === 'billing' && form.renewal_date ? form.renewal_date : null,
      platform_url: modalType === 'password' ? form.platform_url : null,
      username_email: modalType === 'password' ? form.username_email : null,
      encrypted_password: modalType === 'password' ? form.encrypted_password : null,
    });

    if (error) toast.error('حصل مشكلة في الحفظ');
    else { toast.success('تم الحفظ ✅'); setIsModalOpen(false); fetchCredentials(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('credentials').delete().eq('id', id);
    if (error) toast.error('حصل مشكلة في الحذف');
    else { toast.success('تم الحذف ✅'); fetchCredentials(); }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-1/3" /><div className="h-40 bg-slate-100 rounded-2xl" /><div className="h-40 bg-slate-100 rounded-2xl" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">اشتراكات وباسوردات الشركة 🔐</h1>
        <p className="text-slate-500 mt-1">المكان السري لكل بيانات الاشتراكات</p>
      </div>

      {/* Billing Section */}
      <Card>
        <CardHeader
          title="💳 الاشتراكات والفواتير"
          description="خدمات الشركة وتواريخ التجديد"
          action={<Button size="sm" onClick={() => openModal('billing')} className="gap-1"><Plus size={16} />إضافة</Button>}
        />
        {billingItems.length === 0 ? (
          <EmptyState icon={<CreditCard size={40} />} title="لا توجد اشتراكات مسجلة" />
        ) : (
          <div className="space-y-3">
            {billingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900">{item.service_name}</p>
                  <p className="text-sm text-slate-500">{item.payment_method || 'وسيلة الدفع غير محددة'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {item.renewal_date && (
                    <div className="text-left">
                      <p className="text-xs text-slate-400">التجديد</p>
                      <div className="flex items-center gap-1">
                        {isRenewalOverdue(item.renewal_date) && <AlertTriangle size={14} className="text-rose-500" />}
                        {isRenewalSoon(item.renewal_date) && !isRenewalOverdue(item.renewal_date) && <AlertTriangle size={14} className="text-amber-500" />}
                        <Badge variant={isRenewalOverdue(item.renewal_date) ? 'danger' : isRenewalSoon(item.renewal_date) ? 'warning' : 'default'} size="sm">
                          {formatDate(item.renewal_date)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-rose-500 hover:underline">حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Password Vault */}
      <Card>
        <CardHeader
          title="🔑 خزنة الباسوردات"
          description="بيانات الدخول لمنصات الشركة"
          action={<Button size="sm" onClick={() => openModal('password')} className="gap-1"><Plus size={16} />إضافة</Button>}
        />
        {passwordItems.length === 0 ? (
          <EmptyState icon={<KeyRound size={40} />} title="لا توجد باسوردات مسجلة" />
        ) : (
          <div className="space-y-3">
            {passwordItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900">{item.service_name}</p>
                  <div className="flex items-center gap-2">
                    {item.platform_url && (
                      <a href={item.platform_url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-rose-500 hover:underline">حذف</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs">المستخدم</span>
                    <p className="text-slate-700 font-mono" dir="ltr">{item.username_email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">كلمة المرور</span>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-700 font-mono" dir="ltr">
                        {visiblePasswords.has(item.id) ? item.encrypted_password : '••••••••'}
                      </p>
                      <button onClick={() => togglePassword(item.id)} className="text-slate-400 hover:text-slate-600">
                        {visiblePasswords.has(item.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => copyToClipboard(item.encrypted_password ?? '')} className="text-slate-400 hover:text-slate-600">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'billing' ? 'إضافة اشتراك' : 'إضافة باسورد'}>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">اسم الخدمة / السيستم *</label>
            <input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>

          {modalType === 'billing' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">وسيلة الدفع</label>
                <input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} placeholder="Connier Card / Wallet" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">تاريخ التجديد القادم</label>
                <input type="date" value={form.renewal_date} onChange={(e) => setForm({ ...form, renewal_date: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" dir="ltr" />
              </div>
            </>
          )}

          {modalType === 'password' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">رابط المنصة</label>
                <input value={form.platform_url} onChange={(e) => setForm({ ...form, platform_url: e.target.value })} placeholder="https://..." className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" dir="ltr" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">اسم المستخدم / الإيميل</label>
                <input value={form.username_email} onChange={(e) => setForm({ ...form, username_email: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" dir="ltr" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
                <input type="password" value={form.encrypted_password} onChange={(e) => setForm({ ...form, encrypted_password: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" dir="ltr" />
              </div>
            </>
          )}

          <Button onClick={handleSave} className="w-full">حفظ</Button>
        </div>
      </Modal>
    </div>
  );
}

export { CredentialsPage };
