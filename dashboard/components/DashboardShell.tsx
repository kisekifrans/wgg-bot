'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from './ThemeProvider';

const NAV = [
  { href: '/dashboard', label: 'Panels', icon: '◫' },
  { href: '/dashboard/commands', label: 'Commands', icon: '⌘' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<{ username?: string; avatar?: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
          return;
        }
        setUser(data);
      });
  }, [router]);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 p-4 md:p-6">
        <aside className="glass-card hidden w-64 shrink-0 flex-col p-4 md:flex">
          <div className="mb-8 px-2">
            <div className="text-lg font-bold tracking-tight text-accent">◈ WGG Ticket</div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Control Center</p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-2 border-t border-[var(--glass-border)] pt-4">
            {user && (
              <div className="flex items-center gap-3 px-2 py-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-9 w-9 rounded-full" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm">👤</div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{user.username || 'Admin'}</div>
                  <div className="text-xs text-[var(--text-muted)]">Server admin</div>
                </div>
              </div>
            )}
            <button type="button" onClick={toggle} className="btn-ghost w-full">
              {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
            </button>
            <button type="button" onClick={logout} className="btn-ghost w-full">
              Log out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
