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

const getStoredProfile = (): Profile | null => {
  try {
    const data = localStorage.getItem('alnahrien_profile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: getStoredProfile(),
  role: getStoredProfile()?.role ?? null,
  isLoading: false,

  setSession: (session) => set({ session }),

  setProfile: (profile) => {
    if (profile) {
      localStorage.setItem('alnahrien_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('alnahrien_profile');
    }
    set({
      profile,
      role: profile?.role ?? null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => {
    localStorage.removeItem('alnahrien_profile');
    set({
      session: null,
      profile: null,
      role: null,
      isLoading: false,
    });
  },

  isAuthenticated: () => get().profile !== null,
  isAdmin: () => get().role === 'admin',
}));
