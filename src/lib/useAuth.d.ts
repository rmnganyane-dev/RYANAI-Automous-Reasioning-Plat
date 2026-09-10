import type { Session, User } from '@supabase/supabase-js';
export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
}
export declare function useAuth(): {
    session: Session;
    user: User;
    profile: Profile;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{
        user: User;
        session: Session;
        weakPassword?: import("@supabase/supabase-js").WeakPassword;
    } | {
        user: null;
        session: null;
        weakPassword?: null;
    }>;
    signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{
        user: User | null;
        session: Session | null;
    } | {
        user: null;
        session: null;
    }>;
    signInWithGoogle: () => Promise<{
        provider: import("@supabase/supabase-js").Provider;
        url: string;
        flowId?: string | null;
    } | {
        provider: import("@supabase/supabase-js").Provider;
        url: null;
        flowId?: string | null;
    }>;
    signOut: () => Promise<void>;
};
