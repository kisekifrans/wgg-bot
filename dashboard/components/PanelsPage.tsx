'use client';

import { useEffect, useState } from 'react';
import type { Panel, StoreData } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { DiscordPreview } from './DiscordPreview';
import { PanelEditor } from './PanelEditor';
import { PageHeader } from './PageHeader';
import { Toast } from './Toast';
import { LoadingGrid } from './LoadingGrid';
import { IconPlus } from './icons';

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

  useEffect(() => { load(); }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const savePanel = async (panel: Partial<Panel> & { id?: string }) => {
    const isNew = !panel.id || !store?.panels.find((p) => p.id === panel.id);
    const res = await fetch(isNew ? '/api/panels' : `/api/panels/${panel.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(panel),
    });
    if (!res.ok) {
      notify((await res.json()).error || 'Save failed');
      return;
    }
    notify('Panel saved — bot syncs in ~15s');
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

  return (
    <>
      <PageHeader
        title="Ticket Panels"
        subtitle={
          <>
            One embed + one button per panel. Deploy in Discord with{' '}
            <code className="code-inline">/panel send</code>
          </>
        }
        action={
          <button type="button" className="btn-primary" onClick={() => setEditing(null)}>
            <IconPlus />
            New Panel
          </button>
        }
      />

      {loading ? (
        <LoadingGrid count={5} />
      ) : store?.panels.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-14 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--text-muted)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" />
              <rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" />
            </svg>
          </div>
          <p className="font-display text-base font-medium">No panels yet</p>
          <p className="hint mt-1 max-w-sm">Create your first ticket panel to get started.</p>
          <button type="button" className="btn-primary mt-6" onClick={() => setEditing(null)}>
            Create panel
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {store?.panels.map((panel) => {
            const cat = CATEGORIES.find((c) => c.key === panel.categoryKey);
            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setEditing(panel)}
                className="glass-card-interactive group p-4 text-left"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold tracking-tight">{panel.name}</h3>
                  <span className="badge shrink-0">
                    {cat?.emoji} {cat?.label}
                  </span>
                </div>
                <DiscordPreview
                  variant="panel"
                  embed={panel.embed}
                  button={panel.button}
                  label="Panel"
                />
                <div className="mt-3 font-mono text-[10px] text-[var(--text-muted)] opacity-60 group-hover:opacity-100">
                  {panel.id}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editing !== undefined && (
        <PanelEditor
          panel={editing}
          onClose={() => setEditing(undefined)}
          onSave={savePanel}
          onDelete={editing?.id ? () => deletePanel(editing.id) : undefined}
        />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}
