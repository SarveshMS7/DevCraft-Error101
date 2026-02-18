-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  github_username text,
  bio text,
  role text check (role in ('developer', 'designer', 'manager', 'other')),
  skills text[], -- Array of skill tags
  availability text,
  timezone text
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  owner_id uuid references profiles(id) not null,
  required_skills text[],
  status text check (status in ('open', 'in_progress', 'completed')) default 'open',
  urgency text check (urgency in ('low', 'medium', 'high')) default 'medium',
  team_size integer default 2
);

-- Set up RLS for projects
alter table projects enable row level security;

create policy "Projects are viewable by everyone." on projects
  for select using (true);

create policy "Authenticated users can create projects." on projects
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own projects." on projects
  for update using (auth.uid() = owner_id);

-- Create a table for join requests
create table join_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  message text,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  unique(project_id, user_id)
);

alter table join_requests enable row level security;

create policy "Join requests are viewable by project owner and requester." on join_requests
  for select using (auth.uid() = user_id or auth.uid() in (
    select owner_id from projects where id = project_id
  ));

create policy "Authenticated users can create join requests." on join_requests
  for insert with check (auth.role() = 'authenticated');

create policy "Project owners can update join requests." on join_requests
  for update using (auth.uid() in (
    select owner_id from projects where id = project_id
  ));

-- Create a table for messages (Chat)
create table messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null
);

alter table messages enable row level security;

create policy "Messages are viewable by project members (owner + accepted requesters)." on messages
  for select using (
    auth.uid() in (select owner_id from projects where id = project_id) or
    auth.uid() in (select user_id from join_requests where project_id = project_id and status = 'accepted')
  );

create policy "Project members can insert messages." on messages
  for insert with check (
    auth.uid() in (select owner_id from projects where id = project_id) or
    auth.uid() in (select user_id from join_requests where project_id = project_id and status = 'accepted')
  );

-- Set up Realtime
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table join_requests;
