import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { TEMPLATES } from '@/lib/templates';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  const { name, type } = await req.json();
  if (!name || !String(name).trim()) return NextResponse.json({ error: 'Enter a business name' }, { status: 400 });
  const t = TEMPLATES[type] ? type : 'generic';
  const { data, error } = await db()
    .from('businesses')
    .insert({ name: String(name).trim().slice(0, 120), type: t, language: 'english', questions: TEMPLATES[t].questions() })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
