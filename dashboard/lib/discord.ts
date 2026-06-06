import { User } from '@supabase/supabase-js';

export function getDiscordUserId(user: User): string | null {
  const meta = user.user_metadata;
  if (meta?.provider_id) return String(meta.provider_id);
  if (meta?.sub) return String(meta.sub);
  if (meta?.id) return String(meta.id);

  const discordIdentity = user.identities?.find((identity) => identity.provider === 'discord');
  if (discordIdentity?.id) return discordIdentity.id;

  return null;
}

export async function verifyGuildAccess(discordUserId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const guildId = process.env.GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) {
    return { allowed: false, reason: 'Server configuration missing' };
  }

  const allowedIds = (process.env.ALLOWED_DISCORD_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (allowedIds.includes(discordUserId)) {
    return { allowed: true };
  }

  const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    next: { revalidate: 60 },
  });

  if (!guildRes.ok) {
    return { allowed: false, reason: 'Could not verify guild' };
  }

  const guild = await guildRes.json();
  if (guild.owner_id === discordUserId) {
    return { allowed: true };
  }

  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
    { headers: { Authorization: `Bot ${botToken}` } },
  );

  if (!memberRes.ok) {
    return { allowed: false, reason: 'You must be a member of the WGG Discord server' };
  }

  const member = await memberRes.json();
  const permissions = BigInt(member.permissions || '0');
  const ADMINISTRATOR = BigInt(0x8);

  if ((permissions & ADMINISTRATOR) === ADMINISTRATOR) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Only the server owner or administrators can access this dashboard' };
}
