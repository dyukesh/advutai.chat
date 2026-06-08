import { getProviders } from 'next-auth/react';
import { SignInProviders } from '@/components/auth/SignInProviders';

export default async function SignInPage() {
  const providers = await getProviders();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/90 p-10 shadow-soft backdrop-blur">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">AdvutAI</p>
          <h1 className="text-4xl font-semibold">Welcome back</h1>
          <p className="text-sm leading-6 text-slate-400">
            Sign in to continue to your personal AI workspace, memory brain, and productivity dashboard.
          </p>
        </div>

        <div className="mt-10">
          <SignInProviders providers={providers} />
        </div>
      </div>
    </main>
  );
}
