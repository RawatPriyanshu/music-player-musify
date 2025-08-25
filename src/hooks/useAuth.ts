import { useState, useEffect } from 'react';
import { AuthState, User } from '@/types';

// Mock auth hook - will be replaced with Supabase integration
export const useAuth = (): AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
} => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Simulate checking for existing session
    setTimeout(() => {
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    // TODO: Replace with Supabase authentication
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'Demo User',
        created_at: new Date().toISOString(),
      };
      
      setAuthState({
        user: mockUser,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to sign in',
      }));
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    // TODO: Replace with Supabase authentication
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name,
        created_at: new Date().toISOString(),
      };
      
      setAuthState({
        user: mockUser,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to sign up',
      }));
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // TODO: Replace with Supabase authentication
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAuthState({
        user: null,
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

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};