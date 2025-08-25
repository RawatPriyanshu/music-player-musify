import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
} => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            loading: false,
          }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setAuthState(prev => ({
          ...prev,
          error: 'Failed to load user profile',
          loading: false,
        }));
        return;
      }

      setAuthState(prev => ({
        ...prev,
        profile,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to load user profile',
        loading: false,
      }));
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = 'Failed to sign in';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
          },
        },
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { error: error.message };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      const errorMessage = 'Failed to sign up';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to sign out',
      }));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) {
      return { error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id);

      if (error) {
        return { error: error.message };
      }

      // Refresh profile data
      await fetchUserProfile(authState.user.id);
      return { error: null };
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};