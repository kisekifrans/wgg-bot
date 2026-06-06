'use client';

import { Suspense } from 'react';
import LoginContent from './LoginContent';
import { AppBackground } from '@/components/AppBackground';

function LoginFallback() {
  return (
    <>
      <AppBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="skeleton h-8 w-32 rounded-xl" />
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

