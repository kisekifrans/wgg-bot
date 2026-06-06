'use client';

import { useEffect, useState } from 'react';
import type { CustomCommand, StoreData } from '@/lib/types';
import { DiscordPreview } from './DiscordPreview';

export function CommandsPage() {
  const [commands, setCommands] = useState<CustomCommand[]>([]);
  const [editing, setEditing] = useState<CustomCommand | null | undefined>(undefined);
  const [form, setForm] = useState<Partial<CustomCommand>>({});
  const [toast, setToast] = useState('');

  const load = async () => {
    const res = await fetch('/api/store');
    if (res.ok) {
      const data: StoreData = await res.json();
      setCommands(data.customCommands);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const openNew = () => {
    setForm({
      name: 'thankyou',
      description: 'Send a thank you message',
      staffOnly: true,
      embed: { title: 'Thank You!', description: '', color: '#5865F2', footer: 'WGG Support' },
    });
    setEditing(null);
  };

  const openEdit = (cmd: CustomCommand) => {
    setForm({ ...cmd });
    setEditing(cmd);
  };

  const save = async () => {
    const isNew = !editing?.id;
    const url = isNew ? '/api/commands' : `/api/commands/${editing!.id}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      notify('Save failed');
      return;
    }
    notify('Command saved — re-registers on bot within ~15s');
    setEditing(undefined);
    load();
  };

  const remove = async () => {
    if (!editing?.id || !confirm('Delete command?')) return;
    await fetch(`/api/commands/${editing.id}`, { method: 'DELETE' });
    setEditing(undefined);
    load();
    notify('Deleted');
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Commands</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Slash commands like <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">/thankyou</code> that send embeds
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openNew}>+ New Command</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {commands.map((cmd) => (
          <button
            key={cmd.id}
            type="button"
            onClick={() => openEdit(cmd)}
            className="glass-card p-4 text-left transition hover:-translate-y-0.5"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">/{cmd.name}</h3>
              <span className="text-[10px] uppercase text-[var(--text-muted)]">{cmd.staffOnly ? 'staff' : 'all'}</span>
            </div>
            <DiscordPreview embed={cmd.embed} />
          </button>
        ))}
      </div>

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(undefined)} aria-label="Close" />
          <div className="glass-card relative w-full max-w-lg animate-slide-up p-5">
            <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit command' : 'New command'}</h2>
            <input className="input" placeholder="Command name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="input" placeholder="Embed title" value={form.embed?.title || ''} onChange={(e) => setForm({ ...form, embed: { ...form.embed!, title: e.target.value } })} />
            <textarea className="input min-h-[100px]" placeholder="Embed description" value={form.embed?.description || ''} onChange={(e) => setForm({ ...form, embed: { ...form.embed!, description: e.target.value } })} />
            <label className="mb-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.staffOnly !== false} onChange={(e) => setForm({ ...form, staffOnly: e.target.checked })} />
              Staff only
            </label>
            <div className="flex justify-end gap-2">
              {editing?.id && <button type="button" className="btn-danger" onClick={remove}>Delete</button>}
              <button type="button" className="btn-ghost" onClick={() => setEditing(undefined)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 right-6 glass-card px-4 py-3 text-sm">{toast}</div>}
    </>
  );
}
