import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getDiscordUserId, verifyGuildAccess } from '@/lib/discord';

async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const discordId = getDiscordUserId(user);
  if (!discordId) return { error: NextResponse.json({ error: 'Discord required' }, { status: 403 }) };

  const access = await verifyGuildAccess(discordId);
  if (!access.allowed) {
    return { error: NextResponse.json({ error: access.reason }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;

  const service = createServiceClient();
  const { data } = await service
    .from('panels')
    .select('*')
    .eq('guild_id', process.env.GUILD_ID!)
    .order('sort_order');

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;

  const body = await request.json();
  const id = body.id || `panel_${randomUUID().slice(0, 8)}`;
  const guildId = process.env.GUILD_ID!;

  const row = {
    id,
    guild_id: guildId,
    name: body.name || 'New Panel',
    category_key: body.categoryKey || 'account',
    enabled: body.enabled !== false,
    embed: body.embed || {},
    button: body.button || { label: 'Create ticket', emoji: '📩', style: 'Secondary' },
    welcome_embed: body.welcomeEmbed || {},
    ping_staff: body.pingStaff !== false,
    sort_order: body.sortOrder ?? 0,
  };

  const service = createServiceClient();
  const { data, error } = await service.from('panels').insert(row).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
