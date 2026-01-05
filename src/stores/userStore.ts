import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { trackUserCreated } from '@/lib/analytics';

interface UserState {
  name: string;
  lastName: string;
  phone: string;
  userId: string | null;
  setUser: (name: string, lastName: string, phone: string) => Promise<void>;
  clearUser: () => void;
  isRegistered: () => boolean;
  isAdmin: () => Promise<boolean>;
  checkAdminSync: () => boolean;
  setAdminStatus: (status: boolean) => void;
  _isAdmin: boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      lastName: '',
      phone: '',
      userId: null,
      _isAdmin: false,
      
      setUser: async (name: string, lastName: string, phone: string) => {
        // Check if user exists in DB
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('phone', phone)
          .maybeSingle();

        let userId = existingUser?.id;

        if (existingUser) {
          // Update existing user
          await supabase
            .from('users')
            .update({ name, last_name: lastName })
            .eq('phone', phone);
        } else {
          // Create new user
          const { data: newUser } = await supabase
            .from('users')
            .insert({ name, last_name: lastName, phone })
            .select('id')
            .single();
          userId = newUser?.id;
          
          // Track new user creation
          trackUserCreated(name, phone);
        }

        // Check if admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        set({ 
          name, 
          lastName, 
          phone, 
          userId,
          _isAdmin: !!roleData 
        });
      },
      
      clearUser: () => set({ name: '', lastName: '', phone: '', userId: null, _isAdmin: false }),
      
      isRegistered: () => Boolean(get().name && get().phone),
      
      isAdmin: async () => {
        const { phone } = get();
        if (!phone) return false;
        
        const { data } = await supabase.rpc('has_role', { 
          _phone: phone, 
          _role: 'admin' 
        });
        
        set({ _isAdmin: !!data });
        return !!data;
      },
      
      checkAdminSync: () => get()._isAdmin,
      
      setAdminStatus: (status: boolean) => set({ _isAdmin: status }),
    }),
    {
      name: 'sauna-user',
    }
  )
);
