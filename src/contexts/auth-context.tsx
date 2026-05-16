'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type UserRole = 'employee' | 'employer' | 'provider' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function getUserRole(user: User): Promise<UserRole> {
  const email = user.email;
  if (!email) return null;

  // Check if admin
  if (user.user_metadata?.role === 'admin') return 'admin';

  // Check if company contact (employer)
  const { data: contact } = await supabase
    .from('company_contacts')
    .select('company_id')
    .eq('email', email)
    .maybeSingle();

  if (contact) return 'employer';

  // Check if employee
  const { data: employee } = await supabase
    .from('employees')
    .select('company_id')
    .eq('email', email)
    .maybeSingle();

  if (employee) return 'employee';

  // Check if provider
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('contact_email', email)
    .maybeSingle();

  if (provider) return 'provider';

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        getUserRole(data.session.user).then(setRole);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserRole(session.user).then(setRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
