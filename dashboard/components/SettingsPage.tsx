'use client';

import { useEffect, useState } from 'react';

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
      setTimeout(() => setToast(''), 3000);
    }
  };

  const next = counter + 1;

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>

      <div className="glass-card mb-4 max-w-lg p-6">
        <h2 className="font-semibold">Ticket counter</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Next ticket: <strong className="text-[var(--text-primary)]">wgg-ticket-{String(next).padStart(4, '0')}</strong>
        </p>
        <label className="label mt-4">Current counter</label>
        <input type="number" className="input max-w-xs" min={0} value={counter} onChange={(e) => setCounter(Number(e.target.value))} />
        <button type="button" className="btn-primary mt-3" onClick={save}>Save counter</button>
      </div>

      <div className="glass-card max-w-lg p-6">
        <h2 className="font-semibold">Discord commands</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
          <li><code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">/panel send panel:&lt;id&gt;</code> — deploy one panel</li>
          <li><code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">/panel send-all</code> — deploy all panels</li>
          <li><code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">/panel list</code> — list panel IDs</li>
        </ul>
      </div>

      {toast && <div className="fixed bottom-6 right-6 glass-card px-4 py-3 text-sm">{toast}</div>}
    </>
  );
}
