import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import AuthPage from '@/pages/AuthPage';
import CommandCenter from '@/pages/CommandCenter';

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen hud-radial flex items-center justify-center bg-slate-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-400/10 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-center">
            <span className="font-display font-black text-2xl text-cyan-400">R</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="relative h-screen bg-slate-950 text-slate-100 overflow-hidden">
        <CommandCenter onSignOut={() => undefined} userEmail="local@ryanai.local" userFullName="Local Operator" />
      </div>
    );
  }

  if (!session || !user) {
    return (
      <AuthPage
        onAuthSuccess={() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
          });
        }}
      />
    );
  }

  return (
    <div className="relative h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <button
        onClick={handleSignOut}
        className="hidden lg:flex fixed top-4 right-4 z-50 items-center gap-2 px-3 py-1.5 rounded-lg glass text-slate-400 hover:text-rose-400 text-xs font-mono transition-colors"
      >
        <LogOut size={13} />
        Sign Out
      </button>
      <CommandCenter
        onSignOut={handleSignOut}
        userEmail={user.email ?? undefined}
        userFullName={user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined}
      />
    </div>
  );
}

export default App;