import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CodeRain from '@/components/CodeRain';
export default function AuthPage({ onAuthSuccess }) {
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session)
                onAuthSuccess();
        }).catch(() => setError('Unable to restore your session. Please try again.'));
    }, [onAuthSuccess]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const normalizedEmail = email.trim().toLowerCase();
            if (mode === 'signup') {
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                const { error } = await supabase.auth.signUp({
                    email: normalizedEmail,
                    password,
                    options: { data: { full_name: fullName || undefined } },
                });
                if (error)
                    throw error;
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    onAuthSuccess();
                }
                else {
                    setSuccess('Account created. Check your email to confirm your account, then sign in.');
                    setMode('signin');
                    setPassword('');
                    setConfirmPassword('');
                }
            }
            else {
                const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
                if (error)
                    throw error;
                onAuthSuccess();
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Authentication failed';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogle = async () => {
        setError('');
        setSuccess('');
        setGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
            });
            if (error)
                throw error;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Google sign-in failed';
            setError(msg);
        }
        finally {
            setGoogleLoading(false);
        }
    };
    return (_jsxs("div", { className: "h-screen hud-radial hud-grid hud-scanlines overflow-hidden relative flex items-center justify-center p-4", children: [_jsx(CodeRain, {}), _jsxs(motion.div, { initial: { opacity: 0, y: 20, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.4, ease: 'easeOut' }, className: "relative z-10 w-full max-w-md", children: [_jsxs("div", { className: "glass rounded-2xl overflow-hidden corner-brackets", children: [_jsxs("div", { className: "px-8 pt-8 pb-6 text-center", children: [_jsxs(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.1, duration: 0.3 }, className: "relative w-16 h-16 mx-auto mb-4", children: [_jsx("div", { className: "absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-400/10 blur-xl animate-pulse-slow" }), _jsx("div", { className: "relative w-16 h-16 rounded-2xl bg-ink-900/80 border border-cyan-500/30 flex items-center justify-center", children: _jsx("span", { className: "font-display font-black text-2xl text-cyan-400 glow-cyan", children: "R" }) })] }), _jsx("h1", { className: "font-display font-bold text-xl text-cyan-200 tracking-wider glow-cyan", children: "RYANAI" }), _jsx("p", { className: "text-[10px] text-ink-500 font-mono tracking-widest uppercase mt-1", children: "Autonomous Reasoning Engine" }), _jsx("p", { className: "text-xs text-ink-500 mt-3", children: "Named after Mukhethwa Ryan Ganyane \u00B7 Built by Sir G" })] }), _jsx("div", { className: "px-8 pb-4", children: _jsxs("div", { className: "flex gap-1 p-1 bg-ink-800/50 rounded-xl border border-cyan-500/15", children: [_jsx("button", { onClick: () => { setMode('signin'); setError(''); setSuccess(''); }, className: `flex-1 py-2 rounded-lg text-xs font-medium transition-all ${mode === 'signin'
                                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                                : 'text-ink-500 hover:text-ink-300 border border-transparent'}`, children: "Sign In" }), _jsx("button", { onClick: () => { setMode('signup'); setError(''); setSuccess(''); }, className: `flex-1 py-2 rounded-lg text-xs font-medium transition-all ${mode === 'signup'
                                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                                : 'text-ink-500 hover:text-ink-300 border border-transparent'}`, children: "Create Account" })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "px-8 pb-8 space-y-4", children: [_jsx(AnimatePresence, { mode: "wait", children: mode === 'signup' && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "overflow-hidden", children: _jsxs("div", { className: "relative", children: [_jsx(User, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" }), _jsx("input", { type: "text", value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Full name (optional)", className: "w-full bg-ink-800/50 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" })] }) })) }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Email address", required: true, className: "w-full bg-ink-800/50 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" })] }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Password", required: true, className: "w-full bg-ink-800/50 border border-cyan-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-400 transition-colors", children: showPassword ? _jsx(EyeOff, { size: 15 }) : _jsx(Eye, { size: 15 }) })] }), _jsx(AnimatePresence, { children: mode === 'signup' && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "relative overflow-hidden", children: [_jsx(Lock, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "Confirm password", required: true, className: "w-full bg-ink-800/50 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" })] })) }), _jsx(AnimatePresence, { children: error && (_jsxs(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs", children: [_jsx(AlertCircle, { size: 13, className: "shrink-0" }), _jsx("span", { children: error })] })) }), _jsx(AnimatePresence, { children: success && (_jsxs(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs", children: [_jsx(CheckCircle2, { size: 13, className: "shrink-0" }), _jsx("span", { children: success })] })) }), _jsx("button", { type: "submit", disabled: loading || !email.trim() || !password.trim(), className: "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium text-sm btn-glow hover:bg-cyan-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed", children: loading ? (_jsx(Loader2, { size: 16, className: "animate-spin" })) : (_jsxs(_Fragment, { children: [mode === 'signin' ? 'Sign In' : 'Create Account', _jsx(ArrowRight, { size: 15 })] })) }), _jsxs("div", { className: "flex items-center gap-3 py-1", children: [_jsx("div", { className: "flex-1 h-px bg-cyan-500/15" }), _jsx("span", { className: "text-[10px] text-ink-600 font-mono uppercase tracking-wider", children: "or" }), _jsx("div", { className: "flex-1 h-px bg-cyan-500/15" })] }), _jsxs("button", { type: "button", onClick: handleGoogle, disabled: googleLoading, className: "w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-ink-800/50 border border-cyan-500/20 text-ink-200 font-medium text-sm hover:border-cyan-500/40 hover:bg-ink-800/70 transition-all disabled:opacity-50", children: [googleLoading ? (_jsx(Loader2, { size: 16, className: "animate-spin" })) : (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] })), "Continue with Google"] })] })] }), _jsx("p", { className: "text-center text-[10px] text-ink-600 font-mono mt-4", children: "RyanAI \u00B7 Built by Ntsiyeni Ganyane (Sir G) \u00B7 RMN Ganyane (Pty) Ltd" })] })] }));
}
