'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import type { ClientSafeProvider } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SignInProvidersProps {
  providers: Record<string, ClientSafeProvider> | null;
}

export function SignInProviders({ providers }: SignInProvidersProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      setStatus('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setStatus('Sending sign-in link...');

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      });

      if (!result) {
        // Fallback to redirect-based email sign-in if the non-redirect flow returns an unexpected response.
        await signIn('email', { email, redirect: true });
        return;
      }

      if (result.error) {
        if (result.error === 'Missing email' || result.error === 'Email not configured') {
          setStatus('Email sign-in is not configured. Check your environment variables.');
        } else {
          setStatus('Unable to send link. Please double-check your email.');
        }
      } else {
        setStatus('Check your email for the sign-in link.');
      }
    } catch (error) {
      console.error('Sign-in error', error);
      setStatus('Sign-in failed. Trying full redirect flow...');
      await signIn('email', { email, redirect: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {providers ? (
          Object.values(providers)
            .filter((provider) => provider.id !== 'email')
            .map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="default"
                className="w-full"
                onClick={() => signIn(provider.id)}
              >
                Sign in with {provider.name}
              </Button>
            ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
            No sign-in providers are configured.
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <p className="mb-4 text-sm text-slate-300">
          Or sign in with your email. If you don’t have an account yet, this will create one automatically.
        </p>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-300" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Sending link…' : 'Send magic link'}
          </Button>
        </form>
        {status ? <p className="mt-4 text-sm text-slate-300">{status}</p> : null}
      </div>
    </div>
  );
}
