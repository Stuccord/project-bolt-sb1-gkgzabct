import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Agent } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  agent: Agent | null;
  loading: boolean;
  setupError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createUser: (email: string, password: string, fullName: string, role: string, phone?: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  const fetchAgentProfile = async (userId: string) => {
    setLoading(true);
    setSetupError(null);
    const fetchTimeout = setTimeout(() => {
      console.warn('Profile fetch timed out');
      setSetupError('Profile setup timed out. Please try retrying or contact support.');
      setLoading(false);
    }, 10000);

    try {
      console.log('Fetching agent profile for:', userId);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching agent profile:', error);
        setSetupError(`Fetch error: ${error.message}`);
      }

      if (data) {
        console.log('Profile found:', data.email);
        setAgent(data);
      } else {
        console.log('Profile not found, attempting fallback creation...');
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user data for fallback:', userError);
          setSetupError(`User data error: ${userError.message}`);
        }

        if (userData.user) {
          console.log('Creating agent profile for user:', userData.user.email);
          const { data: newProfile, error: createError } = await supabase
            .from('agents')
            .insert([{
              id: userId,
              email: userData.user.email,
              full_name: userData.user.user_metadata?.full_name || userData.user.email,
              role: userData.user.user_metadata?.role || 'agent',
              phone: userData.user.user_metadata?.phone || null,
              is_active: true
            }])
            .select()
            .single();

          if (createError) {
            console.error('Error creating agent profile fallback:', createError);
            setSetupError(`Creation error: ${createError.message}. This usually means your account exists in Auth but not in the database, and the automatic fix failed.`);
          } else {
            console.log('Fallback profile created successfully');
            setAgent(newProfile);
          }
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in agent profile logic:', error);
      setSetupError(`Unexpected error: ${error.message || 'Unknown error'}`);
    } finally {
      clearTimeout(fetchTimeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          fetchAgentProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchAgentProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAgent(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        await fetchAgentProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const createUser = async (email: string, password: string, fullName: string, role: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: fullName,
            role: role,
            phone: phone,
            hospital_affiliation: '',
          },
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, agent, loading, setupError, signIn, signOut, createUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
