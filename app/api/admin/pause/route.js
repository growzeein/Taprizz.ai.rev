import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ code: 'AUTH' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  let error = null;

  if (typeof body.all === 'boolean') {
    ({ error } = await db().from('app_settings').update({ ai_paused_all: body.all }).eq('id', 1));
  } else if (body.businessId && typeof body.paused === 'boolean') {
    ({ error } = await db().from('businesses').update({ ai_paused: body.paused }).eq('id', body.businessId));
  } else {
    return NextResponse.json({ code: 'BAD' }, { status: 400 });
  }

  if (error) return NextResponse.json({ code: 'DB' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
