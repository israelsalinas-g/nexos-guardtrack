import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
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

  const fetchUserProfile = async (userId: string, email: string): Promise<AppUser | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, rol')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile from Supabase:', error);
        return null;
      }
      if (!data) {
        console.error('No user profile found in usuarios table for ID:', userId);
        return null;
      }

      return {
        id: data.id,
        nombre: data.nombre,
        email: email,
        rol: data.rol,
      };
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initDatabase();
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id, currentSession.user.email ?? '');
          if (mounted) {
            if (profile) {
              setSession(currentSession);
              setUser(profile);
            } else {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error during AuthContext initialize:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      if (newSession?.user) {
        setLoading(true);
        const profile = await fetchUserProfile(newSession.user.id, newSession.user.email ?? '');
        if (mounted) {
          if (profile) {
            setSession(newSession);
            setUser(profile);
          } else {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            Alert.alert('Acceso Denegado', 'No se encontró un perfil de usuario válido.');
          }
          setLoading(false);
        }
      } else {
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
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
