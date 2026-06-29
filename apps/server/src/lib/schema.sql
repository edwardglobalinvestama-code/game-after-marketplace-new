create table if not exists orders (
  id integer primary key autoincrement,
  platform text not null,
  order_number text not null,
  quantity integer not null,
  play_quota integer not null,
  used_plays integer not null default 0,
  status text not null default 'active',
  unique(platform, order_number)
);

create table if not exists players (
  id integer primary key autoincrement,
  whatsapp text not null,
  address text not null,
  platform text not null,
  order_number text not null,
  created_at text not null default current_timestamp
);

create table if not exists game_sessions (
  id integer primary key autoincrement,
  player_id integer not null,
  order_id integer not null,
  session_token text not null unique,
  status text not null,
  started_at text,
  finished_at text
);

create table if not exists battle_results (
  id integer primary key autoincrement,
  session_id integer not null unique,
  result text not null,
  hp_remaining integer not null,
  enemy_hp_remaining integer not null,
  duration_seconds integer not null,
  score integer not null
);
