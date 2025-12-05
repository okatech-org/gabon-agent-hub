-- Sessions de conversation
create table if not exists public.conversation_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  session_name text,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  settings jsonb, -- ex: { "mode": "voice" }
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Messages
create table if not exists public.conversation_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.conversation_sessions on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  audio_base64 text,
  metadata jsonb, -- ex: { "responseStyle": "concis", "latency": 120 }
  created_at timestamp with time zone default now()
);

-- (Optionnel) Table pour le RAG (Connaissance Projet)
create table if not exists public.project_knowledge (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(1536), -- Nécessite l'extension pgvector
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.conversation_sessions enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.project_knowledge enable row level security;

-- RLS Policies (simplified for development, adjust for production)
create policy "Users can view their own sessions" on public.conversation_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own sessions" on public.conversation_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can view messages from their sessions" on public.conversation_messages
  for select using (
    exists (
      select 1 from public.conversation_sessions
      where id = conversation_messages.session_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert messages to their sessions" on public.conversation_messages
  for insert with check (
    exists (
      select 1 from public.conversation_sessions
      where id = conversation_messages.session_id
      and user_id = auth.uid()
    )
  );

-- Function for vector search (if pgvector is enabled)
create or replace function match_project_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    project_knowledge.id,
    project_knowledge.content,
    project_knowledge.metadata,
    1 - (project_knowledge.embedding <=> query_embedding) as similarity
  from project_knowledge
  where 1 - (project_knowledge.embedding <=> query_embedding) > match_threshold
  order by project_knowledge.embedding <=> query_embedding
  limit match_count;
end;
$$;
