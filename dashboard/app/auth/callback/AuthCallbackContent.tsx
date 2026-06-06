'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Signing in…');

  useEffect(() => {
    const code = searchParams.get('code');
    const authError = searchParams.get('error_description') || searchParams.get('error');

    if (authError) {
      router.replace(`/login?error=auth`);
      return;
    }

    if (!code) {
      router.replace('/login?error=auth');
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error('auth callback:', error.message);
        setMessage('Login failed, redirecting…');
        router.replace('/login?error=auth');
        return;
      }
      router.replace('/dashboard');
    });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-sm text-neutral-400">
      {message}
    </div>
  );
}
