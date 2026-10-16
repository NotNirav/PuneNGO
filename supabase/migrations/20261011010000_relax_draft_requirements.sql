-- Drafts may be incomplete. Description, causes and area are only
-- required once an NGO is published (the admin form checks this too).

alter table public.ngos
  alter column description set default '',
  alter column causes set default '{}',
  alter column area drop not null;

alter table public.ngos drop constraint if exists ngos_causes_check;

alter table public.ngos
  add constraint ngos_published_complete check (
    status = 'draft'
    or (
      cardinality(causes) >= 1
      and area is not null
      and length(trim(description)) > 0
    )
  );
