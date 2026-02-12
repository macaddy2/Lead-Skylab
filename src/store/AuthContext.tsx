// Authentication Context - Manages user auth state
// Supports demo mode when Supabase is not configured
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../lib/supabase';

// Only import supabase auth functions if configured
const supabaseModule = isSupabaseConfigured
    ? await import('../lib/supabase')
    : null;

// Demo user for running without Supabase
const DEMO_USER: User = {
    id: 'demo-user-id',
    email: 'demo@leadskylab.com',
    app_metadata: {},
    user_metadata: { full_name: 'Demo User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
} as User;

const DEMO_SESSION: Session = {
    access_token: 'demo-token',
    refresh_token: 'demo-refresh',
    expires_in: 86400,
    token_type: 'bearer',
    user: DEMO_USER,
} as Session;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    isDemoMode: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithMagicLink: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isDemoMode = !isSupabaseConfigured;

    useEffect(() => {
        if (isDemoMode) {
            // Auto-login in demo mode
            setUser(DEMO_USER);
            setSession(DEMO_SESSION);
            setLoading(false);
            return;
        }

        const supabase = supabaseModule!.default;

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [isDemoMode]);

    const handleSignUp = async (email: string, password: string) => {
        if (isDemoMode) {
            setUser(DEMO_USER);
            setSession(DEMO_SESSION);
            return;
        }
        try {
            setError(null);
            setLoading(true);
            await supabaseModule!.signUp(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (email: string, password: string) => {
        if (isDemoMode) {
            setUser(DEMO_USER);
            setSession(DEMO_SESSION);
            return;
        }
        try {
            setError(null);
            setLoading(true);
            await supabaseModule!.signIn(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (email: string) => {
        if (isDemoMode) {
            setUser(DEMO_USER);
            setSession(DEMO_SESSION);
            return;
        }
        try {
            setError(null);
            setLoading(true);
            await supabaseModule!.signInWithMagicLink(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send magic link');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        if (isDemoMode) {
            // In demo mode, just stay logged in
            return;
        }
        try {
            setError(null);
            await supabaseModule!.signOut();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign out');
            throw err;
        }
    };

    const value: AuthContextType = {
        user,
        session,
        loading,
        error,
        isDemoMode,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signInWithMagicLink: handleMagicLink,
        signOut: handleSignOut,
        clearError: () => setError(null),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
