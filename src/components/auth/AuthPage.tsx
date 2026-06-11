import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, CircleCheck as CheckCircle, X, ExternalLink } from 'lucide-react';

const PROJECT_REF = 'zixvbyxxfodrfkdqixjn';

type OAuthProvider = 'google' | 'github';

function OAuthSetupModal({ provider, onClose, onProceed }: { provider: OAuthProvider; onClose: () => void; onProceed: () => void }) {
  const isGoogle = provider === 'google';

  const steps = isGoogle ? [
    { step: '1', title: 'Create Google OAuth credentials', desc: 'Go to console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID' },
    { step: '2', title: 'Set authorized redirect URI', desc: `Add: https://${PROJECT_REF}.supabase.co/auth/v1/callback` },
    { step: '3', title: 'Enable Google in Supabase', desc: 'Go to your Supabase dashboard → Authentication → Providers → Google, paste Client ID & Secret' },
  ] : [
    { step: '1', title: 'Create a GitHub OAuth App', desc: 'Go to github.com → Settings → Developer settings → OAuth Apps → New OAuth App' },
    { step: '2', title: 'Set callback URL', desc: `Authorization callback URL: https://${PROJECT_REF}.supabase.co/auth/v1/callback` },
    { step: '3', title: 'Enable GitHub in Supabase', desc: 'Go to your Supabase dashboard → Authentication → Providers → GitHub, paste Client ID & Secret' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-surface-800">
          <div className="flex items-center gap-2.5">
            {isGoogle ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" className="fill-blue-400"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" className="fill-green-400"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" className="fill-yellow-400"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" className="fill-red-400"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-surface-200">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            <h3 className="text-[15px] font-semibold text-surface-100">
              Setup {isGoogle ? 'Google' : 'GitHub'} Login
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-surface-500 hover:text-surface-300 rounded-lg hover:bg-surface-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-[13px] text-surface-400 mb-5 leading-relaxed">
            {isGoogle ? 'Google' : 'GitHub'} sign-in needs a one-time setup in your Supabase dashboard. Follow these steps:
          </p>

          <div className="space-y-4 mb-6">
            {steps.map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary-400 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-surface-200 mb-0.5">{s.title}</p>
                  <p className="text-[12px] text-surface-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface-800 rounded-xl p-3 mb-5 flex items-start gap-2">
            <div className="text-[11px] text-surface-400 leading-relaxed font-mono break-all">
              Redirect URI: https://{PROJECT_REF}.supabase.co/auth/v1/callback
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-[13px] font-semibold rounded-xl transition-colors"
            >
              Open Supabase Dashboard <ExternalLink size={13} />
            </a>
            <button
              onClick={onProceed}
              className="px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-[13px] font-medium rounded-xl transition-colors whitespace-nowrap"
            >
              Try anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [setupModal, setSetupModal] = useState<OAuthProvider | null>(null);
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

  const handleOAuth = async (provider: OAuthProvider) => {
    setOauthLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/chat` },
    });
    setOauthLoading(null);
    if (error) {
      setError(error.message);
    }
  };

  const handleOAuthClick = (provider: OAuthProvider) => {
    // Show setup guide since providers are not yet configured
    setSetupModal(provider);
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
          <button onClick={() => { setResetMode(false); setResetSent(false); }}
            className="text-[13px] text-primary-400 hover:text-primary-300 font-medium transition-colors">
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
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-10 pr-4 py-3 text-[14px] text-surface-100 placeholder-surface-600 focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="you@example.com" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 rounded-xl transition-colors text-[14px]">
                Send Reset Link
              </button>
            </form>
            <div className="mt-5 text-center">
              <button onClick={() => { setResetMode(false); setError(null); }}
                className="text-[13px] text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {setupModal && (
        <OAuthSetupModal
          provider={setupModal}
          onClose={() => setSetupModal(null)}
          onProceed={() => { setSetupModal(null); handleOAuth(setupModal); }}
        />
      )}

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
            <p className="text-[13px] text-surface-500 mb-5">
              {isSignUp ? 'Start your AI journey today' : 'Sign in to continue'}
            </p>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => handleOAuthClick('google')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 hover:border-surface-600 rounded-xl text-[13px] font-medium text-surface-200 transition-all disabled:opacity-50"
              >
                {oauthLoading === 'google' ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" className="fill-blue-400"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" className="fill-green-400"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" className="fill-yellow-400"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" className="fill-red-400"/>
                  </svg>
                )}
                Google
              </button>
              <button
                onClick={() => handleOAuthClick('github')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 hover:border-surface-600 rounded-xl text-[13px] font-medium text-surface-200 transition-all disabled:opacity-50"
              >
                {oauthLoading === 'github' ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-surface-300">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                )}
                GitHub
              </button>
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface-900 text-[12px] text-surface-600">or continue with email</span>
              </div>
            </div>

            {error && (
              <div className="bg-error-500/10 border border-error-500/20 text-error-400 text-[13px] rounded-xl px-4 py-3 mb-4 leading-relaxed">
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
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-[14px]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                    </svg>
                    Please wait...
                  </>
                ) : (
                  <>{isSignUp ? 'Create Account' : 'Sign In'}<ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-surface-800 text-center">
              <span className="text-[13px] text-surface-500">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-[13px] text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                {isSignUp ? 'Sign in' : 'Sign up for free'}
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-surface-700 mt-5">
            By continuing, you agree to AdvutAI's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </>
  );
}
