'use client';

import { useState } from 'react';
import type { Panel } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { DiscordPreview } from './DiscordPreview';
import { EmbedGuide } from './EmbedGuide';
import { IconClose } from './icons';

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

const PREVIEW_PLACEHOLDERS = {
  user: '@TicketUser',
  username: 'TicketUser',
  staff: '@Staff',
};

export function PanelEditor({ panel, onClose, onSave, onDelete }: Props) {
  const data = panel || defaultPanel;
  const [form, setForm] = useState<Partial<Panel>>({ ...data });

  const categoryLabel = CATEGORIES.find((c) => c.key === form.categoryKey)?.label || 'Account';

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
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-panel max-w-5xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {panel ? `Edit ${panel.name}` : 'New Panel'}
            </h2>
            <p className="hint mt-0.5">Panel embed, button, and ticket welcome message</p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close">
            <IconClose />
          </button>
        </div>

        <div className="grid max-h-[calc(90vh-140px)] gap-6 overflow-y-auto p-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="glass-inset p-4">
              <p className="section-title">General</p>
              <label className="label">Panel name</label>
              <input className="input" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} />
              <label className="label mt-3">Category</label>
              <select className="input" value={form.categoryKey} onChange={(e) => setField('categoryKey', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>

            <div className="glass-inset p-4">
              <p className="section-title">Panel embed</p>
              <label className="label">Title</label>
              <input className="input" placeholder="Support — Account" value={form.embed?.title || ''} onChange={(e) => setField('embed.title', e.target.value)} />
              <label className="label mt-3">Description</label>
              <textarea className="input min-h-[100px]" placeholder="Describe what this ticket is for…" value={form.embed?.description || ''} onChange={(e) => setField('embed.description', e.target.value)} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Color</label>
                  <input type="color" className="input h-10 cursor-pointer p-1" value={form.embed?.color || '#57F287'} onChange={(e) => setField('embed.color', e.target.value)} />
                </div>
                <div>
                  <label className="label">Footer</label>
                  <input className="input" placeholder="WGG Ticket System" value={form.embed?.footer || ''} onChange={(e) => setField('embed.footer', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="glass-inset p-4">
              <p className="section-title">Button</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Label</label>
                  <input className="input" placeholder="Create ticket" value={form.button?.label || ''} onChange={(e) => setField('button.label', e.target.value)} />
                </div>
                <div>
                  <label className="label">Emoji</label>
                  <input className="input" placeholder="📩 or emoji ID" value={form.button?.emoji || ''} onChange={(e) => setField('button.emoji', e.target.value)} />
                </div>
              </div>
              <label className="label mt-3">Style</label>
              <select className="input" value={form.button?.style || 'Secondary'} onChange={(e) => setField('button.style', e.target.value)}>
                {['Primary', 'Secondary', 'Success', 'Danger'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="glass-inset p-4">
              <p className="section-title">Welcome message</p>
              <p className="hint mb-3">Sent inside the ticket channel when a user opens one.</p>
              <label className="label">Title</label>
              <input className="input" placeholder="🎫 Ticket Received" value={form.welcomeEmbed?.title || ''} onChange={(e) => setField('welcomeEmbed.title', e.target.value)} />
              <label className="label mt-3">Description</label>
              <textarea className="input min-h-[120px]" placeholder="Hi {user}! Please wait for {staff}…" value={form.welcomeEmbed?.description || ''} onChange={(e) => setField('welcomeEmbed.description', e.target.value)} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Color</label>
                  <input type="color" className="input h-10 cursor-pointer p-1" value={form.welcomeEmbed?.color || '#57F287'} onChange={(e) => setField('welcomeEmbed.color', e.target.value)} />
                </div>
                <div>
                  <label className="label">Footer</label>
                  <input className="input" placeholder="WGG Support Team" value={form.welcomeEmbed?.footer || ''} onChange={(e) => setField('welcomeEmbed.footer', e.target.value)} />
                </div>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" className="accent-[var(--accent)]" checked={form.pingStaff !== false} onChange={(e) => setField('pingStaff', e.target.checked)} />
                Ping staff role when ticket opens
              </label>
            </div>

            <EmbedGuide variant="panel" />
          </div>

          <div className="space-y-4 xl:sticky xl:top-0 xl:self-start">
            <div>
              <p className="label mb-2">Panel preview</p>
              <p className="hint mb-2">How it appears in the ticket panel channel.</p>
              <DiscordPreview
                variant="panel"
                embed={form.embed || {}}
                button={form.button}
                label="Panel channel"
              />
            </div>

            <div>
              <p className="label mb-2">Welcome preview</p>
              <p className="hint mb-2">Includes auto fields + pings (sample data).</p>
              <DiscordPreview
                variant="welcome"
                embed={form.welcomeEmbed || {}}
                label="Ticket channel"
                showPings={form.pingStaff !== false}
                placeholders={PREVIEW_PLACEHOLDERS}
                welcomeMeta={{ ticketId: 'wgg-ticket-0001', category: categoryLabel }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--glass-border)] px-6 py-4">
          {onDelete && <button type="button" className="btn-danger" onClick={onDelete}>Delete</button>}
          <div className="flex-1" />
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => onSave(form as Panel)}>Save panel</button>
        </div>
      </div>
    </div>
  );
}
