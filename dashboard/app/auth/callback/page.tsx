import { Suspense } from 'react';
import AuthCallbackContent from './AuthCallbackContent';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-sm text-neutral-400">
          Signing in…
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
