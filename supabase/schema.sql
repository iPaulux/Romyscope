-- Romyscope — à coller dans Supabase > SQL Editor > New query > Run

-- Réglages (une ligne par utilisatrice)
create table if not exists settings (
  user_id uuid primary key references auth.users on delete cascade,
  first_name text, -- renseigné dans l'appli (onglet Moi)
  daily_target int not null default 1750 check (daily_target >= 1400),
  show_numbers boolean not null default false,
  water_goal int not null default 8,
  reminders jsonb not null default '[
    {"id":"breakfast","time":"08:30","kind":"meal","label":"Petit-déj","enabled":true},
    {"id":"courage","time":"10:30","kind":"courage","label":"Petit mot de courage","enabled":true},
    {"id":"lunch","time":"12:30","kind":"meal","label":"Déjeuner","enabled":true},
    {"id":"water","time":"15:00","kind":"water","label":"Hydratation","enabled":true},
    {"id":"snack","time":"16:30","kind":"meal","label":"Goûter","enabled":true},
    {"id":"dinner","time":"19:30","kind":"meal","label":"Dîner","enabled":true},
    {"id":"love","time":"21:30","kind":"love","label":"Mot doux","enabled":true}
  ]'::jsonb,
  program_enabled boolean not null default true, -- programme sport pré-rempli chaque semaine
  seeded_weeks jsonb not null default '[]'::jsonb, -- lundis des semaines déjà pré-remplies
  updated_at timestamptz default now()
);

-- Repas
create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  slot text not null, -- breakfast | lunch | snack | dinner | extra
  name text not null,
  kcal int,
  hunger int,         -- faim avant, 1 à 5
  feeling text,       -- ressenti après (clé d'emoji)
  note text,
  created_at timestamptz default now()
);
create index if not exists meals_user_day on meals (user_id, day);

-- Eau
create table if not exists water (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  glasses int not null default 0,
  primary key (user_id, day)
);

-- Planning (sport à la maison, etc.)
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  time time,
  title text not null,
  emoji text default '✨',
  duration_min int,
  done boolean not null default false,
  program_key text, -- renseigné pour les séances du programme automatique (évite les doublons)
  created_at timestamptz default now()
);
create index if not exists activities_user_day on activities (user_id, day);
create unique index if not exists activities_program_key on activities (user_id, program_key);

-- Historique du chat
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Mots doux (écrits par Paul, lus par sa copine)
create table if not exists love_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users on delete cascade,
  content text not null,
  pushed_at timestamptz,
  created_at timestamptz default now()
);

-- Abonnements aux notifications push
create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- Sécurité : chacun ne voit que ses données
alter table settings enable row level security;
alter table meals enable row level security;
alter table water enable row level security;
alter table activities enable row level security;
alter table chat_messages enable row level security;
alter table love_notes enable row level security;
alter table push_subscriptions enable row level security;

create policy "own settings" on settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own meals" on meals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own water" on water for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own activities" on activities for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own chat" on chat_messages for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own push" on push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Les mots doux sont lisibles par les comptes connectés (les deux comptes), modifiables par leur auteur
create policy "read notes" on love_notes for select to authenticated using (true);
create policy "write notes" on love_notes for insert to authenticated with check (author_id = auth.uid());
create policy "delete notes" on love_notes for delete to authenticated using (author_id = auth.uid());
