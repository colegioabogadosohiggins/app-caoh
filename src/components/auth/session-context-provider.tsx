"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: any | null; // To store the user's profile including role
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        // Fetch user profile including role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error('Error al cargar el perfil del usuario.');
          setProfile(null);
        } else {
          setProfile(profileData);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        supabase
          .from('profiles')
          .select('*')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data: profileData, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching initial profile:', profileError);
              toast.error('Error al cargar el perfil inicial del usuario.');
              setProfile(null);
            } else {
              setProfile(profileData);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ['/', '/login'];
      const authRoutes = ['/dashboard', '/dashboard/lawyer', '/dashboard/admin'];

      if (!session && authRoutes.includes(pathname)) {
        router.push('/login');
        toast.info('Necesitas iniciar sesión para acceder a esta página.');
      } else if (session && publicRoutes.includes(pathname) && pathname !== '/') {
        // Redirect authenticated users from login page to dashboard
        router.push('/dashboard');
      } else if (session && profile && pathname.startsWith('/dashboard')) {
        // Redirect based on role within dashboard
        if (profile.role === 'abogado' && pathname !== '/dashboard/lawyer') {
          router.push('/dashboard/lawyer');
        } else if (profile.role === 'admin' && pathname !== '/dashboard/admin') {
          router.push('/dashboard/admin');
        }
      }
    }
  }, [session, profile, isLoading, pathname, router]);

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};