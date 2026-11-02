create table if not exists public.public_healthcare_reports (
  id uuid primary key default gen_random_uuid(),
  hospital_name text not null check (char_length(btrim(hospital_name)) between 1 and 160),
  hospital_location text not null check (char_length(btrim(hospital_location)) between 1 and 160),
  issue_category text not null check (
    issue_category in (
      'doctor_unavailable',
      'medicines_unavailable',
      'long_wait',
      'cleanliness',
      'equipment_unavailable',
      'accessibility',
      'other'
    )
  ),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected')
  ),
  created_at timestamptz not null default now()
);

create index if not exists public_healthcare_reports_approved_category_idx
  on public.public_healthcare_reports (issue_category)
  where status = 'approved';

alter table public.public_healthcare_reports enable row level security;
revoke all on public.public_healthcare_reports from anon, authenticated;
grant select, insert, update, delete on public.public_healthcare_reports to service_role;

comment on table public.public_healthcare_reports is
  'Anonymous public healthcare service reports. Review pending rows before setting status to approved; only approved category totals are exposed publicly.';
