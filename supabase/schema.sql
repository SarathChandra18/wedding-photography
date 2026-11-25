-- Run this in Supabase SQL Editor after creating a project.
create type public.app_role as enum ('admin','customer');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now()
);
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text,
  price numeric(12,2) not null default 0,
  days integer not null default 1,
  features text[] not null default '{}',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  event_type text,
  event_days integer default 1,
  package_id uuid references public.packages(id) on delete set null,
  estimated_total numeric(12,2),
  notes text,
  quote_details jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_url text not null,
  media_type text not null default 'image',
  category text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.packages enable row level security;
alter table public.enquiries enable row level security;
alter table public.gallery_items enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
create policy "profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
-- Profile role is not user-editable; assign admin roles only through trusted SQL.
revoke update on table public.profiles from authenticated, anon;
create policy "public read active packages" on public.packages for select using (active = true or public.is_admin());
create policy "admin manage packages" on public.packages for all using (public.is_admin()) with check (public.is_admin());
create policy "admin insert quotations" on public.enquiries for insert to authenticated with check (public.is_admin());
create policy "admin read quotations" on public.enquiries for select to authenticated using (public.is_admin());
create policy "admin update quotations" on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read gallery" on public.gallery_items for select using (true);
create policy "admin manage gallery" on public.gallery_items for all using (public.is_admin()) with check (public.is_admin());
create policy "public read site settings" on public.site_settings for select using (true);
create policy "admin manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.packages(name,tag,price,days,features,active,sort_order) values
('The Intimate','For meaningful moments',24999,1,array['1 candid photographer','1 traditional photographer','300 edited photographs','Online gallery'],true,1),
('The Signature','Our most-loved experience',54999,1,array['2 candid photographers','2 traditional photographers','Cinematic highlight film','600+ edited photographs','Premium online gallery'],true,2),
('The Heirloom','For celebrations without limits',99999,2,array['Dedicated photo & film team','Cinematic wedding film','Drone coverage (venue permitting)','1000+ edited photographs','Luxury album consultation'],true,3);

-- Create the first admin user in Supabase Authentication, then run this with that user's UUID:
-- update public.profiles set role = 'admin' where id = 'PASTE_AUTH_USER_UUID_HERE';
-- Never publish service-role keys or put privileged credentials in frontend code.

-- Automatically create a customer profile for every newly registered user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles(id,full_name,role) values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'customer'); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Required table privileges; row-level security above limits admin-only writes.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.packages, public.gallery_items, public.site_settings TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, SELECT, UPDATE ON public.enquiries TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.packages, public.gallery_items, public.site_settings TO authenticated;
