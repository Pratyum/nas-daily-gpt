--  RUN 1st
create extension vector;

-- RUN 2nd
create table nas_daily_videos (
  id bigserial primary key,
  pushlishTime text,
  video_id text,
  content text,
  contentLength bigint,
  contentTokens bigint,
  embedding vector (1536)
);

-- RUN 3rd after running the scripts
create or replace function nas_daily_search(
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  publishTime text,
  content text,
  video_id text,
  contentTokens bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    nas_daily_videos.id,
    nas_daily_videos.title,
    nas_daily_videos.pushlishTime,
    nas_daily_videos.content,
    nas_daily_videos.video_id,
    nas_daily_videos.contentTokens,
    1 - (nas_daily_videos.embedding <=> query_embedding) as similarity
  from nas_daily_videos
  where 1 - (nas_daily_videos.embedding <=> query_embedding) > similarity_threshold
  order by nas_daily_videos.embedding <=> query_embedding
  limit match_count;
  end;
$$;

-- RUN 4th
create index on nas_daily_videos 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);