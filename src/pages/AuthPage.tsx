import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CodeRain from '@/components/CodeRain';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onAuthSuccess();
    });
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || undefined } },
        });
        if (error) throw error;
        // After signup, sign in immediately (email confirmation is off)
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onAuthSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      // OAuth redirects — no need to call onAuthSuccess here
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen hud-radial hud-grid hud-scanlines overflow-hidden relative flex items-center justify-center p-4">
      <CodeRain />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl overflow-hidden corner-brackets">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative w-16 h-16 mx-auto mb-4"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-400/10 blur-xl animate-pulse-slow" />
              <div className="relative w-16 h-16 rounded-2xl bg-ink-900/80 border border-cyan-500/30 flex items-center justify-center">
                <span className="font-display font-black text-2xl text-cyan-400 glow-cyan">R</span>
              </div>
            </motion.div>
            <h1 className="font-display font-bold text-xl text-cyan-200 tracking-wider glow-cyan">RYANAI</h1>
            <p className="text-[10px] text-ink-500 font-mono tracking-widest uppercase mt-1">
              Autonomous Reasoning Engine
            </p>
            <p className="text-xs text-ink-500 mt-3">
              Named after Mukhethwa Ryan Ganyane · Built by Sir G
            </p>
          </div>

          {/* Mode toggle */}
          <div className="px-8 pb-4">
            <div className="flex gap-1 p-1 bg-ink-800/50 rounded-xl border border-cyan-500/15">
              <button
                onClick={() => { setMode('signin'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-ink-500 hover:text-ink-300 border border-transparent'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-ink-500 hover:text-ink-300 border border-transparent'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name (optional)"
                      className="w-full bg-ink-800/50 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-ink-800/50 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-ink-800/50 border border-cyan-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-400 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
                >
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium text-sm btn-glow hover:bg-cyan-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-cyan-500/15" />
              <span className="text-[10px] text-ink-600 font-mono uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-cyan-500/15" />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-ink-800/50 border border-cyan-500/20 text-ink-200 font-medium text-sm hover:border-cyan-500/40 hover:bg-ink-800/70 transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-ink-600 font-mono mt-4">
          RyanAI · Built by Ntsiyeni Ganyane (Sir G) · RMN Ganyane (Pty) Ltd
        </p>
      </motion.div>
    </div>
  );
}
