'use client';

import { useState } from 'react';

type Props = {
  variant?: 'panel' | 'command' | 'welcome';
  defaultOpen?: boolean;
};

export function EmbedGuide({ variant = 'panel', defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-inset overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[var(--surface-hover)]"
      >
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Embed & Discord reference
        </span>
        <span className="text-[var(--text-muted)]">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-[var(--glass-border)] px-4 py-4 text-xs leading-relaxed text-[var(--text-secondary)]">
          {(variant === 'panel' || variant === 'welcome') && (
            <section>
              <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Welcome placeholders
              </h4>
              <ul className="guide-list space-y-1.5">
                <li><code className="code-inline">{'{user}'}</code> — pings the ticket opener</li>
                <li><code className="code-inline">{'{username}'}</code> — username only, no ping</li>
                <li><code className="code-inline">{'{staff}'}</code> — mentions your staff role</li>
                <li><code className="code-inline">{'{owner}'}</code> — mentions the server owner (from bot env)</li>
              </ul>
              <p className="hint mt-2">Welcome embeds also get auto fields: Ticket ID, Category, Status.</p>
            </section>
          )}

          <section>
            <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Text formatting
            </h4>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {[
                ['**bold**', 'Bold text'],
                ['*italic*', 'Italic text'],
                ['__underline__', 'Underlined'],
                ['~~strike~~', 'Strikethrough'],
                ['`code`', 'Inline code'],
                ['||spoiler||', 'Hidden spoiler'],
              ].map(([syntax, label]) => (
                <div key={syntax} className="flex items-center gap-2">
                  <code className="code-inline shrink-0">{syntax}</code>
                  <span className="text-[var(--text-muted)]">{label}</span>
                </div>
              ))}
            </div>
            <p className="hint mt-2">Use an empty line for paragraph breaks. Code blocks: <code className="code-inline">```</code> on its own line.</p>
          </section>

          <section>
            <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Emojis
            </h4>
            <ul className="guide-list space-y-1.5">
              <li><strong>Unicode</strong> — paste directly, e.g. 📩 ✅</li>
              <li><strong>Custom emoji in text</strong> — <code className="code-inline">&lt;:name:123456789&gt;</code></li>
              <li><strong>Button emoji field</strong> — unicode, emoji ID, or <code className="code-inline">&lt;:name:id&gt;</code></li>
            </ul>
            <p className="hint mt-2">
              Enable <strong>Developer Mode</strong> in Discord → Settings → Advanced → right-click emoji → <strong>Copy Emoji ID</strong>.
            </p>
          </section>

          <section>
            <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              IDs & mentions
            </h4>
            <ul className="guide-list space-y-1.5">
              <li><strong>User</strong> — right-click user → Copy User ID → <code className="code-inline">&lt;@USER_ID&gt;</code></li>
              <li><strong>Role</strong> — Server Settings → Roles → right-click role → Copy Role ID → <code className="code-inline">&lt;@&amp;ROLE_ID&gt;</code></li>
              <li><strong>Channel</strong> — right-click channel → Copy Channel ID → <code className="code-inline">&lt;#CHANNEL_ID&gt;</code></li>
            </ul>
            <p className="hint mt-2">Developer Mode must be on for Copy ID options to appear.</p>
          </section>

          <section>
            <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Embed color
            </h4>
            <p>Use hex colors like <code className="code-inline">#57F287</code> (green) or <code className="code-inline">#5865F2</code> (Discord blurple). Shown as the left border in Discord.</p>
          </section>

          <section>
            <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Embed images
            </h4>
            <ul className="guide-list space-y-1.5">
              <li><strong>Image URL</strong> — large banner at the bottom of the embed</li>
              <li><strong>Thumbnail URL</strong> — small image in the top-right corner</li>
            </ul>
            <p className="hint mt-2">
              Use a direct public <code className="code-inline">https://</code> link (PNG, JPG, or GIF).
              Discord cannot load private or login-protected URLs. Imgur, CDN, or your website work well.
            </p>
          </section>

          {variant === 'command' && (
            <section>
              <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Slash commands
              </h4>
              <p>Commands register as <code className="code-inline">/name</code> in ticket channels. Staff-only commands are hidden from regular members.</p>
            </section>
          )}

          {variant === 'panel' && (
            <section>
              <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Deploy panel
              </h4>
              <p>After saving, run <code className="code-inline">/panel send panel:panel_id</code> in Discord. Bot syncs config every ~15 seconds.</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
