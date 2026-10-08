import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const TYPES = ['chips', 'chips_text', 'text'];

function cleanQuestions(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 15).map((q, i) => ({
    id: String(q.id || 'q' + i).slice(0, 20),
    label: String(q.label || '').slice(0, 120),
    type: TYPES.includes(q.type) ? q.type : 'chips_text',
    chips: (Array.isArray(q.chips) ? q.chips : []).map((c) => String(c).trim().slice(0, 40)).filter(Boolean).slice(0, 20),
    multi: !!q.multi,
    required: !!q.required,
  })).filter((q) => q.label);
}

export async function PUT(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Login chahiye' }, { status: 401 });
  const b = await req.json();
  const patch = {
    name: String(b.name || '').trim().slice(0, 120),
    type: String(b.type || 'generic').slice(0, 30),
    area: String(b.area || '').slice(0, 120),
    services: String(b.services || '').slice(0, 600),
    google_review_url: String(b.google_review_url || '').trim().slice(0, 600),
    language: ['hinglish', 'english', 'hindi'].includes(b.language) ? b.language : 'hinglish',
    accent: /^#[0-9a-fA-F]{6}$/.test(b.accent || '') ? b.accent : '#0f766e',
    min_answers: Math.min(10, Math.max(0, parseInt(b.min_answers, 10) || 0)),
    questions: cleanQuestions(b.questions),
  };
  if (!patch.name) return NextResponse.json({ error: 'Naam khali nahi ho sakta' }, { status: 400 });
  const { error } = await db().from('businesses').update(patch).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Login chahiye' }, { status: 401 });
  const { error } = await db().from('businesses').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
