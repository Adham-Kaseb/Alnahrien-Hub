import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('الإيميل مش صحيح'),
  password: z.string().min(6, 'كلمة المرور لازم تكون 6 حروف على الأقل'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const { data: profileData, error } = await supabase.rpc('login_user', {
      p_email: data.email,
      p_password: data.password,
    });

    if (error || !profileData || (profileData as any).length === 0) {
      toast.error('الإيميل أو كلمة المرور غلط. جرب تاني.');
      return;
    }

    // Set the user profile in store
    useAuthStore.getState().setProfile((profileData as any)[0]);

    toast.success('تم تسجيل الدخول بنجاح! 🎉');
    navigate('/');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">تسجيل الدخول</h2>
      <p className="text-sm text-slate-500 mb-6">ادخل بيانات حسابك للمتابعة</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              placeholder="example@company.com"
              className={`w-full h-11 pr-11 pl-4 rounded-xl border ${
                errors.email ? 'border-rose-400' : 'border-slate-200'
              } bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full h-11 pr-11 pl-11 rounded-xl border ${
                errors.password ? 'border-rose-400' : 'border-slate-200'
              } bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
        >
          دخول
        </Button>
      </form>
    </div>
  );
}

export { LoginPage };
