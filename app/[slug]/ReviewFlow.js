'use client';
import { useState } from 'react';

const WORDS = { 1: 'Bahut kharab', 2: 'Theek nahi', 3: 'Theek-thaak', 4: 'Accha', 5: 'Bahut badhiya' };

function Star({ on, onClick, n }) {
  return (
    <button type="button" className={'star' + (on ? ' on' : '')} onClick={onClick} aria-label={n + ' star'}>
      <svg viewBox="0 0 24 24"><path d="M12 2.8l2.7 6 6.5.6-4.9 4.3 1.5 6.4L12 16.7 6.2 20l1.5-6.4L2.8 9.4l6.5-.6z" strokeLinejoin="round" /></svg>
    </button>
  );
}

export default function ReviewFlow({ slug, business }) {
  const [rating, setRating] = useState(0);
  const [vals, setVals] = useState({});
  const [review, setReview] = useState('');
  const [logId, setLogId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const qs = business.questions;
  const set = (id, v) => setVals((p) => ({ ...p, [id]: v }));
  const answers = qs.map((q) => ({ label: q.label, value: (vals[q.id] || '').trim() })).filter((a) => a.value);
  const missingRequired = qs.some((q) => q.required && !(vals[q.id] || '').trim());
  const enough = answers.length >= business.minAnswers && !missingRequired;

  function pickChip(q, chip) {
    const cur = vals[q.id] || '';
    if (q.multi) {
      const list = cur ? cur.split(', ').filter(Boolean) : [];
      const next = list.includes(chip) ? list.filter((c) => c !== chip) : [...list, chip];
      set(q.id, next.join(', '));
    } else {
      set(q.id, cur === chip ? '' : chip);
    }
  }
  const isOn = (q, chip) => (vals[q.id] || '').split(', ').includes(chip);

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, rating, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kuch gadbad ho gayi');
      setReview(data.review);
      setLogId(data.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyAndGo() {
    try { await navigator.clipboard.writeText(review); } catch {}
    setCopied(true);
    fetch('/api/posted', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: logId, review }),
      keepalive: true,
    }).catch(() => {});
    if (business.googleUrl) setTimeout(() => { window.location.href = business.googleUrl; }, 1200);
  }

  const style = { '--accent': business.accent || '#0f766e' };

  if (review) {
    return (
      <main className="flow" style={style}>
        <p className="flow-brand">{business.name}</p>
        <h1 className="flow-title">Aapka review taiyar hai</h1>
        <textarea className="field" value={review} onChange={(e) => setReview(e.target.value)} rows={7} aria-label="Aapka review" />
        <p className="hint">Chaho to isse apne words me badal sakte ho. Review aapka hi hai.</p>
        <button className="btn" onClick={copyAndGo} disabled={!review.trim() || copied}>
          {copied ? 'Copy ho gaya. Google khul raha hai…' : 'Copy karke Google pe post karo'}
        </button>
        {copied && <p className="hint">Google page par review box me paste karo aur Post dabao.</p>}
        {copied && !business.googleUrl && <p className="err">Is business ka Google link set nahi hai.</p>}
        {!copied && (
          <button className="btn ghost" onClick={generate} disabled={busy}>
            {busy ? 'Ban raha hai…' : 'Dusra version banao'}
          </button>
        )}
        {error && <p className="err">{error}</p>}
      </main>
    );
  }

  return (
    <main className="flow" style={style}>
      <p className="flow-brand">{business.name}</p>
      <h1 className="flow-title">Aapka experience kaisa raha?</h1>

      <div className="stars" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} n={n} on={n <= rating} onClick={() => setRating(n)} />
        ))}
      </div>
      <p className="rating-word">{rating ? WORDS[rating] : 'Star dabakar rating do'}</p>

      {rating > 0 && (
        <>
          {qs.map((q) => (
            <section className="q" key={q.id}>
              <p className="q-label">
                {q.label}
                {!q.required && <span className="q-opt">optional</span>}
              </p>
              {q.type !== 'text' && q.chips?.length > 0 && (
                <div className="chips">
                  {q.chips.map((c) => (
                    <button type="button" key={c} className={'chip' + (isOn(q, c) ? ' on' : '')} onClick={() => pickChip(q, c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {q.type !== 'chips' && (
                <input
                  className="field"
                  value={vals[q.id] || ''}
                  onChange={(e) => set(q.id, e.target.value)}
                  placeholder="Apne words me likho"
                  maxLength={300}
                />
              )}
            </section>
          ))}

          <button className="btn" onClick={generate} disabled={busy || !enough}>
            {busy ? 'Review ban raha hai…' : 'Review banao'}
          </button>
          {!enough && business.minAnswers > 0 && (
            <p className="hint">Kam se kam {business.minAnswers} sawal ka jawab do.</p>
          )}
          {error && <p className="err">{error}</p>}
          <p className="note">Review aapke jawabon se banta hai. Post karne se pehle aap use badal sakte ho.</p>
        </>
      )}
    </main>
  );
}
