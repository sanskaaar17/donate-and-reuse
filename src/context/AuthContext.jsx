// src/context/AuthContext.jsx
// Manages real Supabase Authentication, Session Lifecycle, and User Profiles
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Load profile from public.profiles
  const fetchProfile = useCallback(async (userId) => {
    if (!isConfigured || !userId) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch notice:', error.message);
        // Fallback profile if row is not created yet
        setProfile({
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Campus Contributor',
          campus_role: user?.user_metadata?.campus_role || 'Engineering Student',
          department: user?.user_metadata?.department || 'Engineering',
          email: user?.email
        });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [isConfigured, user]);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // 1. Check existing session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.warn('Session check notice:', error.message);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
      }
      setLoading(false);
    });

    // 2. Listen to real-time auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  // Sign Up with Email, Password & Profile metadata
  const signUp = async ({ email, password, fullName, campusRole, department, phone }) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured yet. Please configure your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

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

  // Sign In with Email & Password
  const signIn = async ({ email, password }) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured yet. Please configure your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    if (!isConfigured) {
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out notice:', error.message);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (!isConfigured || !user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
