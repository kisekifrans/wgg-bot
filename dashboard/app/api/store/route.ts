import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getDiscordUserId, verifyGuildAccess } from '@/lib/discord';
import type { StoreData } from '@/lib/types';

function mapPanel(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    categoryKey: row.category_key,
    enabled: row.enabled,
    embed: row.embed,
    button: row.button,
    welcomeEmbed: row.welcome_embed,
    pingStaff: row.ping_staff,
  };
}

function mapCommand(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    staffOnly: row.staff_only,
    embed: row.embed,
  };
}

async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const discordId = getDiscordUserId(user);
  if (!discordId) {
    return { error: NextResponse.json({ error: 'Discord account required' }, { status: 403 }) };
  }

  const access = await verifyGuildAccess(discordId);
  if (!access.allowed) {
    return {
      error: NextResponse.json({ error: access.reason || 'Access denied' }, { status: 403 }),
    };
  }

  return { user, discordId };
}

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;

  const guildId = process.env.GUILD_ID!;
  const service = createServiceClient();

  const [{ data: config, error: configErr }, { data: panels, error: panelsErr }, { data: commands, error: commandsErr }] =
    await Promise.all([
      service.from('guild_config').select('ticket_counter').eq('guild_id', guildId).maybeSingle(),
      service.from('panels').select('*').eq('guild_id', guildId).order('sort_order'),
      service.from('custom_commands').select('*').eq('guild_id', guildId).order('name'),
    ]);

  const dbError = configErr || panelsErr || commandsErr;
  if (dbError) {
    console.error('store GET:', dbError.message);
    return NextResponse.json({ error: 'Failed to load from database' }, { status: 500 });
  }

  const store: StoreData = {
    ticketCounter: config?.ticket_counter ?? 0,
    panels: (panels ?? []).map(mapPanel) as StoreData['panels'],
    customCommands: (commands ?? []).map(mapCommand) as StoreData['customCommands'],
  };

  return NextResponse.json(store);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;

  const body = await request.json();
  if (typeof body.ticketCounter !== 'number') {
    return NextResponse.json({ error: 'Invalid counter' }, { status: 400 });
  }

  const guildId = process.env.GUILD_ID!;
  const service = createServiceClient();

  await service.from('guild_config').upsert({
    guild_id: guildId,
    ticket_counter: Math.max(0, Math.floor(body.ticketCounter)),
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ticketCounter: body.ticketCounter });
}
