import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signUp, signIn } = useAppStore();
  const navigate = useNavigate();

  const createProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      if (isSignUp) await createProfile();
      navigate('/chat');
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'azure') => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/chat` },
    });
    if (error) setError(error.message);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email address'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) { setError(error.message); return; }
    setResetSent(true);
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 mb-4">
            <Mail size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-surface-50 mb-2">Check your email</h2>
          <p className="text-surface-400 mb-6">We sent a password reset link to {email}</p>
          <button onClick={() => { setResetMode(false); setResetSent(false); }} className="text-primary-400 hover:text-primary-300 text-sm font-medium">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (resetMode) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 mb-4 animate-float">
              <Sparkles size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-50">Reset Password</h1>
            <p className="text-surface-400 mt-1">Enter your email to receive a reset link</p>
          </div>
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
            {error && <div className="bg-error-500/10 border border-error-500/20 text-error-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    placeholder="you@example.com" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors">Send Reset Link</button>
            </form>
            <div className="mt-4 text-center text-sm text-surface-400">
              <button onClick={() => setResetMode(false)} className="text-primary-400 hover:text-primary-300 font-medium">Back to sign in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 mb-4 animate-float">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-50">AdvutAI</h1>
          <p className="text-surface-400 mt-1">Your AI Operating System</p>
        </div>

        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-surface-100 mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-surface-400 mb-6">
            {isSignUp ? 'Start your AI journey today' : 'Sign in to continue'}
          </p>

          {error && (
            <div className="bg-error-500/10 border border-error-500/20 text-error-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
          )}

          {/* OAuth buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm text-surface-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button onClick={() => handleOAuth('github')} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm text-surface-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
            <button onClick={() => handleOAuth('azure')} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm text-surface-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#00A4EF"><path d="M5.483 21.3H24L14.025 4.022l-3.038 8.347 5.836 6.938L4.45 22.661zm-1.6-1.6L9.37 7.89 4.967 1.2H0l3.883 18.5z"/></svg>
              Microsoft
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-surface-900 px-2 text-surface-500">or continue with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  placeholder="Enter your password" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button type="button" onClick={() => setResetMode(true)} className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors">
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-primary-400 hover:text-primary-300 font-medium">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-surface-600 mt-6">
          By continuing, you agree to AdvutAI's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
