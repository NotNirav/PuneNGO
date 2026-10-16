-- NGOConnect — initial schema
-- Public (anon) can only read PUBLISHED rows of `ngos`.
-- Everything else (drafts, writes, ngo_private) is only reachable with the
-- service role key, which lives on the server and is used by the hidden admin panel.
-- Causes, help types and areas are stored as slugs from src/config/.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.ngos (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique
                        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                text not null check (length(trim(name)) > 0),
  tagline             text check (tagline is null or length(tagline) <= 140),
  description         text not null,
  activities          text[] not null default '{}',
  causes              text[] not null check (cardinality(causes) >= 1),
  help_types          text[] not null default '{}',
  help_notes          text,
  area                text not null,
  address             text,
  maps_url            text,
  lat                 double precision check (lat is null or lat between -90 and 90),
  lng                 double precision check (lng is null or lng between -180 and 180),
  phone               text,
  whatsapp            text,
  email               text,
  website             text,
  instagram           text,
  facebook            text,
  linkedin            text,
  youtube             text,
  donation_link       text,
  founded_year        int check (founded_year is null or founded_year between 1800 and 2100),
  registration_type   text,
  registration_number text,
  visiting_hours      text,
  languages           text[] not null default '{}',
  logo_url            text,
  cover_url           text,
  gallery_urls        text[] not null default '{}'
                        check (cardinality(gallery_urls) <= 6),
  is_featured         boolean not null default false,
  status              text not null default 'draft'
                        check (status in ('draft', 'published')),
  is_sample           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  published_at        timestamptz
);

create index ngos_status_idx on public.ngos (status);
create index ngos_area_idx on public.ngos (area);
create index ngos_causes_idx on public.ngos using gin (causes);

create table public.ngo_private (
  ngo_id               uuid primary key references public.ngos (id) on delete cascade,
  contact_person       text,
  contact_person_phone text,
  internal_notes       text,
  data_received_on     date
);

-- ---------------------------------------------------------------------------
-- Timestamps: updated_at on every change, published_at when first published
-- ---------------------------------------------------------------------------

create function public.ngos_set_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger ngos_set_timestamps
before insert or update on public.ngos
for each row execute function public.ngos_set_timestamps();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.ngos enable row level security;
alter table public.ngo_private enable row level security;

-- Anyone may read published NGOs. No other policies exist, so anon/authenticated
-- cannot see drafts or write anything. The service role bypasses RLS.
create policy "Public can read published NGOs"
  on public.ngos for select
  to anon, authenticated
  using (status = 'published');

-- Belt and braces: remove write privileges and all access to private data.
revoke insert, update, delete, truncate on public.ngos from anon, authenticated;
revoke all on public.ngo_private from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket for NGO photos. No storage policies are added,
-- so only the service role (admin server) can upload, change or delete files,
-- and the public cannot list the bucket — only fetch files by URL.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ngo-images',
  'ngo-images',
  true,
  5242880, -- 5 MB
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;
