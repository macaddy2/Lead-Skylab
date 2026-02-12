// Supabase Client Configuration
// Gracefully degrades to demo mode when env vars are missing
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - running in demo mode (data stored in localStorage only)');
}

// Create a real client if configured, otherwise a placeholder that won't be called
export const supabase: SupabaseClient<Database> = isSupabaseConfigured
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })
    : (null as unknown as SupabaseClient<Database>);

// Auth helpers - guard against demo mode
export const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) throw new Error('Auth requires Supabase configuration');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
};

export const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) throw new Error('Auth requires Supabase configuration');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

export const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) throw new Error('Auth requires Supabase configuration');
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async () => {
    if (!isSupabaseConfigured) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export const getCurrentSession = async () => {
    if (!isSupabaseConfigured) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

export default supabase;
