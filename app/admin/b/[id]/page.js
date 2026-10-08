import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import Editor from './Editor';

export const dynamic = 'force-dynamic';

export default async function BusinessPage({ params }) {
  if (!isAdmin()) redirect('/admin/login');
  const { data: business } = await db().from('businesses').select('*').eq('id', params.id).maybeSingle();
  if (!business) notFound();
  const { data: links } = await db()
    .from('short_links')
    .select('slug,is_active,scans')
    .eq('business_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="adm">
      <div className="adm-top">
        <h1><Link href="/admin">Taprizz admin</Link> / {business.name}</h1>
      </div>
      <Editor initial={business} initialLinks={links || []} />
    </div>
  );
}
