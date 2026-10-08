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
    if (!rating) return NextResponse.json({ code: 'NO_RATING' }, { status: 400 });

    const answers = (Array.isArray(body.answers) ? body.answers : [])
      .slice(0, 15)
      .map((a) => ({ question: String(a.label || '').slice(0, 150), answer: String(a.value || '').trim().slice(0, 400) }))
      .filter((a) => a.answer);

    const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0].trim();
    if (limited(ip + ':' + slug)) {
      return NextResponse.json({ code: 'RATE' }, { status: 429 });
    }

    const { data: link } = await db()
      .from('short_links')
      .select('slug,is_active,language,businesses(*)')
      .eq('slug', slug)
      .maybeSingle();
    const asked = ['english', 'hinglish', 'hindi'].includes(body.language) ? body.language : null;
    const business = link?.businesses
      ? { ...link.businesses, language: asked || link.language || link.businesses.language }
      : null;
    if (!link || !link.is_active || !business) {
      return NextResponse.json({ code: 'INACTIVE' }, { status: 404 });
    }
    if (answers.length < (business.min_answers || 0)) {
      return NextResponse.json({ code: 'MIN' }, { status: 400 });
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
    if (!review) return NextResponse.json({ code: 'FAIL' }, { status: 502 });

    const { data: log } = await db()
      .from('review_logs')
      .insert({ business_id: business.id, slug, rating, review })
      .select('id')
      .single();

    return NextResponse.json({ review, id: log?.id || null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ code: 'FAIL' }, { status: 500 });
  }
}
