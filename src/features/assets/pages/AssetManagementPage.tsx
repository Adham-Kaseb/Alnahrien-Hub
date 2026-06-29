import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Asset, DeviceType, DeviceCondition } from '@/lib/types/database.types';

const deviceTypeLabels: Record<DeviceType, string> = {
  Laptop: 'لابتوب',
  Tablet: 'تابلت',
  Mobile: 'موبايل',
  PC: 'كمبيوتر',
};

const conditionVariant: Record<DeviceCondition, 'success' | 'warning' | 'danger'> = {
  'جديد': 'success',
  'مستعمل وشغال': 'warning',
  'محتاج صيانة': 'danger',
};

function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form state
  const [form, setForm] = useState({
    assigned_to: '',
    device_type: 'Laptop' as DeviceType,
    serial_number: '',
    sim_card_number: '',
    device_condition: 'جديد' as DeviceCondition,
    notes: '',
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error('حصل مشكلة في تحميل الأجهزة');
    else setAssets(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const openCreate = () => {
    setEditingAsset(null);
    setForm({ assigned_to: '', device_type: 'Laptop', serial_number: '', sim_card_number: '', device_condition: 'جديد', notes: '' });
    setIsModalOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      assigned_to: asset.assigned_to,
      device_type: asset.device_type,
      serial_number: asset.serial_number ?? '',
      sim_card_number: asset.sim_card_number ?? '',
      device_condition: asset.device_condition,
      notes: asset.notes ?? '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.assigned_to.trim()) {
      toast.error('اكتب اسم الموظف المستلم');
      return;
    }

    if (editingAsset) {
      const { error } = await (supabase.from('assets') as any).update(form).eq('id', editingAsset.id);
      if (error) toast.error('حصل مشكلة في التعديل');
      else toast.success('تم التعديل بنجاح ✅');
    } else {
      const { error } = await (supabase.from('assets') as any).insert(form);
      if (error) toast.error('حصل مشكلة في الإضافة');
      else toast.success('تم إضافة الجهاز بنجاح ✅');
    }

    setIsModalOpen(false);
    fetchAssets();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) toast.error('حصل مشكلة في الحذف');
    else { toast.success('تم الحذف ✅'); fetchAssets(); }
  };

  const filtered = assets.filter(
    (a) =>
      a.assigned_to.includes(search) ||
      (a.serial_number ?? '').includes(search)
  );

  const columns: Column<Asset>[] = [
    { key: 'assigned_to', header: 'اسم الموظف المستلم', render: (r) => <span className="font-medium">{r.assigned_to}</span> },
    { key: 'device_type', header: 'نوع الجهاز', render: (r) => deviceTypeLabels[r.device_type] },
    { key: 'serial_number', header: 'السيريال نمبر', render: (r) => <span className="font-mono text-xs">{r.serial_number ?? '—'}</span> },
    { key: 'sim_card_number', header: 'رقم خط النت', render: (r) => r.sim_card_number || '—' },
    { key: 'device_condition', header: 'حالة الجهاز', render: (r) => <Badge variant={conditionVariant[r.device_condition]}>{r.device_condition}</Badge> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-xs text-indigo-600 hover:underline">تعديل</button>
          <button onClick={() => handleDelete(r.id)} className="text-xs text-rose-500 hover:underline">حذف</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">عهدة الأجهزة والخطوط 💻</h1>
          <p className="text-slate-500 mt-1">مين معاه إيه؟</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={18} />
          إضافة جهاز
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو السيريال..."
          className="w-full h-11 pr-11 pl-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>

      {filtered.length === 0 && !loading ? (
        <Card>
          <EmptyState
            icon={<Monitor size={48} />}
            title="لا توجد أجهزة مسجلة"
            description="ابدأ بإضافة أول جهاز في العهدة"
            action={<Button onClick={openCreate}>إضافة جهاز</Button>}
          />
        </Card>
      ) : (
        <DataTable columns={columns} data={filtered} keyField="id" isLoading={loading} />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? 'تعديل جهاز' : 'إضافة جهاز جديد'}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">اسم الموظف المستلم *</label>
            <input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">نوع الجهاز</label>
            <select value={form.device_type} onChange={(e) => setForm({ ...form, device_type: e.target.value as DeviceType })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
              {(Object.keys(deviceTypeLabels) as DeviceType[]).map((dt) => (
                <option key={dt} value={dt}>{deviceTypeLabels[dt]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">السيريال نمبر (S/N)</label>
            <input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">رقم خط النت (إن وجد)</label>
            <input value={form.sim_card_number} onChange={(e) => setForm({ ...form, sim_card_number: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">حالة الجهاز</label>
            <select value={form.device_condition} onChange={(e) => setForm({ ...form, device_condition: e.target.value as DeviceCondition })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
              <option value="جديد">جديد</option>
              <option value="مستعمل وشغال">مستعمل وشغال</option>
              <option value="محتاج صيانة">محتاج صيانة</option>
            </select>
          </div>
          <Button onClick={handleSave} className="w-full">
            {editingAsset ? 'حفظ التعديلات' : 'إضافة الجهاز'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export { AssetManagementPage };
