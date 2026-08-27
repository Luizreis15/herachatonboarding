-- Replace the prototype jsonb schema (invites + submissions.data)
-- with the normalized onboarding model. Prototype had no real submissions.

drop trigger if exists submissions_set_updated_at on public.submissions;
drop function if exists public.submit_onboarding(text, jsonb);
drop function if exists public.get_invite_by_token(text);
drop table if exists public.submissions cascade;
drop table if exists public.invites cascade;

create table public.onboarding_links (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  cliente_nome text,
  empresa_nome text,
  status text not null default 'ativo',
  expires_at timestamptz,
  used_at timestamptz,
  submission_id uuid,
  created_at timestamptz not null default now(),
  constraint onboarding_links_status_check
    check (status in ('ativo', 'utilizado', 'expirado', 'revogado'))
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  onboarding_link_id uuid references public.onboarding_links (id),
  empresa_nome text not null,
  empresa_cnpj text not null,
  empresa_whatsapp text not null,
  empresa_cep text,
  empresa_rua text,
  empresa_numero text,
  empresa_complemento text,
  empresa_bairro text,
  empresa_cidade text,
  empresa_estado text,
  admin_nome text not null,
  admin_email text not null,
  status text not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_status_check
    check (status in ('pendente', 'revisado', 'criado'))
);

alter table public.onboarding_links
  add constraint onboarding_links_submission_id_fkey
  foreign key (submission_id) references public.submissions (id);

create table public.setores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now()
);

create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  setor_id uuid not null references public.setores (id),
  nome text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index onboarding_links_status_idx on public.onboarding_links (status);
create index submissions_onboarding_link_id_idx on public.submissions (onboarding_link_id);
create index submissions_created_at_idx on public.submissions (created_at desc);
create index setores_submission_id_idx on public.setores (submission_id);
create index usuarios_submission_id_idx on public.usuarios (submission_id);
create index usuarios_setor_id_idx on public.usuarios (setor_id);

alter table public.onboarding_links enable row level security;
alter table public.submissions enable row level security;
alter table public.setores enable row level security;
alter table public.usuarios enable row level security;

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
