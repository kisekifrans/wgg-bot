'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from './PageHeader';
import { Toast } from './Toast';

export function SettingsPage() {
  const [counter, setCounter] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((d) => setCounter(d.ticketCounter ?? 0));
  }, []);

  const save = async () => {
    const res = await fetch('/api/store', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketCounter: counter }),
    });
    if (res.ok) {
      setToast('Counter saved');
      setTimeout(() => setToast(''), 3200);
    }
  };

  const next = counter + 1;

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Ticket numbering and Discord deployment reference"
      />

      <div className="grid max-w-2xl gap-4">
        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-sm font-semibold">Ticket counter</h2>
              <p className="hint mt-1">Global sequence across all categories</p>
            </div>
            <div className="glass-inset px-4 py-2.5 text-center">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Next</div>
              <div className="stat-value text-base">
                wgg-ticket-{String(next).padStart(4, '0')}
              </div>
            </div>
          </div>
          <label className="label mt-5">Current counter</label>
          <div className="flex flex-wrap gap-3">
            <input type="number" className="input max-w-[140px]" min={0} value={counter} onChange={(e) => setCounter(Number(e.target.value))} />
            <button type="button" className="btn-primary" onClick={save}>Save</button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold">Discord commands</h2>
          <p className="hint mt-1 mb-4">Run in your server to deploy panels</p>
          <div className="space-y-2">
            {[
              ['/panel send panel:<id>', 'Deploy one panel'],
              ['/panel send-all', 'Deploy all panels'],
              ['/panel list', 'List panel IDs'],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="glass-inset flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <code className="code-inline">{cmd}</code>
                <span className="text-[11px] text-[var(--text-muted)]">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold">Infrastructure</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              { name: 'Vercel', role: 'Dashboard' },
              { name: 'Supabase', role: 'Database' },
              { name: 'Fly.io', role: 'Bot 24/7' },
            ].map((item) => (
              <div key={item.name} className="glass-inset p-3">
                <div className="font-display text-sm font-medium">{item.name}</div>
                <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">{item.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} />}
    </>
  );
}
