'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from './ThemeProvider';
import { AppBackground } from './AppBackground';
import { WggLogo } from './WggLogo';
import { IconPanels, IconCommands, IconSettings, IconSun, IconMoon } from './icons';

const NAV = [
  { href: '/dashboard', label: 'Panels', Icon: IconPanels },
  { href: '/dashboard/commands', label: 'Commands', Icon: IconCommands },
  { href: '/dashboard/settings', label: 'Settings', Icon: IconSettings },
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
    <>
      <AppBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row md:gap-5 md:p-5 lg:p-6">
        <aside className="glass-card hidden w-[248px] shrink-0 flex-col p-2.5 md:flex">
          <div className="mb-5 px-2.5 pt-2">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <WggLogo size="sm" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold tracking-tight">WGG Ticket</div>
                <div className="text-[10px] tracking-wide text-[var(--text-muted)]">Control panel</div>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-1">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${pathname === href ? 'active' : ''}`}
              >
                <Icon className="shrink-0 opacity-70" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-0.5 border-t border-[var(--glass-border)] p-2 pt-3">
            {user && (
              <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-7 w-7 rounded-full ring-1 ring-[var(--glass-border)]" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)] text-[10px]">?</div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{user.username || 'Admin'}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Administrator</div>
                </div>
              </div>
            )}
            <button type="button" onClick={toggle} className="btn-ghost w-full justify-start gap-2.5 px-3 py-2 text-xs">
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button type="button" onClick={logout} className="btn-ghost w-full justify-start px-3 py-2 text-xs text-[var(--text-muted)]">
              Log out
            </button>
          </div>
        </aside>

        <header className="glass-card flex items-center justify-between px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <WggLogo size="xs" />
            <span className="font-display text-sm font-semibold">WGG Ticket</span>
          </div>
          <button type="button" onClick={toggle} className="btn-icon" aria-label="Toggle theme">
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </header>

        <main className="min-w-0 flex-1 animate-fade-in px-4 pb-24 pt-2 md:p-0 md:pb-0 md:pt-1">{children}</main>

        <nav className="glass-card fixed bottom-3 left-3 right-3 flex justify-around p-1 md:hidden">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-all duration-200 ${
                pathname === href
                  ? 'bg-[var(--glass-bg-strong)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
