import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const ticketSchema = z.object({
  employee_name: z.string().min(2, 'اكتب اسمك بالكامل'),
  issue_description: z.string().min(10, 'وصّف المشكلة بالتفصيل (10 حروف على الأقل)'),
  phone_number: z.string().min(10, 'رقم التليفون لازم يكون 10 أرقام على الأقل'),
});

type TicketForm = z.infer<typeof ticketSchema>;

function SubmitTicketPage() {
  const { session } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
  });

  const onSubmit = async (data: TicketForm) => {
    const { error } = await supabase.from('tickets').insert({
      employee_name: data.employee_name,
      issue_description: data.issue_description,
      phone_number: data.phone_number,
      submitted_by: session?.user.id,
    });

    if (error) {
      toast.error('حصل مشكلة في إرسال البلاغ. جرب تاني.');
      return;
    }

    setSubmitted(true);
    toast.success('تم إرسال البلاغ بنجاح! هنتواصل معاك قريب 🎉');
    reset();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card className="text-center py-12">
          <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">تم إرسال البلاغ بنجاح! ✅</h2>
          <p className="text-slate-500 mb-6">
            فريق الدعم الفني هيتواصل معاك في أقرب وقت
          </p>
          <Button onClick={() => setSubmitted(false)}>
            إرسال بلاغ تاني
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">بلّغ عن مشكلة 🎫</h1>
        <p className="text-slate-500 mt-1">اكتب المشكلة واحنا هنتواصل معاك</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Employee Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              اسم الموظف <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full h-11 px-4 rounded-xl border ${
                errors.employee_name ? 'border-rose-400' : 'border-slate-200'
              } text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all`}
              placeholder="مثال: أحمد محمد"
              {...register('employee_name')}
            />
            {errors.employee_name && (
              <p className="text-xs text-rose-500">{errors.employee_name.message}</p>
            )}
          </div>

          {/* Issue Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              المشكلة فين بالظبط؟ <span className="text-rose-500">*</span>
            </label>
            <textarea
              className={`w-full min-h-[120px] px-4 py-3 rounded-xl border ${
                errors.issue_description ? 'border-rose-400' : 'border-slate-200'
              } text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all`}
              placeholder="مثال: اللابتوب مش بيفتح خالص من امبارح، وبيطلع شاشة زرقا"
              {...register('issue_description')}
            />
            {errors.issue_description && (
              <p className="text-xs text-rose-500">{errors.issue_description.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              رقم تليفونك للتواصل <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              className={`w-full h-11 px-4 rounded-xl border ${
                errors.phone_number ? 'border-rose-400' : 'border-slate-200'
              } text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all`}
              placeholder="01xxxxxxxxx"
              dir="ltr"
              {...register('phone_number')}
            />
            {errors.phone_number && (
              <p className="text-xs text-rose-500">{errors.phone_number.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full gap-2" isLoading={isSubmitting}>
            <Send size={18} />
            إرسال البلاغ
          </Button>
        </form>
      </Card>
    </div>
  );
}

export { SubmitTicketPage };
