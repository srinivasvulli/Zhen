create extension if not exists pgcrypto;

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null check (username ~ '^[a-z0-9-]{3,40}$'),
  full_name text not null,
  email text not null,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  summary text,
  theme_slug text not null default 'minimalist' check (theme_slug in ('minimalist', 'midnight', 'sand')),
  avatar_url text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company text not null,
  role text not null,
  location text,
  start_date text not null check (start_date ~ '^(0[1-9]|1[0-2])/[0-9]{4}$'),
  end_date text check (end_date is null or end_date = 'Present' or end_date ~ '^(0[1-9]|1[0-2])/[0-9]{4}$'),
  description text[] not null default '{}',
  order_index integer not null default 0
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  bullets text[] not null default '{}',
  image_url text,
  project_url text,
  order_index integer not null default 0
);

create table public.educations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null,
  degree text not null,
  field_of_study text,
  graduation_date text,
  order_index integer not null default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  order_index integer not null default 0,
  unique (profile_id, name)
);

create index experiences_profile_order_idx on public.experiences(profile_id, order_index);
create index projects_profile_order_idx on public.projects(profile_id, order_index);
create index educations_profile_order_idx on public.educations(profile_id, order_index);

alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.educations enable row level security;
alter table public.skills enable row level security;

create policy "Public portfolios are readable" on public.profiles for select using (true);
create policy "Public experience is readable" on public.experiences for select using (true);
create policy "Public projects are readable" on public.projects for select using (true);
create policy "Public education is readable" on public.educations for select using (true);
create policy "Public skills are readable" on public.skills for select using (true);
create policy "Users manage their profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage their experiences" on public.experiences for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users manage their projects" on public.projects for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users manage their education" on public.educations for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users manage their skills" on public.skills for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resume-source', 'resume-source', false, 5242880, array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "Users manage own resume sources" on storage.objects for all
using (bucket_id = 'resume-source' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'resume-source' and auth.uid()::text = (storage.foldername(name))[1]);
