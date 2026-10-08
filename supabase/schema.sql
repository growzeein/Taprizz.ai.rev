-- Supabase -> SQL Editor me poora paste karke Run karo
create extension if not exists pgcrypto;

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'generic',
  area text not null default '',
  services text not null default '',
  google_review_url text not null default '',
  language text not null default 'english',
  accent text not null default '#0f766e',
  min_answers int not null default 0,
  questions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists short_links (
  slug text primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  is_active boolean not null default true,
  scans int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists review_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  slug text,
  rating int,
  review text,
  posted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists review_logs_business_idx on review_logs (business_id, created_at desc);

-- Sab kuch sirf server (service role) se chalega, public access band
alter table businesses enable row level security;
alter table short_links enable row level security;
alter table review_logs enable row level security;

create or replace function increment_scans(p_slug text) returns void
language sql security definer as $$
  update short_links set scans = scans + 1 where slug = p_slug;
$$;
