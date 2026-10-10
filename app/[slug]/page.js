import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import ReviewFlow from './ReviewFlow';

export const dynamic = 'force-dynamic';

const uiLang = (l) => (l === 'hindi' ? 'hi' : l === 'hinglish' ? 'hinglish' : 'en');

export async function generateMetadata({ params }) {
  return { title: 'Share your experience' };
}

export default async function ReviewPage({ params }) {
  const slug = String(params.slug || '').toLowerCase();
  if (!/^[a-z0-9-]{2,30}$/.test(slug)) notFound();

  const { data: link } = await db()
    .from('short_links')
    .select('slug,business_id,is_active,language,businesses(name,accent,questions,min_answers,google_review_url,language)')
    .eq('slug', slug)
    .maybeSingle();

  if (!link) notFound();
  const b = link.businesses;
  if (!link.is_active || !b) {
    return (
      <div className="center-msg">
        <h1>This link is not active right now</h1>
        <p className="hint">Please contact the business.</p>
      </div>
    );
  }

  // scan count + pause check ek saath (dono se customer ko extra wait nahi)
  const [pRes, sRes] = await Promise.all([
    db().from('businesses').select('ai_paused').eq('id', link.business_id).maybeSingle(),
    db().from('app_settings').select('ai_paused_all').eq('id', 1).maybeSingle(),
    db().rpc('increment_scans', { p_slug: slug }),
  ]);

  const paused = !!(pRes?.data?.ai_paused || sRes?.data?.ai_paused_all);
  if (paused && b.google_review_url) {
    redirect(b.google_review_url); // temporary redirect (307), seedha Google
  }

  return (
    <ReviewFlow
      slug={slug}
      business={{
        name: b.name,
        accent: b.accent,
        questions: b.questions || [],
        minAnswers: b.min_answers || 0,
        googleUrl: b.google_review_url || '',
        language: uiLang(link.language || b.language),
      }}
    />
  );
}
