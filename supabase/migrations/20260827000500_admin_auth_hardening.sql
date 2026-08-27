-- Harden existing SECURITY DEFINER functions and introduce authenticated admin access.
-- Do not edit previously applied migrations.

-- ---------------------------------------------------------------------------
-- 1) Hardening: empty search_path + schema-qualified relations
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create or replace function public.get_onboarding_link_by_token(_token text)
returns table (
  id uuid,
  cliente_nome text,
  empresa_nome text,
  status text,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if _token is null or length(pg_catalog.btrim(_token)) = 0 then
    return;
  end if;

  return query
  select
    link.id,
    link.cliente_nome,
    link.empresa_nome,
    case
      when link.status = 'ativo'
        and link.expires_at is not null
        and link.expires_at < pg_catalog.now()
        then 'expirado'
      else link.status
    end,
    link.expires_at
  from public.onboarding_links as link
  where link.token = _token
  limit 1;
end;
$$;

create or replace function public.submit_onboarding(_token text, _payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  link_row public.onboarding_links%rowtype;
  new_submission_id uuid;
  setor_item jsonb;
  usuario_item jsonb;
  setor_map jsonb := '{}'::jsonb;
  new_setor_id uuid;
  client_id text;
  mapped_setor_id text;
  company_name text;
  company_cnpj text;
  company_whatsapp text;
  admin_name text;
  admin_email text;
begin
  if _token is null or length(pg_catalog.btrim(_token)) = 0 then
    raise exception 'invalid_token';
  end if;

  if _payload is null or pg_catalog.jsonb_typeof(_payload) <> 'object' then
    raise exception 'invalid_payload';
  end if;

  select * into link_row
  from public.onboarding_links
  where token = _token
  for update;

  if not found then
    raise exception 'invalid_token';
  end if;

  if link_row.status = 'revogado' then
    raise exception 'invite_revoked';
  end if;

  if link_row.status = 'utilizado' then
    raise exception 'invite_used';
  end if;

  if link_row.status = 'expirado'
    or (link_row.expires_at is not null and link_row.expires_at < pg_catalog.now()) then
    raise exception 'invite_expired';
  end if;

  if link_row.status is distinct from 'ativo' then
    raise exception 'invalid_token';
  end if;

  if exists (
    select 1
    from public.submissions as submission
    where submission.onboarding_link_id = link_row.id
  ) then
    raise exception 'invite_used';
  end if;

  company_name := nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'nome'), '');
  company_cnpj := nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'cnpj'), '');
  company_whatsapp := nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'whatsapp'), '');
  admin_name := nullif(pg_catalog.btrim(_payload -> 'administrador' ->> 'nome'), '');
  admin_email := nullif(pg_catalog.btrim(_payload -> 'administrador' ->> 'email'), '');

  if company_name is null
    or company_cnpj is null
    or company_whatsapp is null
    or admin_name is null
    or admin_email is null then
    raise exception 'invalid_payload';
  end if;

  if pg_catalog.jsonb_typeof(_payload -> 'setores') is distinct from 'array'
    or pg_catalog.jsonb_array_length(_payload -> 'setores') < 1 then
    raise exception 'invalid_payload';
  end if;

  insert into public.submissions (
    onboarding_link_id,
    empresa_nome,
    empresa_cnpj,
    empresa_whatsapp,
    empresa_cep,
    empresa_rua,
    empresa_numero,
    empresa_complemento,
    empresa_bairro,
    empresa_cidade,
    empresa_estado,
    admin_nome,
    admin_email
  )
  values (
    link_row.id,
    company_name,
    company_cnpj,
    company_whatsapp,
    nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'cep'), ''),
    nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'rua'), ''),
    nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'numero'), ''),
    nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'complemento'), ''),
    nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'bairro'), ''),
    nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'cidade'), ''),
    nullif(pg_catalog.btrim(_payload -> 'empresa' ->> 'estado'), ''),
    admin_name,
    admin_email
  )
  returning id into new_submission_id;

  for setor_item in select pg_catalog.jsonb_array_elements(_payload -> 'setores')
  loop
    client_id := nullif(pg_catalog.btrim(setor_item ->> 'client_id'), '');
    if client_id is null or nullif(pg_catalog.btrim(setor_item ->> 'nome'), '') is null then
      raise exception 'invalid_payload';
    end if;

    insert into public.setores (submission_id, nome)
    values (new_submission_id, pg_catalog.btrim(setor_item ->> 'nome'))
    returning id into new_setor_id;

    setor_map := setor_map || pg_catalog.jsonb_build_object(client_id, new_setor_id);
  end loop;

  if pg_catalog.jsonb_typeof(_payload -> 'usuarios') = 'array' then
    for usuario_item in select pg_catalog.jsonb_array_elements(_payload -> 'usuarios')
    loop
      mapped_setor_id := setor_map ->> (usuario_item ->> 'setor_client_id');
      if mapped_setor_id is null
        or nullif(pg_catalog.btrim(usuario_item ->> 'nome'), '') is null
        or nullif(pg_catalog.btrim(usuario_item ->> 'email'), '') is null then
        raise exception 'invalid_payload';
      end if;

      insert into public.usuarios (submission_id, setor_id, nome, email)
      values (
        new_submission_id,
        mapped_setor_id::uuid,
        pg_catalog.btrim(usuario_item ->> 'nome'),
        pg_catalog.btrim(usuario_item ->> 'email')
      );
    end loop;
  end if;

  update public.onboarding_links
  set status = 'utilizado', used_at = pg_catalog.now()
  where id = link_row.id;

  return new_submission_id;
