import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireDashboardAuth } from '@/lib/apiAuth';

export async function GET() {
  const auth = await requireDashboardAuth();
  if ('error' in auth) return auth.error;

  const { supabase } = auth;
  const { data, error } = await supabase
    .from('panels')
    .select('*')
    .eq('guild_id', process.env.GUILD_ID!)
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireDashboardAuth();
  if ('error' in auth) return auth.error;

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

  const { data, error } = await auth.supabase.from('panels').insert(row).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
