import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, CircleCheck as CheckCircle } from 'lucide-react';

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
    const result = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      if (isSignUp) await createProfile();
      navigate('/chat');
    }
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
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success-500/15 border border-success-500/30 mb-5">
            <CheckCircle size={26} className="text-success-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-50 mb-2">Check your email</h2>
          <p className="text-[14px] text-surface-400 mb-6 leading-relaxed">
            We sent a reset link to <span className="text-surface-200 font-medium">{email}</span>
          </p>
          <button
            onClick={() => { setResetMode(false); setResetSent(false); }}
            className="text-[13px] text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (resetMode) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/30 mb-4">
              <Sparkles size={20} className="text-primary-400" />
            </div>
            <h1 className="text-xl font-bold text-surface-50">Reset Password</h1>
            <p className="text-[13px] text-surface-500 mt-1">Enter your email to receive a reset link</p>
          </div>
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
            {error && (
              <div className="bg-error-500/10 border border-error-500/20 text-error-400 text-[13px] rounded-xl px-4 py-3 mb-5">{error}</div>
            )}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-surface-400 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-600 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-10 pr-4 py-3 text-[14px] text-surface-100 placeholder-surface-600 focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 rounded-xl transition-colors text-[14px]">
                Send Reset Link
              </button>
            </form>
            <div className="mt-5 text-center">
              <button onClick={() => { setResetMode(false); setError(null); }} className="text-[13px] text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-600/6 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl shadow-primary-500/25 mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">AdvutAI</h1>
          <p className="text-[14px] text-surface-500 mt-1">Your AI Operating System</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-7 shadow-2xl shadow-black/50">
          <h2 className="text-[17px] font-semibold text-surface-100 mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-[13px] text-surface-500 mb-6">
            {isSignUp ? 'Start your AI journey today' : 'Sign in to continue'}
          </p>

          {error && (
            <div className="bg-error-500/10 border border-error-500/20 text-error-400 text-[13px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-surface-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-600 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-10 pr-4 py-3 text-[14px] text-surface-100 placeholder-surface-600 focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-surface-400">Password</label>
                {!isSignUp && (
                  <button type="button" onClick={() => { setResetMode(true); setError(null); }}
                    className="text-[12px] text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-600 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-10 pr-12 py-3 text-[14px] text-surface-100 placeholder-surface-600 focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder={isSignUp ? 'Minimum 6 characters' : 'Enter your password'}
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-600 hover:text-surface-400 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-[14px] mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Please wait...
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-800 text-center">
            <span className="text-[13px] text-surface-500">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-[13px] text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up for free'}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-surface-700 mt-5">
          By continuing, you agree to AdvutAI's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
