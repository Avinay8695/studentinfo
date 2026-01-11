import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  fullName: string | null;
  isApproved: boolean | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    fullName: null,
    isApproved: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));
        
        // Fetch role and profile after auth state change
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setState(prev => ({ ...prev, role: null, fullName: null, isApproved: null, loading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch both role and profile in parallel
      const [roleResult, profileResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('full_name, is_approved')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      if (roleResult.error) {
        console.error('Error fetching user role:', roleResult.error);
      }
      if (profileResult.error) {
        console.error('Error fetching profile:', profileResult.error);
      }

      const role = (roleResult.data?.role as AppRole) || 'user';
      // Admins are always considered approved
      const isApproved = role === 'admin' ? true : (profileResult.data?.is_approved ?? false);

      setState(prev => ({
        ...prev,
        role,
        fullName: profileResult.data?.full_name || null,
        isApproved,
        loading: false,
      }));
    } catch (err) {
      console.error('Error fetching user data:', err);
      setState(prev => ({ ...prev, role: 'user', fullName: null, isApproved: false, loading: false }));
    }
  };

  const refreshApprovalStatus = async (): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('user_id', state.user.id)
        .maybeSingle();

      if (error) throw error;

      const isApproved = state.role === 'admin' ? true : (data?.is_approved ?? false);
      setState(prev => ({ ...prev, isApproved }));
      return isApproved;
    } catch (err) {
      console.error('Error refreshing approval status:', err);
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      // Clear local state regardless of error (session may already be invalid)
      setState({
        user: null,
        session: null,
        role: null,
        fullName: null,
        isApproved: null,
        loading: false,
      });
      return { error: null };
    } catch {
      // Force clear state even on error
      setState({
        user: null,
        session: null,
        role: null,
        fullName: null,
        isApproved: null,
        loading: false,
      });
      return { error: null };
    }
  };

  return {
    user: state.user,
    session: state.session,
    role: state.role,
    fullName: state.fullName,
    isApproved: state.isApproved,
    loading: state.loading,
    isAuthenticated: !!state.session,
    isAdmin: state.role === 'admin',
    signUp,
    signIn,
    signOut,
    refreshApprovalStatus,
  };
}
