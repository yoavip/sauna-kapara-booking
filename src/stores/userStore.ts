import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ADMIN_CREDENTIALS = { name: 'נמרודמנדל', phone: '12345678' };

interface UserState {
  name: string;
  phone: string;
  setUser: (name: string, phone: string) => void;
  clearUser: () => void;
  isRegistered: () => boolean;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      phone: '',
      setUser: (name: string, phone: string) => set({ name, phone }),
      clearUser: () => set({ name: '', phone: '' }),
      isRegistered: () => Boolean(get().name && get().phone),
      isAdmin: () => get().name === ADMIN_CREDENTIALS.name && get().phone === ADMIN_CREDENTIALS.phone,
    }),
    {
      name: 'sauna-user',
    }
  )
);
