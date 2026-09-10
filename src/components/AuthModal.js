import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Chrome, Eye, EyeOff, Loader2, Lock, Mail, PanelsTopLeft, Phone, ShieldCheck, User, X, } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
export default function AuthModal({ isOpen, onClose, onSuccess, dismissible = true }) {
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [oauthProvider, setOauthProvider] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    useEffect(() => {
        if (!isOpen)
            return;
        setError('');
        setSuccess('');
    }, [isOpen]);
    if (!isOpen)
        return null;
    const resetFeedback = () => {
        setError('');
        setSuccess('');
    };
    const complete = () => {
        onSuccess();
        onClose();
    };
    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        resetFeedback();
        if (!isSupabaseConfigured) {
            setError('Authentication is not configured. Add Supabase values to .env.local.');
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || password.length < 6) {
            setError('Enter a valid email and a password with at least 6 characters.');
            return;
        }
        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: normalizedEmail,
                    password,
                    options: { data: { full_name: fullName.trim() || undefined } },
                });
                if (signUpError)
                    throw signUpError;
                if (data.session) {
                    complete();
                }
                else {
                    setMode('signin');
                    setPassword('');
                    setConfirmPassword('');
                    setSuccess('Account created. Check your email to confirm your account, then sign in.');
                }
            }
            else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password,
                });
                if (signInError)
                    throw signInError;
                complete();
            }
        }
        catch (authError) {
            setError(authError instanceof Error ? authError.message : 'Authentication failed.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleOAuth = async (provider) => {
        resetFeedback();
        if (!isSupabaseConfigured) {
            setError('Authentication is not configured. Add Supabase values to .env.local.');
            return;
        }
        setOauthProvider(provider);
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin },
        });
        if (oauthError) {
            setError(oauthError.message);
            setOauthProvider(null);
        }
    };
    const handlePhoneSubmit = async (event) => {
        event.preventDefault();
        resetFeedback();
        if (!isSupabaseConfigured) {
            setError('Authentication is not configured. Add Supabase values to .env.local.');
            return;
        }
        const normalizedPhone = phone.trim();
        if (!normalizedPhone) {
            setError('Enter your phone number in international format.');
            return;
        }
        setLoading(true);
        try {
            if (!otpSent) {
                const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
                if (otpError)
                    throw otpError;
                setOtpSent(true);
                setSuccess('Verification code sent. Enter it below.');
            }
            else {
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    phone: normalizedPhone,
                    token: otp.trim(),
                    type: 'sms',
                });
                if (verifyError)
                    throw verifyError;
                complete();
            }
        }
        catch (authError) {
            setError(authError instanceof Error ? authError.message : 'Phone verification failed.');
        }
        finally {
            setLoading(false);
        }
    };
    const switchMode = (nextMode) => {
        setMode(nextMode);
        setOtpSent(false);
        setOtp('');
        resetFeedback();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md", children: _jsxs("div", { className: "relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-cyan-500/20 bg-slate-900 shadow-2xl shadow-cyan-500/10", children: [_jsx("div", { className: "absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" }), dismissible && (_jsx("button", { onClick: onClose, className: "absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white", "aria-label": "Close authentication", children: _jsx(X, { size: 18 }) })), _jsxs("div", { className: "p-7 sm:p-8", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400", children: _jsx(ShieldCheck, { size: 24 }) }), _jsx("h2", { className: "font-display text-lg font-bold tracking-wide text-white", children: mode === 'signup' ? 'Create your RyanAI account' : 'Sign in to RyanAI' }), _jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Secure access to your threads and persistent memory." })] }), _jsx("div", { className: "mb-5 grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1", children: ['signin', 'signup', 'phone'].map((item) => (_jsx("button", { type: "button", onClick: () => switchMode(item), className: `rounded-lg py-2 text-[11px] font-medium transition-colors ${mode === item ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-500 hover:text-slate-200'}`, children: item === 'signin' ? 'Sign In' : item === 'signup' ? 'Create Account' : 'Phone OTP' }, item))) }), _jsxs("div", { className: "space-y-2.5", children: [_jsxs("button", { type: "button", onClick: () => handleOAuth('google'), disabled: loading || oauthProvider !== null, className: "flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-500/40 hover:bg-slate-800 disabled:opacity-50", children: [oauthProvider === 'google' ? _jsx(Loader2, { size: 16, className: "animate-spin" }) : _jsx(Chrome, { size: 16, className: "text-blue-400" }), "Continue with Google"] }), _jsxs("button", { type: "button", onClick: () => handleOAuth('azure'), disabled: loading || oauthProvider !== null, className: "flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500/40 hover:bg-slate-800 disabled:opacity-50", children: [oauthProvider === 'azure' ? _jsx(Loader2, { size: 16, className: "animate-spin" }) : _jsx(PanelsTopLeft, { size: 16, className: "text-blue-300" }), "Continue with Microsoft"] })] }), _jsxs("div", { className: "my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-slate-600", children: [_jsx("span", { className: "h-px flex-1 bg-slate-800" }), _jsx("span", { children: mode === 'phone' ? 'phone verification' : 'or email' }), _jsx("span", { className: "h-px flex-1 bg-slate-800" })] }), mode === 'phone' ? (_jsxs("form", { onSubmit: handlePhoneSubmit, className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Phone, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" }), _jsx("input", { type: "tel", value: phone, onChange: (event) => setPhone(event.target.value), placeholder: "+27 82 123 4567", required: true, className: "w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500" })] }), otpSent && (_jsx("input", { inputMode: "numeric", autoComplete: "one-time-code", value: otp, onChange: (event) => setOtp(event.target.value), placeholder: "Verification code", required: true, className: "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500" })), _jsxs("button", { type: "submit", disabled: loading, className: "flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/25 disabled:opacity-50", children: [loading ? _jsx(Loader2, { size: 16, className: "animate-spin" }) : _jsx(ArrowRight, { size: 16 }), otpSent ? 'Verify code' : 'Send phone code'] }), _jsx("p", { className: "text-center text-[10px] text-slate-600", children: "Supabase sends this code through your configured phone provider." })] })) : (_jsxs("form", { onSubmit: handleEmailSubmit, className: "space-y-4", children: [mode === 'signup' && (_jsxs("div", { className: "relative", children: [_jsx(User, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" }), _jsx("input", { type: "text", value: fullName, onChange: (event) => setFullName(event.target.value), placeholder: "Full name", className: "w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500" })] })), _jsxs("div", { className: "relative", children: [_jsx(Mail, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" }), _jsx("input", { type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "Email address", required: true, className: "w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500" })] }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (event) => setPassword(event.target.value), placeholder: "Password", required: true, className: "w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 pr-11 text-sm text-slate-100 outline-none focus:border-cyan-500" }), _jsx("button", { type: "button", onClick: () => setShowPassword((visible) => !visible), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300", "aria-label": showPassword ? 'Hide password' : 'Show password', children: showPassword ? _jsx(EyeOff, { size: 15 }) : _jsx(Eye, { size: 15 }) })] }), mode === 'signup' && (_jsx("input", { type: showPassword ? 'text' : 'password', value: confirmPassword, onChange: (event) => setConfirmPassword(event.target.value), placeholder: "Confirm password", required: true, className: "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500" })), _jsxs("button", { type: "submit", disabled: loading, className: "flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/25 disabled:opacity-50", children: [loading ? _jsx(Loader2, { size: 16, className: "animate-spin" }) : _jsx(ArrowRight, { size: 16 }), mode === 'signup' ? 'Create account' : 'Sign in'] })] })), error && _jsxs("div", { className: "mt-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300", children: [_jsx(AlertCircle, { size: 14, className: "mt-0.5 shrink-0" }), error] }), success && _jsxs("div", { className: "mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300", children: [_jsx(CheckCircle2, { size: 14, className: "mt-0.5 shrink-0" }), success] })] })] }) }));
}
