create type public.app_role as enum ('admin');
create type public.post_status as enum ('draft','published','archived');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.owner_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.owner_exists() to anon, authenticated;

create or replace function public.claim_owner()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(), 'admin');
  end if;
  insert into public.user_roles(user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
grant execute on function public.claim_owner() to authenticated;

create or replace function public.update_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null default '',
  excerpt text,
  mood text,
  language text not null default 'hindi',
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  status post_status not null default 'draft',
  featured boolean not null default false,
  cover_url text,
  media_type text,
  media_url text,
  tags text[] not null default '{}',
  views int not null default 0,
  likes int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger posts_updated before update on public.posts for each row execute function public.update_updated_at();

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  hero_tagline text not null default '',
  intro text not null default '',
  about text not null default '',
  instagram_url text not null default 'https://www.instagram.com/yugen621_/',
  contact_email text,
  hero_image_url text,
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

grant select on public.categories, public.collections, public.posts, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.collections, public.posts, public.site_settings to authenticated;
grant insert on public.messages to anon, authenticated;
grant select, delete on public.messages to authenticated;
grant all on public.categories, public.collections, public.posts, public.site_settings, public.messages to service_role;

alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.messages enable row level security;

create policy "public read categories" on public.categories for select using (true);
create policy "admin write categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read collections" on public.collections for select using (true);
create policy "admin write collections" on public.collections for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read published posts" on public.posts for select using (status = 'published' or public.has_role(auth.uid(),'admin'));
create policy "admin insert posts" on public.posts for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update posts" on public.posts for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete posts" on public.posts for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "public read settings" on public.site_settings for select using (true);
create policy "admin update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "anyone can send message" on public.messages for insert with check (length(name) between 1 and 120 and length(email) between 3 and 200 and length(message) between 1 and 5000);
create policy "admin reads messages" on public.messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes messages" on public.messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.increment_view(_slug text)
returns void language sql security definer set search_path = public as $$
  update public.posts set views = views + 1 where slug = _slug and status = 'published'
$$;
create or replace function public.increment_like(_slug text)
returns int language sql security definer set search_path = public as $$
  update public.posts set likes = likes + 1 where slug = _slug and status = 'published' returning likes
$$;
grant execute on function public.increment_view(text), public.increment_like(text) to anon, authenticated;

insert into public.site_settings (id, hero_tagline, intro, about) values (1,
E'कुछ अल्फ़ाज़ कहे नहीं जाते,\nमहसूस किए जाते हैं।',
'A quiet room of words — shayari, memories and the things left unsaid.',
E'Vandana writes in the hours between midnight and morning.\n\nHer shayari lives where Hindi and Urdu meet — in longing, in silence, in the small weight of remembered things. This is her diary, opened.');

insert into public.categories (name, slug, description) values
('Mohabbat','mohabbat','Love, in all its quiet forms'),
('Judaai','judaai','Distance, and what it leaves behind'),
('Yaadein','yaadein','Memories that refuse to fade'),
('Khamoshi','khamoshi','The language of silence');

insert into public.collections (title, slug, description, sort_order) values
('Raat Ke Panne','raat-ke-panne','Pages written after midnight.',1),
('Chand Aur Main','chand-aur-main','Conversations with the moon.',2);

insert into public.posts (title, slug, body, excerpt, mood, category_id, collection_id, status, featured, published_at) values
('अधूरी बात', 'adhuri-baat', E'तुमसे कहनी थी जो बात,\nवो आज भी अधूरी है,\nलफ़्ज़ों में नहीं समाती,\nशायद ख़ामोशी ही ज़रूरी है।', 'तुमसे कहनी थी जो बात…', 'Longing', (select id from public.categories where slug='khamoshi'), (select id from public.collections where slug='raat-ke-panne'), 'published', true, now() - interval '1 day'),
('चाँद की गवाही', 'chand-ki-gawahi', E'रात भर चाँद गवाह रहा,\nमेरी हर एक आह का,\nसुबह होते ही मुकर गया,\nजैसे तुम मुकर गए थे।', 'रात भर चाँद गवाह रहा…', 'Melancholy', (select id from public.categories where slug='judaai'), (select id from public.collections where slug='chand-aur-main'), 'published', false, now() - interval '3 days'),
('पुरानी चिट्ठी', 'purani-chitthi', E'एक पुरानी चिट्ठी मिली दराज़ में,\nस्याही धुँधली, ख़ुशबू वही,\nतुम्हारा नाम पढ़ते ही,\nसारा कमरा महक उठा।', 'एक पुरानी चिट्ठी मिली दराज़ में…', 'Nostalgia', (select id from public.categories where slug='yaadein'), (select id from public.collections where slug='raat-ke-panne'), 'published', false, now() - interval '6 days'),
('सुकून', 'sukoon', E'तुम्हारे पास बैठना,\nबिना कुछ कहे,\nबस यही तो था,\nजिसे मैं सुकून कहती थी।', 'तुम्हारे पास बैठना, बिना कुछ कहे…', 'Love', (select id from public.categories where slug='mohabbat'), null, 'published', false, now() - interval '9 days');