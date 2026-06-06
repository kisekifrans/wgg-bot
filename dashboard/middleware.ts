import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Exclude /auth/callback — PKCE exchange must run without middleware touching cookies
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
