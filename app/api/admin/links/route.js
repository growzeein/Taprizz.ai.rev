import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const RESERVED = ['admin', 'api', 'login', 'logout', 'static', 'favicon', 'robots', 'sitemap'];
const valid = (s) => /^[a-z0-9-]{2,30}$/.test(s) && !RESERVED.includes(s);
const deny = () => NextResponse.json({ error: 'Login required' }, { status: 401 });
const BAD = 'Slug can only use a-z, 0-9 and - (2 to 30 characters), and cannot be a reserved word like admin or api.';
const clean = (s) => String(s || '').trim().toLowerCase();
const LANGS = ['english', 'hinglish', 'hindi'];
const lang = (v) => (LANGS.includes(v) ? v : null);

// New short link
export async function POST(req) {
  if (!isAdmin()) return deny();
  const { business_id, slug: raw, language } = await req.json();
  const slug = clean(raw);
  if (!valid(slug)) return NextResponse.json({ error: BAD }, { status: 400 });
  const { error } = await db().from('short_links').insert({ slug, business_id, language: lang(language) });
  if (error) {
    const dup = error.code === '23505';
    return NextResponse.json({ error: dup ? 'That slug is already taken' : error.message }, { status: dup ? 409 : 500 });
  }
  return NextResponse.json({ ok: true });
}

// Pause/resume ya slug rename
export async function PATCH(req) {
  if (!isAdmin()) return deny();
  const { slug, is_active, new_slug, language } = await req.json();
  const patch = {};
  if (typeof is_active === 'boolean') patch.is_active = is_active;
  if (language !== undefined) patch.language = lang(language);
  if (new_slug !== undefined) {
    const ns = clean(new_slug);
    if (!valid(ns)) return NextResponse.json({ error: BAD }, { status: 400 });
    patch.slug = ns;
  }
  const { error } = await db().from('short_links').update(patch).eq('slug', clean(slug));
  if (error) {
    const dup = error.code === '23505';
    return NextResponse.json({ error: dup ? 'That slug is already taken' : error.message }, { status: dup ? 409 : 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  if (!isAdmin()) return deny();
  const { slug } = await req.json();
  const { error } = await db().from('short_links').delete().eq('slug', clean(slug));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
