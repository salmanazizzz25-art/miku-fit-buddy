
-- Enums
create type public.app_role as enum ('admin', 'user');
create type public.user_goal as enum ('cut', 'bulk', 'maintain');
create type public.activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
create type public.user_gender as enum ('male', 'female', 'other');
create type public.meal_type as enum ('breakfast', 'lunch', 'snack', 'dinner');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  age int,
  weight_kg numeric,
  height_cm numeric,
  gender public.user_gender,
  goal public.user_goal,
  activity_level public.activity_level,
  premium boolean not null default false,
  onboarding_complete boolean not null default false,
  xp int not null default 0,
  level int not null default 1,
  streak int not null default 0,
  last_active date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- User roles (separate table for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles_select_own" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "user_roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(),'admin'));

-- Admin can read/update all profiles
create policy "profiles_admin_select" on public.profiles for select using (public.has_role(auth.uid(),'admin'));
create policy "profiles_admin_update" on public.profiles for update using (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_touch before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- Meal logs
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  meal_type public.meal_type not null,
  name text not null,
  kcal int not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fats numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.meal_logs enable row level security;
create policy "meal_logs_own_all" on public.meal_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meal_logs_admin_select" on public.meal_logs for select using (public.has_role(auth.uid(),'admin'));
create index meal_logs_user_date_idx on public.meal_logs (user_id, log_date desc);

-- Workout logs
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  name text not null,
  duration_min int not null default 0,
  exercises_count int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.workout_logs enable row level security;
create policy "workout_logs_own_all" on public.workout_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_logs_admin_select" on public.workout_logs for select using (public.has_role(auth.uid(),'admin'));
create index workout_logs_user_date_idx on public.workout_logs (user_id, log_date desc);

-- Daily stats (water, steps)
create table public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  water_glasses int not null default 0,
  steps int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);
alter table public.daily_stats enable row level security;
create policy "daily_stats_own_all" on public.daily_stats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger daily_stats_touch before update on public.daily_stats for each row execute procedure public.touch_updated_at();

-- Foods (admin-managed catalog)
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kcal int not null,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fats numeric not null default 0,
  serving text,
  created_at timestamptz not null default now()
);
alter table public.foods enable row level security;
create policy "foods_select_all_authed" on public.foods for select to authenticated using (true);
create policy "foods_admin_write" on public.foods for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Workout plans (admin-managed catalog)
create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.workout_plans enable row level security;
create policy "workout_plans_select_all_authed" on public.workout_plans for select to authenticated using (true);
create policy "workout_plans_admin_write" on public.workout_plans for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Broadcasts from admin -> shown as Miku notifications
create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.broadcasts enable row level security;
create policy "broadcasts_select_authed" on public.broadcasts for select to authenticated using (true);
create policy "broadcasts_admin_write" on public.broadcasts for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Chat messages with Miku
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "chat_messages_own_all" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index chat_messages_user_created_idx on public.chat_messages (user_id, created_at);
