import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { buildPrompt, callClaude, hasBanned } from '@/lib/generate';

export const dynamic = 'force-dynamic';

// Simple per-instance rate limit (serverless me approx hai, abuse rokne ke liye kaafi)
const hits = new Map();
function limited(key, max = 6, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return true;
  arr.push(now);
  hits.set(key, arr);
  return false;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const slug = String(body.slug || '');
    const rating = Math.min(5, Math.max(0, parseInt(body.rating, 10) || 0));
    if (!rating) return NextResponse.json({ error: 'Pehle star rating do' }, { status: 400 });

    const answers = (Array.isArray(body.answers) ? body.answers : [])
      .slice(0, 15)
      .map((a) => ({ question: String(a.label || '').slice(0, 150), answer: String(a.value || '').trim().slice(0, 400) }))
      .filter((a) => a.answer);

    const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0].trim();
    if (limited(ip + ':' + slug)) {
      return NextResponse.json({ error: 'Bahut baar try kar liya. Thodi der baad dobara try karo.' }, { status: 429 });
    }

    const { data: link } = await db()
      .from('short_links')
      .select('slug,is_active,businesses(*)')
      .eq('slug', slug)
      .maybeSingle();
    const business = link?.businesses;
    if (!link || !link.is_active || !business) {
      return NextResponse.json({ error: 'Link active nahi hai' }, { status: 404 });
    }
    if (answers.length < (business.min_answers || 0)) {
      return NextResponse.json({ error: 'Thoda aur batao, phir review banega.' }, { status: 400 });
    }

    const { data: prev } = await db()
      .from('review_logs')
      .select('review')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(12);
    const previous = (prev || []).map((p) => p.review).filter(Boolean);

    const { system, user } = buildPrompt({ business, rating, answers, previous });
    let review = '';
    for (let i = 0; i < 2; i++) {
      review = await callClaude({
        system: i === 0 ? system : system + '\n- IMPORTANT: your last draft used a forbidden claim. Remove any guarantee or cure claim.',
        user,
      });
      if (review && !hasBanned(review)) break;
      review = '';
    }
    if (!review) return NextResponse.json({ error: 'Review nahi ban paya, dobara try karo.' }, { status: 502 });

    const { data: log } = await db()
      .from('review_logs')
      .insert({ business_id: business.id, slug, rating, review })
      .select('id')
      .single();

    return NextResponse.json({ review, id: log?.id || null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Kuch gadbad ho gayi, dobara try karo.' }, { status: 500 });
  }
}
