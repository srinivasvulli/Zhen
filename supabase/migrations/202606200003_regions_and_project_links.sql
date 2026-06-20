alter table public.profiles add column if not exists target_region text not null default 'us_ca' check (target_region in ('us_ca', 'uk_au', 'europe'));
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists nationality text;
alter table public.profiles add column if not exists photo_url text;
alter table public.projects add column if not exists repo_url text;
alter table public.projects add column if not exists live_url text;
alter table public.projects add column if not exists article_url text;
