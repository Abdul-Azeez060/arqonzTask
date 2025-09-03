# Backend (Express + Supabase)

This small API complements the React dashboard and wires a realtime chat using Supabase.

What this provides:

- Express server (CORS enabled) with `/health` and `/events` (SSE) endpoints.
- `/hooks/message` endpoint you can call from a Supabase database webhook or Edge Function to fan-out new messages to SSE consumers.
- You will primarily use the Supabase client directly from the frontend for auth and realtime (recommended with RLS policies). The server is optional glue for additional integrations and for local tests.

## Supabase Schema

Create a project at supabase.com, then run SQL in the SQL Editor:

```sql
-- users are managed by Supabase Auth
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz default now()
);

-- basic RLS
alter table rooms enable row level security;
alter table messages enable row level security;

create policy "rooms are readable to auth users" on rooms
for select using (auth.role() = 'authenticated');

create policy "messages read" on messages
for select using (auth.role() = 'authenticated');

create policy "send messages" on messages
for insert with check (auth.uid() = user_id);
```

Optionally, add a database webhook to POST to your backend on new message inserts:

- In Supabase: Database > Webhooks > Add Endpoint: `POST https://YOUR-BACKEND/hooks/message`
- Trigger: INSERT on `public.messages`.

## Run locally

1. Copy `.env.example` to `.env` and edit as needed.
2. Install deps and start dev server:

```
npm install
npm run dev
```

The API listens on `http://localhost:4000` by default.

## Notes

- Frontend will connect directly to Supabase for realtime using supabase-js. The SSE `/events` is optional and can be used to test without Supabase.
