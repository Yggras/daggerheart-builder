-- Daggerheart Builder — Supabase schema for character cloud sync (Slice 2).
-- Applied via the Supabase CLI migration flow: `npx supabase db push --db-url <url>`.
-- The `data` JSONB column holds the full Character document and is the source of truth on pull;
-- the scalar columns exist for RLS, indexing, and ordering. See src/character/sync/.

create table if not exists public.characters (
  id             uuid primary key,
  owner_id       uuid not null references auth.users (id) on delete cascade,
  status         text not null,
  schema_version int  not null,
  srd_version    text not null,
  updated_at     timestamptz not null,
  data           jsonb not null,
  created_at     timestamptz not null default now()
);

alter table public.characters enable row level security;

-- A user can do anything with their own characters and nothing with anyone else's.
drop policy if exists "owner_all" on public.characters;
create policy "owner_all" on public.characters
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index if not exists characters_owner_idx on public.characters (owner_id);

-- Enable Realtime so remote changes stream to connected devices.
alter publication supabase_realtime add table public.characters;
