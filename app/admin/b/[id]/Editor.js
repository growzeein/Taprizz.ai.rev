'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATES, TYPE_OPTIONS } from '@/lib/templates';

const QTYPES = [
  { value: 'chips_text', label: 'Chips + text box' },
  { value: 'chips', label: 'Chips only' },
  { value: 'text', label: 'Text box only' },
];
const newQ = () => ({ id: 'q' + Math.random().toString(36).slice(2, 8), label: '', type: 'chips_text', chips: [], multi: false, required: false });

export default function Editor({ initial, initialLinks }) {
  const router = useRouter();
  const [tab, setTab] = useState('details');
  const [b, setB] = useState({ ...initial, questions: initial.questions || [] });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState(initialLinks);
  const [slug, setSlug] = useState('');
  const [newLang, setNewLang] = useState('');
  const [linkErr, setLinkErr] = useState('');

  useEffect(() => setLinks(initialLinks), [initialLinks]);

  const up = (k, v) => setB((p) => ({ ...p, [k]: v }));
  const setQ = (i, patch) => setB((p) => ({ ...p, questions: p.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) }));
  const move = (i, d) => setB((p) => {
    const a = [...p.questions]; const j = i + d;
    if (j < 0 || j >= a.length) return p;
    [a[i], a[j]] = [a[j], a[i]];
    return { ...p, questions: a };
  });
  const del = (i) => setB((p) => ({ ...p, questions: p.questions.filter((_, j) => j !== i) }));

  function applyTemplate(type) {
    if (!TEMPLATES[type]) return;
    if (!confirm('This replaces the current questions with the ' + TEMPLATES[type].name + ' template. Continue?')) return;
    setB((p) => ({ ...p, type, questions: TEMPLATES[type].questions() }));
  }

  async function save() {
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/admin/businesses/' + b.id, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(b),
    });
    const data = await res.json();
    setSaving(false);
    setStatus(res.ok ? 'Saved' : data.error || 'Could not save');
    if (res.ok) router.refresh();
  }

  async function removeBusiness() {
    if (!confirm('This deletes the business, its links and logs. Continue?')) return;
    const res = await fetch('/api/admin/businesses/' + b.id, { method: 'DELETE' });
    if (res.ok) { router.push('/admin'); router.refresh(); }
  }

  async function linkCall(method, body) {
    setLinkErr('');
    const res = await fetch('/api/admin/links', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setLinkErr(data.error || 'Error'); return false; }
    router.refresh();
    return true;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const full = (s) => origin + '/' + s;

  return (
    <>
      <div className="tabs" role="tablist">
        {[['details', 'Details'], ['questions', 'Questions'], ['links', 'Short links']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="panel">
          <div className="grid2">
            <div><label className="lbl">Business name</label><input className="field" value={b.name} onChange={(e) => up('name', e.target.value)} /></div>
            <div>
              <label className="lbl">Type</label>
              <select className="field" value={b.type} onChange={(e) => up('type', e.target.value)}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div><label className="lbl">Area / City</label><input className="field" value={b.area} onChange={(e) => up('area', e.target.value)} placeholder="Teliipada, Jaipur" /></div>
            <div>
              <label className="lbl">Review language</label>
              <select className="field" value={b.language} onChange={(e) => up('language', e.target.value)}>
                <option value="hinglish">Hinglish</option><option value="english">English</option><option value="hindi">Hindi (Devanagari)</option>
              </select>
            </div>
          </div>
          <label className="lbl">Services / products (context for the AI. The review only uses what the customer says)</label>
          <textarea className="field" rows={3} value={b.services} onChange={(e) => up('services', e.target.value)} />
          <label className="lbl">Google review link</label>
          <input className="field" value={b.google_review_url} onChange={(e) => up('google_review_url', e.target.value)} placeholder="https://search.google.com/local/writereview?placeid=..." />
          <div className="grid2">
            <div><label className="lbl">Brand color</label><input type="color" className="field" style={{ padding: 4, height: 44 }} value={b.accent} onChange={(e) => up('accent', e.target.value)} /></div>
            <div>
              <label className="lbl">Minimum questions to answer (0 = none)</label>
              <input className="field" type="number" min="0" max="10" value={b.min_answers} onChange={(e) => up('min_answers', e.target.value)} />
            </div>
          </div>
          <button className="btn ghost sm danger" onClick={removeBusiness}>Delete business</button>
        </div>
      )}

      {tab === 'questions' && (
        <>
          <div className="panel row">
            <span className="lbl" style={{ margin: 0 }}>Apply template:</span>
            {TYPE_OPTIONS.map((o) => (
              <button key={o.value} className="btn ghost sm" onClick={() => applyTemplate(o.value)}>{o.label}</button>
            ))}
          </div>
          {b.questions.length === 0 && <p className="hint">No questions. The review will be based on the star rating only.</p>}
          {b.questions.map((q, i) => (
            <div className="qcard" key={q.id}>
              <div className="qcard-head">
                <input className="field" value={q.label} placeholder="Question text" onChange={(e) => setQ(i, { label: e.target.value })} />
                <button className="btn ghost sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button className="btn ghost sm" onClick={() => move(i, 1)} disabled={i === b.questions.length - 1} aria-label="Move down">↓</button>
                <button className="btn ghost sm danger" onClick={() => del(i)}>Remove</button>
              </div>
              <div className="grid2">
                <div>
                  <label className="lbl">Type</label>
                  <select className="field" value={q.type} onChange={(e) => setQ(i, { type: e.target.value })}>
                    {QTYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {q.type !== 'text' && (
                  <div>
                    <label className="lbl">Chips (one per line)</label>
                    <textarea className="field" rows={3} value={(q.chips || []).join('\n')} onChange={(e) => setQ(i, { chips: e.target.value.split('\n') })} />
                  </div>
                )}
              </div>
              <div className="checks">
                <label><input type="checkbox" checked={!!q.required} onChange={(e) => setQ(i, { required: e.target.checked })} /> Required</label>
                {q.type !== 'text' && <label><input type="checkbox" checked={!!q.multi} onChange={(e) => setQ(i, { multi: e.target.checked })} /> Allow multiple chips</label>}
              </div>
            </div>
          ))}
          <button className="btn ghost sm" onClick={() => setB((p) => ({ ...p, questions: [...p.questions, newQ()] }))} disabled={b.questions.length >= 15}>+ Add question</button>
          <p className="hint">All questions are optional by default. Only the star rating is required.</p>
        </>
      )}

      {tab === 'links' && (
        <div className="panel">
          <p className="lbl">New short link</p>
          <div className="row">
            <span className="mono">{origin}/</span>
            <input className="field" style={{ flex: 1, minWidth: 140, margin: 0 }} placeholder="ng" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} />
            <select className="field" style={{ width: 'auto', margin: 0 }} value={newLang} onChange={(e) => setNewLang(e.target.value)} aria-label="Link language">
              <option value="">Language: same as business</option>
              <option value="english">English</option>
              <option value="hinglish">Hinglish</option>
              <option value="hindi">Hindi</option>
            </select>
            <button className="btn sm" disabled={!slug} onClick={async () => { if (await linkCall('POST', { business_id: b.id, slug, language: newLang })) setSlug(''); }}>Create</button>
          </div>
          {linkErr && <p className="err">{linkErr}</p>}
          <div className="scroll-x" style={{ marginTop: 16 }}>
            <table className="table">
              <thead><tr><th>Link</th><th>Language</th><th>Scans</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {links.length === 0 && <tr><td colSpan="5">No links yet.</td></tr>}
                {links.map((l) => (
                  <tr key={l.slug}>
                    <td className="mono"><a href={'/' + l.slug} target="_blank" rel="noreferrer">{full(l.slug)}</a></td>
                    <td>
                      <select className="field" style={{ margin: 0, minWidth: 130 }} value={l.language || ''} onChange={(e) => linkCall('PATCH', { slug: l.slug, language: e.target.value })} aria-label="Link language">
                        <option value="">Same as business</option>
                        <option value="english">English</option>
                        <option value="hinglish">Hinglish</option>
                        <option value="hindi">Hindi</option>
                      </select>
                    </td>
                    <td>{l.scans}</td>
                    <td><span className={'pill' + (l.is_active ? '' : ' off')}>{l.is_active ? 'Active' : 'Paused'}</span></td>
                    <td>
                      <div className="row">
                        <button className="btn ghost sm" onClick={() => navigator.clipboard.writeText(full(l.slug))}>Copy</button>
                        <button className="btn ghost sm" onClick={() => linkCall('PATCH', { slug: l.slug, is_active: !l.is_active })}>{l.is_active ? 'Pause' : 'Resume'}</button>
                        <button className="btn ghost sm" onClick={() => { const n = prompt('New slug', l.slug); if (n && n !== l.slug) linkCall('PATCH', { slug: l.slug, new_slug: n }); }}>Rename</button>
                        <button className="btn ghost sm danger" onClick={() => confirm('Delete this link? Any NFC card or QR using it will stop working.') && linkCall('DELETE', { slug: l.slug })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Write only the short link on the NFC tag (for example {origin || 'https://yourapp.vercel.app'}/ng). You can change the questions or language later without rewriting the card. Link language changes the page text and the review language. Question wording comes from the Questions tab.</p>
        </div>
      )}

      {tab !== 'links' && (
        <div className="sticky-save">
          <button className="btn sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          {status && <span className={status === 'Saved' ? 'ok' : 'err'} style={{ margin: 0 }}>{status}</span>}
        </div>
      )}
    </>
  );
}
