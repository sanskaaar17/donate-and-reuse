import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);
const CONFIG_ERROR = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) to .env, then restart Vite.';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (currentUser) => {
    if (!currentUser || !isConfigured) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase.rpc('get_my_profile');
    if (error) {
      setProfileError(error.message);
      throw error;
    }
    setProfileError(null);
    setProfile(data || null);
    return data;
  }, [isConfigured]);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (!currentSession?.user || event === 'SIGNED_OUT') {
        setProfile(null);
        setProfileError(null);
      } else if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
        setTimeout(() => {
          if (active) fetchProfile(currentSession.user).catch((error) => {
            console.error('Loading profile failed:', error);
          });
        }, 0);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (!active) return;
      if (error) console.error('Checking the Supabase session failed:', error);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      if (currentSession?.user) {
        fetchProfile(currentSession.user).catch((profileFetchError) => {
          console.error('Loading profile failed:', profileFetchError);
        });
      }
    }).catch((error) => {
      if (active) {
        setProfileError(error.message || 'Unable to check the current session.');
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, isConfigured]);

  const signUp = async ({ email, password, fullName, campusRole, department, phone }) => {
    if (!isConfigured) throw new Error(CONFIG_ERROR);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          campus_role: campusRole,
          department: department || 'Engineering',
          phone: phone || ''
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async ({ email, password }) => {
    if (!isConfigured) throw new Error(CONFIG_ERROR);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const requestPasswordReset = async (email) => {
    if (!isConfigured) throw new Error(CONFIG_ERROR);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  };

  const updatePassword = async (password) => {
    if (!isConfigured) throw new Error(CONFIG_ERROR);
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!currentSession) throw new Error('This password-reset link is invalid or expired. Request a new link.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!isConfigured) throw new Error(CONFIG_ERROR);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!isConfigured || !user) throw new Error('You must be signed in to update your profile.');
    const allowedUpdates = {
      full_name: updates.full_name?.trim(),
      campus_role: updates.campus_role,
      department: updates.department?.trim(),
      phone: updates.phone?.trim() || null
    };
    const { error } = await supabase
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', user.id);
    if (error) throw error;
    return fetchProfile(user);
  };

  const value = {
    user,
    profile,
    profileError,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    requestPasswordReset,
    updatePassword,
    signOut,
    updateProfile,
    refreshProfile: () => fetchProfile(user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
