import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;

  const body = await request.json();
  const service = createServiceClient();

  const { data, error } = await service
    .from('panels')
    .update({
      name: body.name,
      category_key: body.categoryKey,
      enabled: body.enabled,
      embed: body.embed,
      button: body.button,
      welcome_embed: body.welcomeEmbed,
      ping_staff: body.pingStaff,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .eq('guild_id', process.env.GUILD_ID!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;

  const service = createServiceClient();
  const { error } = await service
    .from('panels')
    .delete()
    .eq('id', params.id)
    .eq('guild_id', process.env.GUILD_ID!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
