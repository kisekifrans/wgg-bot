import { NextRequest, NextResponse } from 'next/server';
import { requireDashboardAuth } from '@/lib/apiAuth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireDashboardAuth();
  if ('error' in auth) return auth.error;

  const body = await request.json();
  const { data, error } = await auth.supabase
    .from('custom_commands')
    .update({
      name: body.name?.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      description: body.description,
      staff_only: body.staffOnly,
      embed: body.embed,
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
  const auth = await requireDashboardAuth();
  if ('error' in auth) return auth.error;

  const { error } = await auth.supabase
    .from('custom_commands')
    .delete()
    .eq('id', params.id)
    .eq('guild_id', process.env.GUILD_ID!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
