'use client';

import { useEffect, useState } from 'react';
import type { CustomCommand, StoreData } from '@/lib/types';
import { DiscordPreview } from './DiscordPreview';
import { EmbedGuide } from './EmbedGuide';
import { PageHeader } from './PageHeader';
import { Toast } from './Toast';
import { LoadingGrid } from './LoadingGrid';
import { IconPlus, IconClose } from './icons';

export function CommandsPage() {
  const [commands, setCommands] = useState<CustomCommand[]>([]);
  const [editing, setEditing] = useState<CustomCommand | null | undefined>(undefined);
  const [form, setForm] = useState<Partial<CustomCommand>>({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch('/api/store');
    if (res.ok) {
      const data: StoreData = await res.json();
      setCommands(data.customCommands);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const openNew = () => {
    setForm({
      name: 'thankyou',
      description: 'Send a thank you message',
      staffOnly: true,
      embed: { title: 'Thank You!', description: 'Thank you for contacting WGG Support!', color: '#5865F2', footer: 'WGG Support' },
    });
    setEditing(null);
  };

  const save = async () => {
    const isNew = !editing?.id;
    const res = await fetch(isNew ? '/api/commands' : `/api/commands/${editing!.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) { notify('Save failed'); return; }
    notify('Command saved — re-registers in ~15s');
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

  const updateEmbed = (field: string, value: string) => {
    setForm({
      ...form,
      embed: { ...form.embed!, [field]: value },
    });
  };

  return (
    <>
      <PageHeader
        title="Custom Commands"
        subtitle={
          <>
            Slash commands like <code className="code-inline">/thankyou</code> that send embed messages in tickets
          </>
        }
        action={
          <button type="button" className="btn-primary" onClick={openNew}>
            <IconPlus />
            New Command
          </button>
        }
      />

      {loading ? (
        <LoadingGrid count={3} />
      ) : commands.length === 0 ? (
        <div className="glass-card flex flex-col items-center p-12 text-center">
          <p className="font-display text-lg font-medium">No commands yet</p>
          <p className="hint mt-1">Add /thankyou or other staff shortcuts.</p>
          <button type="button" className="btn-primary mt-6" onClick={openNew}>Create command</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {commands.map((cmd) => (
            <button
              key={cmd.id}
              type="button"
              onClick={() => { setForm({ ...cmd }); setEditing(cmd); }}
              className="glass-card-interactive p-4 text-left"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display font-semibold">/{cmd.name}</h3>
                <span className={`badge ${cmd.staffOnly ? 'badge-accent' : ''}`}>
                  {cmd.staffOnly ? 'staff' : 'public'}
                </span>
              </div>
              <DiscordPreview variant="command" embed={cmd.embed} label={`/${cmd.name}`} />
              <p className="hint mt-2 line-clamp-1">{cmd.description}</p>
            </button>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <div className="modal-overlay" onClick={() => setEditing(undefined)} role="presentation">
          <div className="modal-panel max-w-5xl" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {editing ? `Edit /${editing.name}` : 'New command'}
                </h2>
                <p className="hint mt-0.5">Registered as a Discord slash command in ticket channels</p>
              </div>
              <button type="button" onClick={() => setEditing(undefined)} className="btn-icon" aria-label="Close">
                <IconClose />
              </button>
            </div>

            <div className="grid max-h-[calc(90vh-140px)] gap-6 overflow-y-auto p-6 xl:grid-cols-2">
              <div className="space-y-4">
                <div className="glass-inset p-4">
                  <p className="section-title">Command</p>
                  <label className="label">Name</label>
                  <input className="input" placeholder="thankyou" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value.replace(/\s/g, '').toLowerCase() })} />
                  <p className="hint mt-1">Becomes <code className="code-inline">/{form.name || 'name'}</code> in Discord</p>
                  <label className="label mt-3">Description</label>
                  <input className="input" placeholder="Shown in Discord slash command list" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" className="accent-[var(--accent)]" checked={form.staffOnly !== false} onChange={(e) => setForm({ ...form, staffOnly: e.target.checked })} />
                    Staff only (hidden from regular members)
                  </label>
                </div>

                <div className="glass-inset p-4">
                  <p className="section-title">Embed message</p>
                  <label className="label">Title</label>
                  <input className="input" value={form.embed?.title || ''} onChange={(e) => updateEmbed('title', e.target.value)} />
                  <label className="label mt-3">Description</label>
                  <textarea
                    className="input min-h-[140px]"
                    placeholder="Supports **bold**, *italic*, mentions, emojis…"
                    value={form.embed?.description || ''}
                    onChange={(e) => updateEmbed('description', e.target.value)}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Color</label>
                      <input type="color" className="input h-10 cursor-pointer p-1" value={form.embed?.color || '#5865F2'} onChange={(e) => updateEmbed('color', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Footer</label>
                      <input className="input" value={form.embed?.footer || ''} onChange={(e) => updateEmbed('footer', e.target.value)} />
                    </div>
                  </div>
                </div>

                <EmbedGuide variant="command" />
              </div>

              <div className="space-y-4 xl:sticky xl:top-0 xl:self-start">
                <div>
                  <p className="label mb-2">Live preview</p>
                  <p className="hint mb-2">How the embed appears when staff runs the command.</p>
                  <DiscordPreview
                    variant="command"
                    embed={form.embed || {}}
                    label={form.name ? `/${form.name}` : '/command'}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[var(--glass-border)] px-6 py-4">
              {editing?.id && <button type="button" className="btn-danger" onClick={remove}>Delete</button>}
              <div className="flex-1" />
              <button type="button" className="btn-ghost" onClick={() => setEditing(undefined)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={save}>Save command</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}