end;
$$;

revoke all on function public.get_onboarding_link_by_token(text) from public;
revoke all on function public.submit_onboarding(text, jsonb) from public;
grant execute on function public.get_onboarding_link_by_token(text) to anon, authenticated;
grant execute on function public.submit_onboarding(text, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) admin_users: evolve schema without rewriting applied history
-- ---------------------------------------------------------------------------

alter table public.admin_users
  rename column id to user_id;

alter table public.admin_users
  add column if not exists nome text;

alter table public.admin_users
  add column if not exists active boolean not null default true;

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

update public.admin_users
set role = 'admin'
where role = 'super_admin';

alter table public.admin_users
  alter column role set default 'operador';

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('admin', 'operador'));

insert into public.admin_users (user_id, email, role, is_owner, active)
select id, email, 'admin', true, true
from auth.users
where lower(email) = lower('leduardoreis@gmail.com')
on conflict (user_id) do update
set
  email = excluded.email,
  role = 'admin',
  is_owner = true,
  active = true;

create or replace function public.is_system_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and is_owner = true
      and active = true
  );
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and active = true
  );
$$;

revoke all on function public.is_system_owner() from public, anon;
revoke all on function public.is_active_admin() from public, anon;
grant execute on function public.is_system_owner() to authenticated;
grant execute on function public.is_active_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Status-only updates on submissions
-- ---------------------------------------------------------------------------

create or replace function public.enforce_submission_status_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.onboarding_link_id is distinct from old.onboarding_link_id
    or new.empresa_nome is distinct from old.empresa_nome
    or new.empresa_cnpj is distinct from old.empresa_cnpj
    or new.empresa_whatsapp is distinct from old.empresa_whatsapp
    or new.empresa_cep is distinct from old.empresa_cep
    or new.empresa_rua is distinct from old.empresa_rua
    or new.empresa_numero is distinct from old.empresa_numero
    or new.empresa_complemento is distinct from old.empresa_complemento
    or new.empresa_bairro is distinct from old.empresa_bairro
    or new.empresa_cidade is distinct from old.empresa_cidade
    or new.empresa_estado is distinct from old.empresa_estado
    or new.admin_nome is distinct from old.admin_nome
    or new.admin_email is distinct from old.admin_email
    or new.created_at is distinct from old.created_at
  then
    raise exception 'only_status_update_allowed';
  end if;

  if new.status not in ('pendente', 'revisado', 'criado') then
    raise exception 'invalid_status';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_submission_status_only on public.submissions;
create trigger enforce_submission_status_only
  before update on public.submissions
  for each row
  execute function public.enforce_submission_status_only();

-- ---------------------------------------------------------------------------
-- 4) Privileges: no anonymous table access; admin SELECT + status UPDATE
-- ---------------------------------------------------------------------------

revoke all on table public.onboarding_links from public, anon, authenticated;
revoke all on table public.submissions from public, anon, authenticated;
revoke all on table public.setores from public, anon, authenticated;
revoke all on table public.usuarios from public, anon, authenticated;
revoke all on table public.admin_users from public, anon, authenticated;

grant select on table public.submissions to authenticated;
grant select on table public.setores to authenticated;
grant select on table public.usuarios to authenticated;
grant select on table public.admin_users to authenticated;
grant update (status) on table public.submissions to authenticated;

-- ---------------------------------------------------------------------------
-- 5) RLS policies
-- ---------------------------------------------------------------------------

drop policy if exists admin_select_own_profile on public.admin_users;
drop policy if exists admin_select_submissions on public.submissions;
drop policy if exists admin_update_submission_status on public.submissions;
drop policy if exists admin_select_setores on public.setores;
drop policy if exists admin_select_usuarios on public.usuarios;

create policy admin_select_own_profile
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy admin_select_submissions
  on public.submissions
  for select
  to authenticated
  using (public.is_active_admin());

create policy admin_update_submission_status
  on public.submissions
  for update
  to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy admin_select_setores
  on public.setores
  for select
  to authenticated
  using (public.is_active_admin());

create policy admin_select_usuarios
  on public.usuarios
  for select
  to authenticated
  using (public.is_active_admin());
