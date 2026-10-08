'use client';
import { useState } from 'react';

const T = {
  en: {
    title: 'How was your experience?',
    words: { 1: 'Very poor', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent' },
    tapStars: 'Tap a star to rate',
    optional: 'optional',
    placeholder: 'Or type in your own words',
    make: 'Create my review',
    making: 'Writing your review…',
    minHint: (n) => `Please answer at least ${n} question${n > 1 ? 's' : ''}.`,
    note: 'Your review is written from your answers. You can edit it before posting.',
    readyTitle: 'Your review is ready',
    editHint: 'Feel free to change anything. It is your review.',
    copy: 'Copy and post on Google',
    copied: 'Copied. Opening Google…',
    pasteHint: 'On the Google page, paste your review and tap Post.',
    noLink: 'No Google review link is set for this business.',
    another: 'Write another version',
    aria: 'Your review',
    errors: {
      NO_RATING: 'Please select a star rating first.',
      RATE: 'Too many attempts. Please try again in a while.',
      INACTIVE: 'This link is not active.',
      MIN: 'Please answer a bit more.',
      FAIL: 'Something went wrong. Please try again.',
    },
  },
  hi: {
    title: 'आपका अनुभव कैसा रहा?',
    words: { 1: 'बहुत खराब', 2: 'ठीक नहीं', 3: 'ठीक-ठाक', 4: 'अच्छा', 5: 'बहुत बढ़िया' },
    tapStars: 'रेटिंग के लिए स्टार दबाएँ',
    optional: 'वैकल्पिक',
    placeholder: 'या अपने शब्दों में लिखें',
    make: 'मेरा रिव्यू बनाएँ',
    making: 'रिव्यू तैयार हो रहा है…',
    minHint: (n) => `कम से कम ${n} सवाल का जवाब दें।`,
    note: 'रिव्यू आपके जवाबों से बनता है। पोस्ट करने से पहले आप इसे बदल सकते हैं।',
    readyTitle: 'आपका रिव्यू तैयार है',
    editHint: 'आप इसमें कुछ भी बदल सकते हैं। यह आपका रिव्यू है।',
    copy: 'कॉपी करें और Google पर पोस्ट करें',
    copied: 'कॉपी हो गया। Google खुल रहा है…',
    pasteHint: 'Google पेज पर रिव्यू पेस्ट करें और Post दबाएँ।',
    noLink: 'इस बिज़नेस का Google रिव्यू लिंक सेट नहीं है।',
    another: 'दूसरा वर्ज़न बनाएँ',
    aria: 'आपका रिव्यू',
    errors: {
      NO_RATING: 'पहले स्टार रेटिंग दें।',
      RATE: 'बहुत बार कोशिश हो गई। थोड़ी देर बाद फिर कोशिश करें।',
      INACTIVE: 'यह लिंक सक्रिय नहीं है।',
      MIN: 'थोड़ा और बताएँ।',
      FAIL: 'कुछ गड़बड़ हो गई। फिर कोशिश करें।',
    },
  },
  hinglish: {
    title: 'Aapka experience kaisa raha?',
    words: { 1: 'Bahut kharab', 2: 'Theek nahi', 3: 'Theek-thaak', 4: 'Accha', 5: 'Bahut badhiya' },
    tapStars: 'Rating ke liye star dabayein',
    optional: 'optional',
    placeholder: 'Ya apne words me likhein',
    make: 'Review banao',
    making: 'Review ban raha hai…',
    minHint: (n) => `Kam se kam ${n} sawal ka jawab dein.`,
    note: 'Review aapke jawabon se banta hai. Post karne se pehle aap ise badal sakte hain.',
    readyTitle: 'Aapka review taiyar hai',
    editHint: 'Aap ismein kuch bhi badal sakte hain. Ye aapka review hai.',
    copy: 'Copy karke Google pe post karein',
    copied: 'Copy ho gaya. Google khul raha hai…',
    pasteHint: 'Google page par review paste karein aur Post dabayein.',
    noLink: 'Is business ka Google review link set nahi hai.',
    another: 'Dusra version banao',
    aria: 'Aapka review',
    errors: {
      NO_RATING: 'Pehle star rating dein.',
      RATE: 'Bahut baar try ho gaya. Thodi der baad dobara try karein.',
      INACTIVE: 'Ye link active nahi hai.',
      MIN: 'Thoda aur batayein.',
      FAIL: 'Kuch gadbad ho gayi. Dobara try karein.',
    },
  },
};

function Star({ on, onClick, n }) {
  return (
    <button type="button" className={'star' + (on ? ' on' : '')} onClick={onClick} aria-label={n + ' star'}>
      <svg viewBox="0 0 24 24"><path d="M12 2.8l2.7 6 6.5.6-4.9 4.3 1.5 6.4L12 16.7 6.2 20l1.5-6.4L2.8 9.4l6.5-.6z" strokeLinejoin="round" /></svg>
    </button>
  );
}

const LANGS = [
  { id: 'en', label: 'English', api: 'english' },
  { id: 'hi', label: 'हिन्दी', api: 'hindi' },
  { id: 'hinglish', label: 'Hinglish', api: 'hinglish' },
];

export default function ReviewFlow({ slug, business }) {
  const [lang, setLang] = useState(T[business.language] ? business.language : 'en');
  const t = T[lang] || T.en;
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
        body: JSON.stringify({ slug, rating, answers, language: (LANGS.find((l) => l.id === lang) || LANGS[0]).api }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(t.errors[data.code] || t.errors.FAIL);
      setReview(data.review);
      setLogId(data.id);
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? t.errors.FAIL : e.message);
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


  const switcher = (
    <div className="chips" role="group" aria-label="Language" style={{ margin: '0 0 14px' }}>
      {LANGS.map((l) => (
        <button
          type="button"
          key={l.id}
          className={'chip' + (lang === l.id ? ' on' : '')}
          style={{ padding: '5px 12px', fontSize: 13 }}
          onClick={() => setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  const style = { '--accent': business.accent || '#0f766e' };

  if (review) {
    return (
      <main className="flow" style={style}>
        {switcher}
        <p className="flow-brand">{business.name}</p>
        <h1 className="flow-title">{t.readyTitle}</h1>
        <textarea className="field" value={review} onChange={(e) => setReview(e.target.value)} rows={7} aria-label={t.aria} />
        <p className="hint">{t.editHint}</p>
        <button className="btn" onClick={copyAndGo} disabled={!review.trim() || copied}>
          {copied ? t.copied : t.copy}
        </button>
        {copied && <p className="hint">{t.pasteHint}</p>}
        {copied && !business.googleUrl && <p className="err">{t.noLink}</p>}
        {!copied && (
          <button className="btn ghost" onClick={generate} disabled={busy}>
            {busy ? t.making : t.another}
          </button>
        )}
        {error && <p className="err">{error}</p>}
      </main>
    );
  }

  return (
    <main className="flow" style={style}>
      {switcher}
      <p className="flow-brand">{business.name}</p>
      <h1 className="flow-title">{t.title}</h1>

      <div className="stars" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} n={n} on={n <= rating} onClick={() => setRating(n)} />
        ))}
      </div>
      <p className="rating-word">{rating ? t.words[rating] : t.tapStars}</p>

      {rating > 0 && (
        <>
          {qs.map((q) => (
            <section className="q" key={q.id}>
              <p className="q-label">
                {q.label}
                {!q.required && <span className="q-opt">{t.optional}</span>}
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
                  placeholder={t.placeholder}
                  maxLength={300}
                />
              )}
            </section>
          ))}

          <button className="btn" onClick={generate} disabled={busy || !enough}>
            {busy ? t.making : t.make}
          </button>
          {!enough && business.minAnswers > 0 && (
            <p className="hint">{t.minHint(business.minAnswers)}</p>
          )}
          {error && <p className="err">{error}</p>}
          <p className="note">{t.note}</p>
        </>
      )}
    </main>
  );
}
