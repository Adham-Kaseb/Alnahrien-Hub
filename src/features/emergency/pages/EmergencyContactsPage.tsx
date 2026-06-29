import { useEffect, useState, useCallback } from 'react';
import { Plus, Phone, Search, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import type { EmergencyContact } from '@/lib/types/database.types';

function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    vendor_name: '',
    service_type: '',
    support_phone: '',
    account_notes: '',
  });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('emergency_contacts').select('*').order('created_at', { ascending: false });
    if (error) toast.error('حصل مشكلة في تحميل البيانات');
    else setContacts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSave = async () => {
    if (!form.vendor_name.trim() || !form.support_phone.trim()) {
      toast.error('اكتب اسم الجهة ورقم التواصل');
      return;
    }

    const { error } = await (supabase.from('emergency_contacts') as any).insert(form);
    if (error) toast.error('حصل مشكلة في الحفظ');
    else { toast.success('تم الحفظ ✅'); setIsModalOpen(false); fetchContacts(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    if (error) toast.error('حصل مشكلة في الحذف');
    else { toast.success('تم الحذف ✅'); fetchContacts(); }
  };

  const filtered = contacts.filter(
    (c) =>
      c.vendor_name.includes(search) ||
      (c.service_type ?? '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">أرقام الطوارئ والدعم الخارجي 📞</h1>
          <p className="text-slate-500 mt-1">أرقام الشركات والفنيين للتواصل السريع</p>
        </div>
        <Button onClick={() => { setForm({ vendor_name: '', service_type: '', support_phone: '', account_notes: '' }); setIsModalOpen(true); }} className="gap-2">
          <Plus size={18} />
          إضافة جهة
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن جهة أو خدمة..."
          className="w-full h-11 pr-11 pl-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Phone size={48} />}
            title="لا توجد جهات مسجلة"
            description="ابدأ بإضافة أرقام الفنيين وشركات الصيانة"
            action={<Button onClick={() => setIsModalOpen(true)}>إضافة جهة</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((contact) => (
            <Card key={contact.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{contact.vendor_name}</h3>
                    {contact.service_type && (
                      <p className="text-sm text-slate-500">{contact.service_type}</p>
                    )}
                    <a
                      href={`tel:${contact.support_phone}`}
                      className="inline-flex items-center gap-1.5 mt-2 text-sm text-indigo-600 font-semibold hover:underline"
                      dir="ltr"
                    >
                      <Phone size={14} />
                      {contact.support_phone}
                    </a>
                    {contact.account_notes && (
                      <p className="text-xs text-slate-400 mt-2 bg-slate-50 rounded-lg p-2">
                        {contact.account_notes}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(contact.id)} className="text-xs text-rose-500 hover:underline shrink-0">
                  حذف
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة جهة تواصل">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">الجهة / الشركة *</label>
            <input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} placeholder="مثال: شركة الإنترنت" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">الخدمة المقدمة</label>
            <input value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} placeholder="صيانة طابعات / شركة النت" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">رقم التواصل *</label>
            <input value={form.support_phone} onChange={(e) => setForm({ ...form, support_phone: e.target.value })} placeholder="01xxxxxxxxx" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">ملاحظات / بيانات الحساب</label>
            <textarea value={form.account_notes} onChange={(e) => setForm({ ...form, account_notes: e.target.value })} placeholder="رقم الاشتراك أو خط الفاتورة" className="w-full min-h-20 px-4 py-3 rounded-xl border border-slate-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <Button onClick={handleSave} className="w-full">حفظ</Button>
        </div>
      </Modal>
    </div>
  );
}

export { EmergencyContactsPage };
