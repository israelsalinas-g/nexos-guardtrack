import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { initDatabase } from '@/lib/database';
import { AppUser } from '@/types';

interface AuthContextValue {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<AppUser | null> => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, rol')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      nombre: data.nombre,
      email: session?.user?.email ?? '',
      rol: data.rol,
    };
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      await initDatabase();

      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (currentSession?.user) {
        const profile = await fetchUserProfile(currentSession.user.id);
        if (mounted) {
          setSession(currentSession);
          setUser(profile ? { ...profile, email: currentSession.user.email ?? '' } : null);
        }
      }

      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user) {
        const profile = await fetchUserProfile(newSession.user.id);
        setUser(profile ? { ...profile, email: newSession.user.email ?? '' } : null);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
