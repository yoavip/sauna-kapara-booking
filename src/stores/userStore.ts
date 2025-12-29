import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  phone: string;
  setUser: (name: string, phone: string) => void;
  clearUser: () => void;
  isRegistered: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      phone: '',
      setUser: (name: string, phone: string) => set({ name, phone }),
      clearUser: () => set({ name: '', phone: '' }),
      isRegistered: () => Boolean(get().name && get().phone),
    }),
    {
      name: 'sauna-user',
    }
  )
);
