import { NextRequest, NextResponse } from 'next/server';
import { requireDashboardAuth } from '@/lib/apiAuth';
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

export async function GET() {
  const auth = await requireDashboardAuth();
  if ('error' in auth) return auth.error;

  const guildId = process.env.GUILD_ID!;
  const { supabase } = auth;

  const [{ data: config, error: configErr }, { data: panels, error: panelsErr }, { data: commands, error: commandsErr }] =
    await Promise.all([
      supabase.from('guild_config').select('ticket_counter').eq('guild_id', guildId).maybeSingle(),
      supabase.from('panels').select('*').eq('guild_id', guildId).order('sort_order'),
      supabase.from('custom_commands').select('*').eq('guild_id', guildId).order('name'),
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
  const auth = await requireDashboardAuth();
  if ('error' in auth) return auth.error;

  const body = await request.json();
  if (typeof body.ticketCounter !== 'number') {
    return NextResponse.json({ error: 'Invalid counter' }, { status: 400 });
  }

  const guildId = process.env.GUILD_ID!;
  const { supabase } = auth;

  const { error } = await supabase.from('guild_config').upsert({
    guild_id: guildId,
    ticket_counter: Math.max(0, Math.floor(body.ticketCounter)),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ticketCounter: body.ticketCounter });
}
