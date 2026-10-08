import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'tz_admin';

function sign(v) {
  return crypto.createHmac('sha256', process.env.ADMIN_SECRET || 'unset').update(v).digest('hex');
}

export function makeToken() {
  const exp = String(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return exp + '.' + sign(exp);
}

export function isAdmin() {
  if (!process.env.ADMIN_SECRET) return false;
  const c = cookies().get(COOKIE)?.value;
  if (!c) return false;
  const [exp, sig] = c.split('.');
  if (!exp || !sig) return false;
  const expected = sign(exp);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(exp) > Date.now();
}

export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
