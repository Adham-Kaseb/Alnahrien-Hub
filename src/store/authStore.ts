import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Profile, AppRole } from '@/lib/types/database.types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;

  // Computed-like helpers
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  role: null,
  isLoading: true,

  setSession: (session) => set({ session }),

  setProfile: (profile) =>
    set({
      profile,
      role: profile?.role ?? null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      session: null,
      profile: null,
      role: null,
      isLoading: false,
    }),

  isAuthenticated: () => get().session !== null,
  isAdmin: () => get().role === 'admin',
}));
