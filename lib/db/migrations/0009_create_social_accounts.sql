create table if not exists social_accounts (
  user_id text not null references users(id) on delete cascade,
  provider text not null,
  open_id text,
  username text,
  display_name text,
  avatar_url text,
  refresh_token text,
  scope text,
  snapshot jsonb,
  needs_reconnect boolean not null default false,
  connected_at timestamptz not null default now(),
  primary key (user_id, provider)
);
