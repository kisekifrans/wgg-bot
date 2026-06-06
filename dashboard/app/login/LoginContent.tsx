'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/dashboard';
    });
  }, []);

  const login = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 animate-float rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 animate-float rounded-full bg-emerald-500/10 blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="glass-card relative w-full max-w-md animate-slide-up p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-2xl text-accent">◈</div>
        <h1 className="text-2xl font-bold tracking-tight">WGG Ticket</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Sign in with Discord to manage panels, welcome messages, and custom commands.
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Only server owner & administrators can access.</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">Login failed. Try again.</p>
        )}

        <button type="button" onClick={login} className="btn-primary mt-8 w-full py-3">
          Continue with Discord
        </button>
      </div>
    </div>
  );
}
