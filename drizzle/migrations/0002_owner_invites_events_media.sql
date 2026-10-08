create extension if not exists pgcrypto;

create table public.owner_invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid,
  created_at timestamptz not null default now()
);
grant all on public.owner_invites to service_role;
alter table public.owner_invites enable row level security;
-- no policies: invisible to anon/authenticated; only security definer functions touch it

create or replace function public.check_owner_invite(_token text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select not exists (select 1 from public.user_roles where role = 'admin')
     and exists (select 1 from public.owner_invites
                 where token_hash = encode(extensions.digest(_token, 'sha256'), 'hex')
                   and used_at is null and expires_at > now())
$$;
grant execute on function public.check_owner_invite(text) to anon, authenticated;

drop function if exists public.claim_owner();
create or replace function public.claim_owner(_token text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare inv public.owner_invites; uemail text;
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(), 'admin');
  end if;
  select * into inv from public.owner_invites
   where token_hash = encode(extensions.digest(_token, 'sha256'), 'hex')
     and used_at is null and expires_at > now()
   for update;
  if not found then return false; end if;
  select email into uemail from auth.users where id = auth.uid() and email_confirmed_at is not null;
  if uemail is null then return false; end if;
  if inv.email is not null and lower(inv.email) <> lower(uemail) then return false; end if;
  insert into public.user_roles(user_id, role) values (auth.uid(), 'admin');
  update public.owner_invites set used_at = now(), used_by = auth.uid() where id = inv.id;
  update public.owner_invites set expires_at = now() where used_at is null;
  return true;
end $$;
revoke execute on function public.claim_owner(text) from anon;
grant execute on function public.claim_owner(text) to authenticated;

-- posts: optional title, description, multi-media, content type
alter table public.posts alter column title set default '';
alter table public.posts add column if not exists description text;
alter table public.posts add column if not exists content_type text not null default 'text';
alter table public.posts add column if not exists media jsonb not null default '[]'::jsonb;

drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts" on public.posts for select
  using ((status = 'published' and published_at is not null and published_at <= now()) or public.has_role(auth.uid(),'admin'));

-- engagement events (deduplicated)
create table public.post_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  kind text not null check (kind in ('view','like')),
  visitor_id uuid not null,
  day date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now()
);
create unique index post_events_view_once_per_day on public.post_events(post_id, visitor_id, day) where kind = 'view';
create unique index post_events_like_once on public.post_events(post_id, visitor_id) where kind = 'like';
create index post_events_created on public.post_events(created_at);
grant select on public.post_events to authenticated;
grant all on public.post_events to service_role;
alter table public.post_events enable row level security;
create policy "admin reads events" on public.post_events for select to authenticated using (public.has_role(auth.uid(),'admin'));

drop function if exists public.increment_view(text);
drop function if exists public.increment_like(text);

create or replace function public.record_view(_slug text, _visitor uuid)
returns void language plpgsql security definer set search_path = public as $$
declare pid uuid; n int;
begin
  select id into pid from public.posts where slug = _slug and status = 'published' and published_at <= now();
  if pid is null then return; end if;
  insert into public.post_events(post_id, kind, visitor_id) values (pid, 'view', _visitor) on conflict do nothing;
  get diagnostics n = row_count;
  if n > 0 then update public.posts set views = views + 1 where id = pid; end if;
end $$;

create or replace function public.record_like(_slug text, _visitor uuid)
returns int language plpgsql security definer set search_path = public as $$
declare pid uuid; n int; total int;
begin
  select id into pid from public.posts where slug = _slug and status = 'published' and published_at <= now();
  if pid is null then return null; end if;
  if (select count(*) from public.post_events where visitor_id = _visitor and kind = 'like' and created_at > now() - interval '1 minute') >= 10 then
    select likes into total from public.posts where id = pid; return total;
  end if;
  insert into public.post_events(post_id, kind, visitor_id) values (pid, 'like', _visitor) on conflict do nothing;
  get diagnostics n = row_count;
  if n > 0 then update public.posts set likes = likes + 1 where id = pid returning likes into total;
  else select likes into total from public.posts where id = pid; end if;
  return total;
end $$;
grant execute on function public.record_view(text, uuid), public.record_like(text, uuid) to anon, authenticated;

-- contact rate limit
create or replace function public.limit_messages()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.messages where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.messages where created_at > now() - interval '1 minute') >= 10 then
    raise exception 'Too many letters — please try again later.';
  end if;
  return new;
end $$;
create trigger messages_rate_limit before insert on public.messages for each row execute function public.limit_messages();