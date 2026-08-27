-- Remove circular FK and expose public onboarding only via RPCs.

alter table public.onboarding_links
  drop constraint if exists onboarding_links_submission_id_fkey;

alter table public.onboarding_links
  drop column if exists submission_id;

create unique index if not exists submissions_onboarding_link_id_unique
  on public.submissions (onboarding_link_id)
  where onboarding_link_id is not null;

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
set search_path = public
as $$
begin
  if _token is null or length(trim(_token)) = 0 then
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
        and link.expires_at < now()
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
set search_path = public
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
  if _token is null or length(trim(_token)) = 0 then
    raise exception 'invalid_token';
  end if;

  if _payload is null or jsonb_typeof(_payload) <> 'object' then
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
    or (link_row.expires_at is not null and link_row.expires_at < now()) then
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

  company_name := nullif(trim(_payload -> 'empresa' ->> 'nome'), '');
  company_cnpj := nullif(trim(_payload -> 'empresa' ->> 'cnpj'), '');
  company_whatsapp := nullif(trim(_payload -> 'empresa' ->> 'whatsapp'), '');
  admin_name := nullif(trim(_payload -> 'administrador' ->> 'nome'), '');
  admin_email := nullif(trim(_payload -> 'administrador' ->> 'email'), '');

  if company_name is null
    or company_cnpj is null
    or company_whatsapp is null
    or admin_name is null
    or admin_email is null then
    raise exception 'invalid_payload';
  end if;

  if jsonb_typeof(_payload -> 'setores') is distinct from 'array'
    or jsonb_array_length(_payload -> 'setores') < 1 then
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
    nullif(trim(_payload -> 'empresa' ->> 'cep'), ''),
    nullif(trim(_payload -> 'empresa' ->> 'rua'), ''),
    nullif(trim(_payload -> 'empresa' ->> 'numero'), ''),
    nullif(trim(_payload -> 'empresa' ->> 'complemento'), ''),
    nullif(trim(_payload -> 'empresa' ->> 'bairro'), ''),
    nullif(trim(_payload -> 'empresa' ->> 'cidade'), ''),
    nullif(trim(_payload -> 'empresa' ->> 'estado'), ''),
    admin_name,
    admin_email
  )
  returning id into new_submission_id;

  for setor_item in select jsonb_array_elements(_payload -> 'setores')
  loop
    client_id := nullif(trim(setor_item ->> 'client_id'), '');
    if client_id is null or nullif(trim(setor_item ->> 'nome'), '') is null then
      raise exception 'invalid_payload';
    end if;

    insert into public.setores (submission_id, nome)
    values (new_submission_id, trim(setor_item ->> 'nome'))
    returning id into new_setor_id;

    setor_map := setor_map || jsonb_build_object(client_id, new_setor_id);
  end loop;

  if jsonb_typeof(_payload -> 'usuarios') = 'array' then
    for usuario_item in select jsonb_array_elements(_payload -> 'usuarios')
    loop
      mapped_setor_id := setor_map ->> (usuario_item ->> 'setor_client_id');
      if mapped_setor_id is null
        or nullif(trim(usuario_item ->> 'nome'), '') is null
        or nullif(trim(usuario_item ->> 'email'), '') is null then
        raise exception 'invalid_payload';
      end if;

      insert into public.usuarios (submission_id, setor_id, nome, email)
      values (
        new_submission_id,
        mapped_setor_id::uuid,
        trim(usuario_item ->> 'nome'),
        trim(usuario_item ->> 'email')
      );
    end loop;
  end if;

  update public.onboarding_links
  set status = 'utilizado', used_at = now()
  where id = link_row.id;

  return new_submission_id;
end;
$$;

revoke all on function public.get_onboarding_link_by_token(text) from public;
revoke all on function public.submit_onboarding(text, jsonb) from public;
grant execute on function public.get_onboarding_link_by_token(text) to anon, authenticated;
grant execute on function public.submit_onboarding(text, jsonb) to anon, authenticated;

insert into public.onboarding_links (token, cliente_nome, empresa_nome, status, expires_at)
values
  ('cliente-ativo', 'Cliente Ativo', 'Empresa Ativa', 'ativo', null),
  ('cliente-utilizado', 'Cliente Utilizado', 'Empresa Utilizada', 'utilizado', null),
  ('cliente-expirado', 'Cliente Expirado', 'Empresa Expirada', 'ativo', now() - interval '1 day'),
  ('cliente-revogado', 'Cliente Revogado', 'Empresa Revogada', 'revogado', null),
  ('dev-submit-ok', 'Dev Envio', 'Empresa Envio', 'ativo', null),
  ('dev-submit-fail', 'Dev Falha', 'Empresa Falha', 'ativo', null)
on conflict (token) do nothing;

update public.onboarding_links
set used_at = now()
where token = 'cliente-utilizado' and used_at is null;
