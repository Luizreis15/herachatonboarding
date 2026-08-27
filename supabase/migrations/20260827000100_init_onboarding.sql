create table public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references public.invites (id),
  company_name text not null,
  responsible_name text not null,
  status text not null default 'pendente',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_status_check
    check (status in ('pendente', 'revisado', 'criado'))
);

create index submissions_created_at_idx on public.submissions (created_at desc);

alter table public.invites enable row level security;
alter table public.submissions enable row level security;

create policy "authenticated_select_invites"
  on public.invites
  for select
  to authenticated
  using (true);

create policy "authenticated_insert_invites"
  on public.invites
  for insert
  to authenticated
  with check (true);

create policy "authenticated_select_submissions"
  on public.submissions
  for select
  to authenticated
  using (true);

create policy "authenticated_update_submissions"
  on public.submissions
  for update
  to authenticated
  using (true)
  with check (true);

create or replace function public.get_invite_by_token(_token text)
returns table (
  id uuid,
  token text,
  consumed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select i.id, i.token, i.consumed_at
  from public.invites i
  where i.token = _token
  limit 1;
$$;

create or replace function public.submit_onboarding(_token text, _data jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.invites%rowtype;
  new_id uuid;
  company_name text;
  responsible_name text;
begin
  if _token is null or length(trim(_token)) = 0 then
    raise exception 'invalid_token';
  end if;

  select * into invite_row
  from public.invites
  where token = _token
  for update;

  if not found then
    raise exception 'invalid_token';
  end if;

  if invite_row.consumed_at is not null then
    raise exception 'invite_consumed';
  end if;

  company_name := coalesce(nullif(trim(_data -> 'company' ->> 'name'), ''), '');
  responsible_name := coalesce(nullif(trim(_data -> 'admin' ->> 'name'), ''), '');

  if company_name = '' or responsible_name = '' then
    raise exception 'invalid_payload';
  end if;

  insert into public.submissions (invite_id, company_name, responsible_name, data)
  values (invite_row.id, company_name, responsible_name, _data)
  returning id into new_id;

  update public.invites
  set consumed_at = now()
  where id = invite_row.id;

  return new_id;
end;
$$;

revoke all on function public.get_invite_by_token(text) from public;
revoke all on function public.submit_onboarding(text, jsonb) from public;
grant execute on function public.get_invite_by_token(text) to anon, authenticated;
grant execute on function public.submit_onboarding(text, jsonb) to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger submissions_set_updated_at
  before update on public.submissions
  for each row
  execute function public.set_updated_at();

insert into public.invites (token)
values ('cliente-teste')
on conflict (token) do nothing;
