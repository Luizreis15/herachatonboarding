-- Admin can create and list onboarding invites. Public flow stays RPC-only.

grant select, insert on table public.onboarding_links to authenticated;

drop policy if exists admin_select_onboarding_links on public.onboarding_links;
drop policy if exists admin_insert_onboarding_links on public.onboarding_links;

create policy admin_select_onboarding_links
  on public.onboarding_links
  for select
  to authenticated
  using (public.is_active_admin());

create policy admin_insert_onboarding_links
  on public.onboarding_links
  for insert
  to authenticated
  with check (public.is_active_admin());
