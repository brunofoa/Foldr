-- 1. Enable RLS (Implicitly handled for custom tables below)
-- auth.users RLS is managed by Supabase system

-- 2. CLIENTS
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  phone text,
  email text,
  birth_date date,
  created_at timestamptz default now()
);
alter table clients enable row level security;

create policy "Users can check their own clients"
  on clients for select
  using (auth.uid() = user_id);

create policy "Users can insert their own clients"
  on clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own clients"
  on clients for update
  using (auth.uid() = user_id);

create policy "Users can delete their own clients"
  on clients for delete
  using (auth.uid() = user_id);


-- 3. PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  client text,
  type text check (type in ('Evento', 'Vídeo', 'Foto', 'Conteúdo Social')),
  delivery_date date,
  status text default 'Planejamento',
  created_at timestamptz default now()
);
alter table projects enable row level security;

create policy "Users can manage their own projects"
  on projects for all
  using (auth.uid() = user_id);


-- 4. PRODUCTION STEPS
create table if not exists production_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  phase text check (phase in ('Pré', 'Produção', 'Pós')),
  due_date date,
  completed boolean default false
);
alter table production_steps enable row level security;

create policy "Users can manage steps of their projects"
  on production_steps for all
  using (
    exists (
      select 1 from projects
      where projects.id = production_steps.project_id
      and projects.user_id = auth.uid()
    )
  );


-- 5. TASKS
create table if not exists project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  category text,
  completed boolean default false
);
alter table project_tasks enable row level security;

create policy "Users can manage tasks of their projects"
  on project_tasks for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_tasks.project_id
      and projects.user_id = auth.uid()
    )
  );


-- 6. ALERTS
create table if not exists project_alerts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  message text not null,
  type text check (type in ('warning', 'info', 'critical'))
);
alter table project_alerts enable row level security;

create policy "Users can manage alerts of their projects"
  on project_alerts for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_alerts.project_id
      and projects.user_id = auth.uid()
    )
  );


-- 7. CALENDAR EVENTS
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  date date not null,
  time text,
  description text,
  project_id uuid references projects(id) on delete set null,
  type text
);
alter table calendar_events enable row level security;

create policy "Users can manage their own events"
  on calendar_events for all
  using (auth.uid() = user_id);
