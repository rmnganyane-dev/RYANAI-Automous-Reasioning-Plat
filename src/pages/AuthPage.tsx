import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Copy, Check } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (email: string, fullName?: string) => void;
}

export default function AuthPage({ onSignIn }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [method, setMethod] = useState<'email' | 'github' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSignIn(email, fullName || undefined);
    }
  };

  const handleGithubLogin = () => {
    // In production, would redirect to GitHub OAuth
    const githubEmail = 'user@github.com';
    onSignIn(githubEmail, 'GitHub User');
  };

  const handleDemoLogin = () => {
    onSignIn('demo@ryanai.com', 'Demo User');
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText('RYANAI-DEMO-2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-ink-950 via-slate-900 to-ink-950 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-auto px-6 relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <span className="font-display font-black text-ink-950 text-2xl">R</span>
          </div>
          <h1 className="font-display text-3xl font-black text-cyan-300 tracking-wider mb-2">RYANAI</h1>
          <p className="text-sm text-ink-400">Autonomous Reasoning Platform</p>
        </motion.div>

        {/* Auth methods */}
        {!method ? (
          <motion.div className="space-y-3">
            <button
              onClick={handleDemoLogin}
              className="w-full px-4 py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-semibold transition-all duration-200"
            >
              🚀 Try Demo
            </button>

            <button
              onClick={() => setMethod('email')}
              className="w-full px-4 py-3 rounded-lg bg-ink-800/50 hover:bg-ink-800/70 border border-cyan-500/20 text-ink-100 font-semibold transition-all duration-200"
            >
              📧 Sign In with Email
            </button>

            <button
              onClick={() => setMethod('github')}
              className="w-full px-4 py-3 rounded-lg bg-ink-800/50 hover:bg-ink-800/70 border border-cyan-500/20 text-ink-100 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Github size={18} />
              Sign In with GitHub
            </button>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/15 mt-6"
            >
              <h3 className="text-sm font-semibold text-cyan-300 mb-2">✨ New to RyanAI?</h3>
              <p className="text-xs text-ink-400 leading-relaxed mb-3">
                Experience autonomous reasoning with our demo. No setup required.
              </p>
              <div className="flex items-center gap-2 p-2 bg-ink-800/50 rounded">
                <code className="text-xs text-purple-300 font-mono flex-1 overflow-x-auto">
                  RYANAI-DEMO-2026
                </code>
                <button
                  onClick={copyInviteCode}
                  className="p-1.5 rounded hover:bg-cyan-500/10 text-cyan-400"
                  title="Copy code"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : method === 'email' ? (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-mono text-ink-500 mb-2">Full Name (optional)</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-ink-800/50 border border-cyan-500/20 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-ink-500 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-ink-800/50 border border-cyan-500/20 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!email}
              className="w-full px-4 py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 border border-cyan-500/30 text-cyan-300 font-semibold transition-all duration-200"
            >
              Continue →
            </button>

            <button
              type="button"
              onClick={() => setMethod(null)}
              className="w-full px-4 py-2 rounded-lg text-ink-400 hover:text-ink-300 text-sm transition-colors"
            >
              ← Back
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <button
              onClick={handleGithubLogin}
              className="w-full px-4 py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-semibold transition-all duration-200"
            >
              Authorize GitHub
            </button>

            <button
              onClick={() => setMethod(null)}
              className="w-full px-4 py-2 rounded-lg text-ink-400 hover:text-ink-300 text-sm transition-colors"
            >
              ← Back
            </button>

            <p className="text-xs text-ink-600 text-center">
              You'll be redirected to GitHub to authorize access.
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-cyan-500/10 text-center space-y-2"
        >
          <p className="text-xs text-ink-600">
            By signing in, you agree to our Terms of Service
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Learn more <ExternalLink size={12} />
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
