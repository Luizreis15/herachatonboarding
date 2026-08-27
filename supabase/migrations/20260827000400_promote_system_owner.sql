create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  is_owner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('admin', 'super_admin'))
);

create unique index admin_users_single_owner
  on public.admin_users (is_owner)
  where is_owner;

create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row
  execute function public.set_updated_at();

alter table public.admin_users enable row level security;

insert into public.admin_users (id, email, role, is_owner)
select id, email, 'super_admin', true
from auth.users
where lower(email) = lower('leduardoreis@gmail.com')
on conflict (id) do update
set
  email = excluded.email,
  role = 'super_admin',
  is_owner = true;

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'role', 'super_admin',
    'is_owner', true
  )
where lower(email) = lower('leduardoreis@gmail.com');

create or replace function public.is_system_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and is_owner = true
      and role = 'super_admin'
  );
$$;

revoke all on function public.is_system_owner() from public;
grant execute on function public.is_system_owner() to authenticated;
