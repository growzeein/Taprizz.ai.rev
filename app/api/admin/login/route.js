import { NextResponse } from 'next/server';
import { COOKIE, makeToken, safeEqual } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { email, password } = await req.json();
  const ok =
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    safeEqual(String(email || '').trim().toLowerCase(), process.env.ADMIN_EMAIL.trim().toLowerCase()) &&
    safeEqual(password || '', process.env.ADMIN_PASSWORD);
  if (!ok) return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
