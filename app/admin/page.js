import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import NewBusiness from './NewBusiness';
import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  if (!isAdmin()) redirect('/admin/login');

  const [{ data: businesses }, { data: links }, { data: logs }] = await Promise.all([
    db().from('businesses').select('id,name,type,created_at').order('created_at', { ascending: false }),
    db().from('short_links').select('slug,business_id,scans,is_active'),
    db().from('review_logs').select('business_id,rating,posted').limit(20000),
  ]);

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
      <NewBusiness />
      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr><th>Business</th><th>Links</th><th>Scans</th><th>Reviews bane</th><th>Google pe gaye</th><th>Avg star</th></tr>
          </thead>
          <tbody>
            {(businesses || []).length === 0 && <tr><td colSpan="6">Abhi koi business nahi. Upar se pehla business banao.</td></tr>}
            {(businesses || []).map((b) => {
              const s = stats[b.id];
              return (
                <tr key={b.id}>
                  <td><Link href={'/admin/b/' + b.id}>{b.name}</Link></td>
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
