'use client';

import { useEffect, useState } from 'react';
import type { Panel, StoreData } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { DiscordPreview } from './DiscordPreview';
import { PanelEditor } from './PanelEditor';

export function PanelsPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [editing, setEditing] = useState<Panel | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = async () => {
    const res = await fetch('/api/store');
    if (res.ok) setStore(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const savePanel = async (panel: Partial<Panel> & { id?: string }) => {
    const isNew = !panel.id || !store?.panels.find((p) => p.id === panel.id);
    const url = isNew ? '/api/panels' : `/api/panels/${panel.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(panel),
    });

    if (!res.ok) {
      const err = await res.json();
      notify(err.error || 'Save failed');
      return;
    }

    notify('Panel saved — bot syncs within ~15 seconds');
    setEditing(undefined);
    load();
  };

  const deletePanel = async (id: string) => {
    if (!confirm('Delete this panel?')) return;
    await fetch(`/api/panels/${id}`, { method: 'DELETE' });
    notify('Panel deleted');
    setEditing(undefined);
    load();
  };

  if (loading) {
    return <div className="glass-card p-8 text-center text-[var(--text-muted)]">Loading panels...</div>;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ticket Panels</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            One embed + one button per panel. Deploy in Discord with{' '}
            <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">/panel send</code>
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setEditing(null)}>
          + New Panel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {store?.panels.map((panel) => {
          const cat = CATEGORIES.find((c) => c.key === panel.categoryKey);
          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => setEditing(panel)}
              className="glass-card group p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{panel.name}</h3>
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                  {cat?.emoji} {cat?.label}
                </span>
              </div>
              <DiscordPreview embed={panel.embed} button={panel.button} />
              <div className="mt-3 font-mono text-[10px] text-[var(--text-muted)]">{panel.id}</div>
            </button>
          );
        })}
      </div>

      {editing !== undefined && (
        <PanelEditor
          panel={editing}
          onClose={() => setEditing(undefined)}
          onSave={savePanel}
          onDelete={editing?.id ? () => deletePanel(editing.id) : undefined}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 glass-card animate-slide-up px-4 py-3 text-sm">{toast}</div>
      )}
    </>
  );
}
