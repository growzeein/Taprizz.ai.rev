import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase';
import ReviewFlow from './ReviewFlow';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return { title: 'Share your experience' };
}

export default async function ReviewPage({ params }) {
  const slug = String(params.slug || '').toLowerCase();
  if (!/^[a-z0-9-]{2,30}$/.test(slug)) notFound();

  const { data: link } = await db()
    .from('short_links')
    .select('slug,is_active,businesses(name,accent,questions,min_answers,google_review_url)')
    .eq('slug', slug)
    .maybeSingle();

  if (!link) notFound();
  const b = link.businesses;
  if (!link.is_active || !b) {
    return (
      <div className="center-msg">
        <h1>Ye link abhi active nahi hai</h1>
        <p className="hint">Business owner se sampark karein.</p>
      </div>
    );
  }

  await db().rpc('increment_scans', { p_slug: slug });

  return (
    <ReviewFlow
      slug={slug}
      business={{
        name: b.name,
        accent: b.accent,
        questions: b.questions || [],
        minAnswers: b.min_answers || 0,
        googleUrl: b.google_review_url || '',
      }}
    />
  );
}
