import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { id, review } = await req.json();
    if (!id) return NextResponse.json({ ok: false });
    const patch = { posted: true };
    if (review) patch.review = String(review).slice(0, 2000); // customer ka final edited text
    await db().from('review_logs').update(patch).eq('id', id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
