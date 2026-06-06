import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireDashboardAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  const auth = await requireDashboardAuth();
  if ('error' in auth) return auth.error;

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

  const { data, error } = await auth.supabase.from('custom_commands').insert(row).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
