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

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;

  const body = await request.json();
  const id = body.id || `cmd_${randomUUID().slice(0, 8)}`;

  const row = {
    id,
    guild_id: process.env.GUILD_ID!,
    name: (body.name || 'newcommand').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
    description: body.description || '',
    staff_only: body.staffOnly !== false,
    embed: body.embed || {},
  };

  const service = createServiceClient();
  const { data, error } = await service.from('custom_commands').insert(row).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
