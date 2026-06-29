import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('الإيميل مش صحيح'),
  password: z.string().min(4, 'كلمة المرور لازم تكون 4 أرقام على الأقل'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const { data: profileData, error } = await (supabase.rpc as any)('login_user', {
      p_email: data.email,
      p_password: data.password,
    });

    if (error || !profileData || (profileData as any).length === 0) {
      toast.error('الإيميل أو كلمة المرور غلط. جرب تاني.');
      return;
    }

    // Trigger entering animation
    setIsEntering(true);

    // Set the user profile in store
    useAuthStore.getState().setProfile((profileData as any)[0]);

    // Hold the screen for 1.5 seconds for a premium feel
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('تم تسجيل الدخول بنجاح! 🎉');
    navigate('/');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 p-4 overflow-hidden select-none">
      {/* Animated Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-125 h-125 bg-indigo-600/10 rounded-full blur-3xl opacity-60"
        />
        <motion.div
          animate={{
            x: [0, -100, 60, 0],
            y: [0, 60, -100, 0],
            scale: [1, 0.95, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-125 h-125 bg-cyan-600/10 rounded-full blur-3xl opacity-60"
        />
      </div>

      {/* Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl z-10"
      >
        {/* Header (Logo & Brand) */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.1, type: 'spring' }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-500 shadow-xl shadow-indigo-600/20 mb-4 border border-indigo-400/20"
          >
            <Shield size={28} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-black text-slate-100 leading-none tracking-tight"
          >
            Alnahrien Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs text-slate-400 mt-2 font-medium"
          >
            البوابة الإلكترونية الموحدة لتكنولوجيا المعلومات
          </motion.p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex flex-col gap-1.5"
          >
            <label htmlFor="email" className="text-xs font-bold text-slate-300 pr-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                className={`w-full h-12 pr-11 pl-4 rounded-xl border ${
                  errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                } bg-slate-950/40 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 ${
                  errors.email ? 'focus:ring-rose-500/10' : 'focus:ring-indigo-500/10'
                } transition-all`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 pr-1">{errors.email.message}</p>
            )}
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex flex-col gap-1.5"
          >
            <label htmlFor="password" className="text-xs font-bold text-slate-300 pr-1">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••"
                className={`w-full h-12 pr-11 pl-11 rounded-xl border ${
                  errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                } bg-slate-950/40 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 ${
                  errors.password ? 'focus:ring-rose-500/10' : 'focus:ring-indigo-500/10'
                } transition-all`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 pr-1">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'تسجيل الدخول'
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-[10px] text-slate-400 mt-8"
        >
          © {new Date().getFullYear()} Alnahrien Hub. جميع الحقوق محفوظة.
        </motion.p>
      </motion.div>

      {/* Full screen success loading animation */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white"
          >
            {/* Spinning & Pulsing Logo */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6 border border-indigo-400/20"
            >
              <Shield size={38} className="text-white" />
            </motion.div>

            {/* Glowing Text */}
            <motion.h3
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold text-slate-100 font-sans"
            >
              جاري تهيئة البوابة...
            </motion.h3>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-slate-400 mt-2 font-sans"
            >
              أهلاً بك في Alnahrien Hub
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { LoginPage };
