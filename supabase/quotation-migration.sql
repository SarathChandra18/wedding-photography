-- Run once in Supabase SQL Editor for the live Atelier project.
alter table public.enquiries add column if not exists quote_details jsonb not null default '{}'::jsonb;
alter table public.enquiries add column if not exists status text not null default 'new';

-- Quotations are created by an authenticated studio administrator only.
drop policy if exists "customer create enquiry" on public.enquiries;
drop policy if exists "customer read own enquiries" on public.enquiries;
drop policy if exists "admin update enquiries" on public.enquiries;
drop policy if exists "admin insert quotations" on public.enquiries;
drop policy if exists "admin read quotations" on public.enquiries;
drop policy if exists "admin update quotations" on public.enquiries;
create policy "admin insert quotations" on public.enquiries
  for insert to authenticated with check (public.is_admin());
create policy "admin read quotations" on public.enquiries
  for select to authenticated using (public.is_admin());
create policy "admin update quotations" on public.enquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Prevent customers from changing their own role to admin.
drop policy if exists "profiles update own" on public.profiles;
revoke update on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.packages to anon, authenticated;
grant insert, select, update on table public.enquiries to authenticated;
grant insert, update, delete on table public.packages to authenticated;

-- Admin-only access is enforced by RLS; grants alone do not bypass policies.

-- Refresh PostgREST's schema cache so the quotation field is available immediately.
notify pgrst, 'reload schema';
