import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SnookerUserState {
  name: string;
  lastName: string;
  phone: string;
  agreedToRules: boolean;
  setUser: (name: string, lastName: string, phone: string) => void;
  setAgreedToRules: (agreed: boolean) => void;
  clearUser: () => void;
  isRegistered: () => boolean;
}

export const useSnookerUserStore = create<SnookerUserState>()(
  persist(
    (set, get) => ({
      name: '',
      lastName: '',
      phone: '',
      agreedToRules: false,
      
      setUser: (name: string, lastName: string, phone: string) => {
        set({ name, lastName, phone });
      },
      
      setAgreedToRules: (agreed: boolean) => {
        set({ agreedToRules: agreed });
      },
      
      clearUser: () => set({ 
        name: '', 
        lastName: '', 
        phone: '', 
        agreedToRules: false 
      }),
      
      isRegistered: () => Boolean(get().name && get().phone && get().agreedToRules),
    }),
    {
      name: 'snooker-user',
    }
  )
);
