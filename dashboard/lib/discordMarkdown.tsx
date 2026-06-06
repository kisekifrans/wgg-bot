import React from 'react';

type Segment = { type: string; content: string; meta?: string };

function tokenizeInline(text: string): Segment[] {
  const pattern =
    /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|~~[^~]+~~|`[^`]+`|\|\|[^|]+\|\|<@!?\d+>|<@&\d+>|<#\d+>|<a?:\w+:\d+>)/g;

  const parts: Segment[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: text.slice(last, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**')) parts.push({ type: 'bold', content: token.slice(2, -2) });
    else if (token.startsWith('__')) parts.push({ type: 'underline', content: token.slice(2, -2) });
    else if (token.startsWith('*')) parts.push({ type: 'italic', content: token.slice(1, -1) });
    else if (token.startsWith('~~')) parts.push({ type: 'strike', content: token.slice(2, -2) });
    else if (token.startsWith('`')) parts.push({ type: 'code', content: token.slice(1, -1) });
    else if (token.startsWith('||')) parts.push({ type: 'spoiler', content: token.slice(2, -2) });
    else if (token.startsWith('<@&')) parts.push({ type: 'role', content: token });
    else if (token.startsWith('<@')) parts.push({ type: 'user', content: token });
    else if (token.startsWith('<#')) parts.push({ type: 'channel', content: token });
    else if (token.startsWith('<')) parts.push({ type: 'emoji', content: token });
    last = match.index + token.length;
  }

  if (last < text.length) {
    parts.push({ type: 'text', content: text.slice(last) });
  }

  return parts.length ? parts : [{ type: 'text', content: text }];
}

function renderSegment(seg: Segment, key: number): React.ReactNode {
  switch (seg.type) {
    case 'bold':
      return <strong key={key} className="discord-md-bold">{seg.content}</strong>;
    case 'italic':
      return <em key={key} className="discord-md-italic">{seg.content}</em>;
    case 'underline':
      return <span key={key} className="discord-md-underline">{seg.content}</span>;
    case 'strike':
      return <s key={key}>{seg.content}</s>;
    case 'code':
      return <code key={key} className="discord-md-code">{seg.content}</code>;
    case 'spoiler':
      return (
        <span key={key} className="discord-md-spoiler" title="Spoiler">
          {seg.content}
        </span>
      );
    case 'user':
      return <span key={key} className="discord-md-mention">@user</span>;
    case 'role':
      return <span key={key} className="discord-md-mention discord-md-role">@role</span>;
    case 'channel':
      return <span key={key} className="discord-md-mention discord-md-channel">#channel</span>;
    case 'emoji': {
      const custom = seg.content.match(/^<a?:(\w+):(\d+)>$/);
      return (
        <span key={key} className="discord-md-custom-emoji" title={custom?.[1] || 'emoji'}>
          :{custom?.[1] || 'emoji'}:
        </span>
      );
    }
    default:
      return <React.Fragment key={key}>{seg.content}</React.Fragment>;
  }
}

export function renderDiscordMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const blocks = text.split(/(```[\s\S]*?```)/g);

  return blocks.map((block, bi) => {
    if (block.startsWith('```') && block.endsWith('```')) {
      const inner = block.slice(3, -3).replace(/^\w+\n/, '');
      return (
        <pre key={bi} className="discord-md-pre">
          <code>{inner}</code>
        </pre>
      );
    }

    return block.split('\n').map((line, li) => (
      <React.Fragment key={`${bi}-${li}`}>
        {li > 0 && <br />}
        {tokenizeInline(line).map((seg, si) => renderSegment(seg, si))}
      </React.Fragment>
    ));
  });
}

export function applyPlaceholders(
  text: string,
  placeholders?: { user?: string; staff?: string; username?: string; owner?: string },
): string {
  if (!text || !placeholders) return text || '';
  return text
    .replace(/\{user\}/g, placeholders.user || '@User')
    .replace(/\{username\}/g, placeholders.username || 'User')
    .replace(/\{staff\}/g, placeholders.staff || '@Staff')
    .replace(/\{owner\}/g, placeholders.owner || '@Owner');
}

export function parseButtonEmoji(emoji?: string): { display: string; isCustom: boolean; name?: string } {
  if (!emoji) return { display: '📩', isCustom: false };
  const custom = emoji.match(/^<a?:(\w+):(\d+)>$/);
  if (custom) return { display: `:${custom[1]}:`, isCustom: true, name: custom[1] };
  if (/^\d+$/.test(emoji)) return { display: ':emoji:', isCustom: true };
  return { display: emoji, isCustom: false };
}
