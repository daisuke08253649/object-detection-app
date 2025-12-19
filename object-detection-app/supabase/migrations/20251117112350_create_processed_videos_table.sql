create table if not exists processed_videos (
  id uuid primary key default gen_random_uuid(),
  original_video_id uuid unique references videos(id) on delete cascade,
  processed_url text not null,
  created_at timestamp with time zone default timezone('Asia/Tokyo', now())
);
