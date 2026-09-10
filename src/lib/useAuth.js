import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from './supabase';
export function useAuth() {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadProfile = useCallback(async (uid) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url')
            .eq('id', uid)
            .maybeSingle();
        if (error) {
            console.error('Failed to load profile:', error.message);
            return;
        }
        setProfile(data);
    }, []);
    useEffect(() => {
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            }
            setLoading(false);
        }).catch((error) => {
            console.error('Failed to restore auth session:', error);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            }
            else {
                setProfile(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [loadProfile]);
    const signInWithEmail = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error)
            throw error;
        return data;
    }, []);
    const signUpWithEmail = useCallback(async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });
        if (error)
            throw error;
        return data;
    }, []);
    const signInWithGoogle = useCallback(async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error)
            throw error;
        return data;
    }, []);
    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error)
            throw error;
        setProfile(null);
    }, []);
    return {
        session,
        user,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
    };
}
