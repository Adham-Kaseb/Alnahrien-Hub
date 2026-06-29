import { useEffect, useState, useCallback } from 'react';
import { Plus, BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import type { Guide } from '@/lib/types/database.types';

function KnowledgeBasePage() {
  const { isAdmin, session } = useAuthStore();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    guide_title: '',
    media_type: 'video' as 'video' | 'images',
    target_problem: '',
    content: '',
  });

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('guides').select('*').order('created_at', { ascending: false });
    if (error) toast.error('حصل مشكلة في تحميل الشروحات');
    else setGuides(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGuides(); }, [fetchGuides]);

  const handleSave = async () => {
    if (!form.guide_title.trim()) { toast.error('اكتب عنوان الشرح'); return; }

    const { error } = await (supabase.from('guides') as any).insert({
      guide_title: form.guide_title,
      media_type: form.media_type,
      target_problem: form.target_problem,
      content: form.content,
      created_by: session?.user.id,
    });

    if (error) toast.error('حصل مشكلة في الحفظ');
    else { toast.success('تم إضافة الشرح ✅'); setIsModalOpen(false); fetchGuides(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('guides').delete().eq('id', id);
    if (error) toast.error('حصل مشكلة في الحذف');
    else { toast.success('تم الحذف ✅'); fetchGuides(); }
  };

  const filtered = guides.filter(
    (g) =>
      g.guide_title.includes(search) ||
      (g.target_problem ?? '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الشروحات والأدلة 📖</h1>
          <p className="text-slate-500 mt-1">إزاي تعمل كذا؟ كل الإجابات هنا</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => { setForm({ guide_title: '', media_type: 'video', target_problem: '', content: '' }); setIsModalOpen(true); }} className="gap-2">
            <Plus size={18} />
            إضافة شرح
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن شرح..."
          className="w-full h-11 pr-11 pl-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>

      {/* Guides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen size={48} />}
            title="لا توجد شروحات"
            description={isAdmin() ? 'ابدأ بإضافة أول شرح للموظفين' : 'لم يتم إضافة شروحات بعد'}
            action={isAdmin() ? <Button onClick={() => setIsModalOpen(true)}>إضافة شرح</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((guide) => (
            <Card key={guide.id} hover padding="none" className="overflow-hidden">
              {/* Colored top bar */}
              <div className="h-2 bg-linear-to-l from-indigo-500 to-cyan-500" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={guide.media_type === 'video' ? 'info' : 'success'} size="sm">
                    {guide.media_type === 'video' ? '🎥 فيديو' : '📸 صور'}
                  </Badge>
                  {isAdmin() && (
                    <button onClick={() => handleDelete(guide.id)} className="text-xs text-rose-500 hover:underline">حذف</button>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{guide.guide_title}</h3>
                {guide.target_problem && (
                  <p className="text-sm text-slate-500 line-clamp-2">{guide.target_problem}</p>
                )}
                {guide.content && (
                  <p className="text-sm text-slate-600 mt-3 line-clamp-3">{guide.content}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة شرح جديد">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">عنوان الشرح *</label>
            <input value={form.guide_title} onChange={(e) => setForm({ ...form, guide_title: e.target.value })} placeholder="مثال: إزاي تشغل إيميل الشركة" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">طريقة الشرح</label>
            <select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value as 'video' | 'images' })} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
              <option value="video">فيديو قصير (دقيقة)</option>
              <option value="images">صور خطوة بخطوة</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">المشكلة اللي بيحلها</label>
            <input value={form.target_problem} onChange={(e) => setForm({ ...form, target_problem: e.target.value })} placeholder="مثال: تشغيل إيميل الشركة على الموبايل" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">المحتوى / الخطوات</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="اكتب الخطوات بالتفصيل هنا..." className="w-full min-h-25 px-4 py-3 rounded-xl border border-slate-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>
          <Button onClick={handleSave} className="w-full">إضافة الشرح</Button>
        </div>
      </Modal>
    </div>
  );
}

export { KnowledgeBasePage };
