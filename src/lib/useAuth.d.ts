import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
}

export declare function useAuth(): {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{
        user: User;
        session: Session;
    }>;
    signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{
        user: User | null;
        session: Session | null;
    }>;
    signInWithGoogle: () => Promise<{
        provider: string;
        url: string | null;
    }>;
    signOut: () => Promise<void>;
};