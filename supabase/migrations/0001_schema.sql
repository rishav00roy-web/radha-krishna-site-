-- Shri Shri Radha-Krishna Prem Mandir: schema, roles and row-level security.
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to read top to bottom.

create extension if not exists pgcrypto;

-------------------------------------------------------------------------------
-- Roles
-------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'admin', 'super_admin')),
  created_at timestamptz not null default now()
);

create or replace function public.role_rank(r text) returns int
language sql immutable as $$
  select case r when 'viewer' then 0 when 'editor' then 1 when 'admin' then 2 when 'super_admin' then 3 else -1 end
$$;

-- True when the signed-in user's role is at least `min_role`.
create or replace function public.has_role(min_role text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select public.role_rank(p.role) from public.profiles p where p.id = auth.uid()),
    -1
  ) >= public.role_rank(min_role)
$$;

-- Every new auth user gets a viewer profile. There is no public sign-up: invite staff from the dashboard.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-------------------------------------------------------------------------------
-- Content
-------------------------------------------------------------------------------
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  status text not null default 'proposed' check (status in ('proposed', 'under_construction', 'completed')),
  icon text not null default 'temple',
  pos_x numeric(5, 2) not null default 50 check (pos_x between 0 and 100),
  pos_y numeric(5, 2) not null default 50 check (pos_y between 0 and 100),
  image_url text,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz check (ends_at is null or ends_at >= starts_at),
  venue text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_starts_at_idx on public.events (starts_at);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  pinned boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('architecture', 'art', 'masterplan', 'sarovar', 'gaushala', 'bamboo', 'medicinal', 'fruit', 'updates')),
  title jsonb not null default '{}'::jsonb,
  caption jsonb not null default '{}'::jsonb,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  url text,
  thumbnail_url text,
  is_placeholder boolean not null default false,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Progress: a stage can only leave "planned" once it is verified (the brief's honesty rule, enforced here).
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  step int not null unique,
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  verified boolean not null default false,
  verified_on date,
  evidence_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint milestone_progress_needs_verification check (status = 'planned' or verified)
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title jsonb not null default '{}'::jsonb,
  excerpt jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  cover_url text,
  published_at timestamptz not null default now(),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Key/value settings: 'organisation', 'location', 'media'.
create table if not exists public.site_settings (
  key text primary key check (key in ('organisation', 'location', 'media')),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  mobile text not null check (char_length(mobile) between 10 and 16),
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 4000),
  locale text not null default 'en' check (locale in ('en', 'as', 'hi')),
  user_agent text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

do $$
declare t text;
begin
  foreach t in array array['facilities', 'events', 'announcements', 'gallery_items', 'milestones', 'project_updates'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-------------------------------------------------------------------------------
-- Row-level security
-------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.facilities enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;
alter table public.gallery_items enable row level security;
alter table public.milestones enable row level security;
alter table public.project_updates enable row level security;
alter table public.site_settings enable row level security;
alter table public.enquiries enable row level security;

-- profiles: you can read yourself; only super admins read everyone and change roles.
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role('super_admin'));
drop policy if exists "profiles super admin update" on public.profiles;
create policy "profiles super admin update" on public.profiles for update to authenticated
  using (public.has_role('super_admin')) with check (public.has_role('super_admin'));

-- Published content is public; staff (viewer and up) also see drafts; editors write.
do $$
declare t text;
begin
  foreach t in array array['facilities', 'events', 'announcements', 'gallery_items', 'project_updates'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (published or public.has_role(''viewer''))', t);
    execute format('drop policy if exists "editor write" on public.%I', t);
    execute format('create policy "editor write" on public.%I for all to authenticated using (public.has_role(''editor'')) with check (public.has_role(''editor''))', t);
  end loop;
end $$;

-- Milestones: public read (minus the internal evidence column, see grants below); admins write.
drop policy if exists "public read" on public.milestones;
create policy "public read" on public.milestones for select to anon, authenticated using (true);
drop policy if exists "admin write" on public.milestones;
create policy "admin write" on public.milestones for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

revoke select on public.milestones from anon;
grant select (id, step, title, description, status, verified, verified_on, created_at, updated_at) on public.milestones to anon;

-- Settings: public read; admins write.
drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admin write" on public.site_settings;
create policy "admin write" on public.site_settings for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- Enquiries: anyone may submit a new one; only admins read or change them.
drop policy if exists "anyone submits" on public.enquiries;
create policy "anyone submits" on public.enquiries for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin read" on public.enquiries;
create policy "admin read" on public.enquiries for select to authenticated using (public.has_role('admin'));
drop policy if exists "admin update" on public.enquiries;
create policy "admin update" on public.enquiries for update to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
drop policy if exists "admin delete" on public.enquiries;
create policy "admin delete" on public.enquiries for delete to authenticated using (public.has_role('admin'));

-------------------------------------------------------------------------------
-- Storage: one public "media" bucket; editors upload.
-------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "media editor insert" on storage.objects;
create policy "media editor insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role('editor'));
drop policy if exists "media editor update" on storage.objects;
create policy "media editor update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_role('editor'));
drop policy if exists "media editor delete" on storage.objects;
create policy "media editor delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role('editor'));
