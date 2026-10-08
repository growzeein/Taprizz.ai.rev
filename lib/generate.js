const LANG = {
  hinglish: 'Hinglish (Hindi in Roman script mixed naturally with simple English words, jaise log WhatsApp pe likhte hain)',
  english: 'plain, everyday English, the way an ordinary customer writes: short simple sentences, common words',
  hindi: 'Hindi in Devanagari script',
};

const BANNED = /(100\s?%|guarantee|guaranteed|permanent(ly)? cure|complete(ly)? cure|cured me|no side[- ]effects?|miracle)/i;
export const hasBanned = (t) => BANNED.test(t);

export function buildPrompt({ business, rating, answers, previous }) {
  const n = answers.length;
  const length =
    n === 0 ? '1 short sentence, maximum 2'
    : n <= 2 ? '2 short sentences'
    : '3 to 4 sentences';

  const tone =
    rating >= 5 ? 'warm and happy, but believable. No over-the-top exaggeration.'
    : rating === 4 ? 'positive, with the mild feel of a good-but-not-perfect visit.'
    : rating === 3 ? 'balanced and neutral: some things good, some things average.'
    : 'honest and calm: disappointed but polite, specific about what went wrong if the customer said so.';

  const system = `You help a real customer put their own feedback into words for a Google review of a local business.
Rules:
- Use ONLY the details the customer provided. Never invent treatments, prices, staff names, results or any fact.
- Write in first person as the customer, in ${LANG[business.language] || LANG.hinglish}.
- Length: ${length}. Tone: ${tone}
- Sound like an ordinary person texting a friend about the visit: no marketing words, no emojis, no hashtags, no bullet points.
- Avoid stiff or formal phrases such as "found the experience to be", "exceeded my expectations", "I am satisfied with the care I received", "such focused attention", "very worthy", "highly recommend". Say it simply (e.g. "worth the visit", "the doctor listened properly").
- Do not add any health detail (type of pain, condition) the customer did not give.
- Never write the pattern "Loved the <thing>" or "I loved <thing>". Never treat a health problem as something liked or loved (e.g. never "I liked piles").
- Mention the business name at most once, and only if it sounds natural.
- Never make medical or result claims like "100% cure", "guaranteed", "permanent relief", "no side effects".
- If the customer mentioned an improvement, include it politely.
- Start differently from the previous reviews shown below and avoid their phrasing.
- Output ONLY the review text, nothing else, no quotation marks.`;

  const user = JSON.stringify(
    {
      business: { name: business.name, type: business.type, area: business.area, services: business.services },
      star_rating: rating,
      customer_answers: answers,
      previous_reviews_to_avoid_repeating: previous,
    },
    null,
    1
  );

  return { system, user };
}

async function viaGemini({ system, user }) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 1, maxOutputTokens: 400 },
      }),
    }
  );
  if (!res.ok) throw new Error('Gemini ' + res.status + ' ' + (await res.text()).slice(0, 200));
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
}

async function viaGroq({ system, user }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.GROQ_API_KEY },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 1,
      max_tokens: 400,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error('Groq ' + res.status + ' ' + (await res.text()).slice(0, 200));
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function viaAnthropic({ system, user }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
      max_tokens: 400,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error('Anthropic ' + res.status + ' ' + (await res.text()).slice(0, 200));
  const data = await res.json();
  return (data.content || []).map((b) => b.text || '').join('');
}

// AI_PROVIDER = gemini (default, free tier) | groq (free tier) | anthropic (paid)
export async function callClaude(args) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const fn = provider === 'groq' ? viaGroq : provider === 'anthropic' ? viaAnthropic : viaGemini;
  const text = await fn(args);
  return text.trim().replace(/^["\u201c]|["\u201d]$/g, '');
}
