import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import NewBusiness from './NewBusiness';
import LogoutButton from './LogoutButton';
import PauseToggle from './PauseToggle';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  if (!isAdmin()) redirect('/admin/login');

  const [{ data: businesses }, { data: links }, { data: logs }, { data: settings }] = await Promise.all([
    db().from('businesses').select('id,name,type,created_at,ai_paused').order('created_at', { ascending: false }),
    db().from('short_links').select('slug,business_id,scans,is_active'),
    db().from('review_logs').select('business_id,rating,posted').limit(20000),
    db().from('app_settings').select('ai_paused_all').eq('id', 1).maybeSingle(),
  ]);

  const allPaused = !!settings?.ai_paused_all;

  const stats = {};
  (businesses || []).forEach((b) => (stats[b.id] = { scans: 0, links: 0, gen: 0, posted: 0, sum: 0 }));
  (links || []).forEach((l) => { const s = stats[l.business_id]; if (s) { s.scans += l.scans; s.links += 1; } });
  (logs || []).forEach((r) => { const s = stats[r.business_id]; if (s) { s.gen += 1; s.sum += r.rating || 0; if (r.posted) s.posted += 1; } });

  return (
    <div className="adm">
      <div className="adm-top">
        <h1>Taprizz admin</h1>
        <LogoutButton />
      </div>

      <div style={{ margin: '12px 0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <PauseToggle scope="all" paused={allPaused} />
        <span>{allPaused ? '🟡 Sab clients paused (seedha Google)' : '🟢 AI sab ke liye chal raha hai'}</span>
      </div>

      <NewBusiness />
      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr><th>Business</th><th>AI status</th><th>Links</th><th>Scans</th><th>Reviews generated</th><th>Sent to Google</th><th>Avg rating</th></tr>
          </thead>
          <tbody>
            {(businesses || []).length === 0 && <tr><td colSpan="7">No businesses yet. Create your first one above.</td></tr>}
            {(businesses || []).map((b) => {
              const s = stats[b.id];
              const paused = !!b.ai_paused;
              return (
                <tr key={b.id}>
                  <td><Link href={'/admin/b/' + b.id}>{b.name}</Link></td>
                  <td>
                    {allPaused || paused ? '🟡 Paused' : '🟢 Chal raha'}{' '}
                    <PauseToggle businessId={b.id} paused={paused} />
                  </td>
                  <td>{s.links}</td>
                  <td>{s.scans}</td>
                  <td>{s.gen}</td>
                  <td>{s.posted}</td>
                  <td>{s.gen ? (s.sum / s.gen).toFixed(1) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
