// Authentication Context - Manages user auth state
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import supabase, { signUp, signIn, signInWithMagicLink, signOut } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
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

    useEffect(() => {
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
    }, []);

    const handleSignUp = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            await signUp(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            await signIn(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (email: string) => {
        try {
            setError(null);
            setLoading(true);
            await signInWithMagicLink(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send magic link');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            setError(null);
            await signOut();
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
