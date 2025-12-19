create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  created_at timestamp with time zone default timezone('Asia/Tokyo', now())
);
