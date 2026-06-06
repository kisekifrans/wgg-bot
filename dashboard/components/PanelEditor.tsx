'use client';

import { useState } from 'react';
import type { Panel } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { DiscordPreview } from './DiscordPreview';

type Props = {
  panel: Panel | null;
  onClose: () => void;
  onSave: (panel: Partial<Panel>) => void;
  onDelete?: () => void;
};

const defaultPanel: Partial<Panel> = {
  name: 'New Panel',
  categoryKey: 'account',
  enabled: true,
  embed: { title: '', description: '', color: '#57F287', footer: 'WGG Ticket System' },
  button: { label: 'Create ticket', emoji: '📩', style: 'Secondary' },
  welcomeEmbed: {
    title: '🎫 Ticket Received',
    description:
      'Hi {user}! We received your ticket already. Please wait for {staff} to respond to you very soon.\n\n⚠️ Please do not spam messages.',
    color: '#57F287',
    footer: 'WGG Support Team',
  },
  pingStaff: true,
};

export function PanelEditor({ panel, onClose, onSave, onDelete }: Props) {
  const data = panel || defaultPanel;
  const [form, setForm] = useState<Partial<Panel>>({ ...data });

  function setField(path: string, value: unknown) {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj: Record<string, unknown> = next as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="glass-card relative max-h-[90vh] w-full max-w-3xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-5 py-4">
          <h2 className="text-lg font-semibold">{panel ? `Edit ${panel.name}` : 'New Panel'}</h2>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-1.5">✕</button>
        </div>

        <div className="grid max-h-[calc(90vh-130px)] gap-6 overflow-y-auto p-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="label">Panel name</label>
              <input className="input" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.categoryKey} onChange={(e) => setField('categoryKey', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-[var(--glass-border)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Panel embed</h3>
              <input className="input" placeholder="Title" value={form.embed?.title || ''} onChange={(e) => setField('embed.title', e.target.value)} />
              <textarea className="input min-h-[100px]" placeholder="Description" value={form.embed?.description || ''} onChange={(e) => setField('embed.description', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input type="color" className="input h-10 p-1" value={form.embed?.color || '#57F287'} onChange={(e) => setField('embed.color', e.target.value)} />
                <input className="input" placeholder="Footer" value={form.embed?.footer || ''} onChange={(e) => setField('embed.footer', e.target.value)} />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--glass-border)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Button</h3>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Label" value={form.button?.label || ''} onChange={(e) => setField('button.label', e.target.value)} />
                <input className="input" placeholder="Emoji" value={form.button?.emoji || ''} onChange={(e) => setField('button.emoji', e.target.value)} />
              </div>
              <select className="input" value={form.button?.style || 'Secondary'} onChange={(e) => setField('button.style', e.target.value)}>
                {['Primary', 'Secondary', 'Success', 'Danger'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-[var(--glass-border)] p-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Welcome message</h3>
              <p className="mb-3 text-[10px] text-[var(--text-muted)]">Placeholders: {'{user}'} {'{staff}'} {'{username}'}</p>
              <input className="input" placeholder="Title" value={form.welcomeEmbed?.title || ''} onChange={(e) => setField('welcomeEmbed.title', e.target.value)} />
              <textarea className="input min-h-[120px]" value={form.welcomeEmbed?.description || ''} onChange={(e) => setField('welcomeEmbed.description', e.target.value)} />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.pingStaff !== false} onChange={(e) => setField('pingStaff', e.target.checked)} />
                Ping staff role when ticket opens
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="label mb-2">Panel preview</p>
              <DiscordPreview embed={form.embed || {}} button={form.button} />
            </div>
            <div>
              <p className="label mb-2">Welcome preview</p>
              <DiscordPreview embed={form.welcomeEmbed || {}} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--glass-border)] px-5 py-4">
          {onDelete && (
            <button type="button" className="btn-danger" onClick={onDelete}>Delete</button>
          )}
          <div className="flex-1" />
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => onSave(form as Panel)}>Save panel</button>
        </div>
      </div>
    </div>
  );
}
