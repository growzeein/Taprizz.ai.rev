# Taprizz Review: setup (15 min)

## 1. Supabase (free)
1. supabase.com par naya project banao.
2. SQL Editor kholo, `supabase/schema.sql` ka poora content paste karke **Run** karo.
3. Project Settings -> API se `Project URL` aur `service_role` key copy karo.

## 2. Free AI key (card nahi chahiye)
aistudio.google.com/apikey se Gemini key banao (free tier). Env me `AI_PROVIDER=gemini` aur `GEMINI_API_KEY` daalo.
Agar Gemini ka model naam purana ho jaye to `GEMINI_MODEL` badal do. Alternative: Groq (console.groq.com) ki free key, `AI_PROVIDER=groq`.

## 3. Vercel
1. Ye folder GitHub pe daalo (ya Vercel CLI se deploy karo) aur Vercel me import karo.
2. Environment Variables me `.env.example` wale saare variables daalo:
   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AI_PROVIDER, GEMINI_API_KEY, GEMINI_MODEL,
   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECRET
3. Deploy karo.

## 4. Use
1. `/admin` kholo, login karo.
2. Naya business banao -> type chuno (template ke questions apne aap aa jayenge).
3. Details tab: Google review link, language, color, services.
4. Questions tab: questions/chips edit karo, Save.
5. Short links tab: slug banao (jaise `ng`). Link: `https://tumhara-app.vercel.app/ng`.
6. Wahi link NFC tag / QR me daalo.

Google review link kaise milega: Google Business Profile -> "Get more reviews" -> link copy.

## Local run
npm install, `.env.local` banao (`.env.example` copy karke), phir `npm run dev`.
