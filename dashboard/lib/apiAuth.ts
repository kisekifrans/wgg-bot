import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getDiscordUserId, verifyGuildAccess } from '@/lib/discord';

type AuthOk = { supabase: SupabaseClient; user: User; discordId: string };
type AuthErr = { error: NextResponse };

export async function requireDashboardAuth(): Promise<AuthOk | AuthErr> {
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

  return { supabase, user, discordId };
}
