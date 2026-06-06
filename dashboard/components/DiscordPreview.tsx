import type { EmbedConfig } from '@/lib/types';

type Props = {
  embed: EmbedConfig;
  button?: { label: string; emoji?: string };
};

export function DiscordPreview({ embed, button }: Props) {
  const color = embed.color || '#5865F2';

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#2b2d31] dark:bg-[#2b2d31]">
      <div className="discord-embed m-3 pl-3" style={{ borderColor: color }}>
        {embed.title && <div className="mb-1.5 text-sm font-semibold text-white">{embed.title}</div>}
        {embed.description && (
          <div className="whitespace-pre-wrap text-xs leading-relaxed text-[#dbdee1]">
            {embed.description}
          </div>
        )}
        {embed.footer && <div className="mt-2 text-[10px] text-[#949ba4]">{embed.footer}</div>}
      </div>
      {button && (
        <div className="mx-3 mb-3 inline-flex items-center gap-1.5 rounded-md bg-[#4e5058] px-3 py-1.5 text-xs font-medium text-white">
          <span>{button.emoji || '📩'}</span>
          <span>{button.label}</span>
        </div>
      )}
    </div>
  );
}
