-- KNC Horizon Realtor — Supabase PostgreSQL schema.
--
-- Migrated from MongoDB. Every table keeps the 24-character hexadecimal id the MongoDB
-- ObjectIds had, so existing links, JWT subjects and admin references keep resolving; new
-- rows get the same shape from gen_random_bytes(12). Running this file is idempotent: it
-- only ever creates what is missing, and never drops or truncates anything.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Generates a 24-char hex id in the ObjectId shape the application already uses.
create or replace function knc_new_id() returns text
  language sql volatile as $$ select encode(gen_random_bytes(12), 'hex') $$;

-- ---------------------------------------------------------------------------
-- developers
-- ---------------------------------------------------------------------------
create table if not exists developers (
  id                text primary key default knc_new_id(),
  slug              text not null unique,
  name              text not null,
  short_description text,
  description       text not null default '',
  logo              text,
  cover_image       text,
  image_url         text,
  image_path        text,
  official_website  text,
  website           text,
  featured          boolean not null default false,
  published         boolean not null default true,
  sort_order        integer not null default 0,
  areas             text[] not null default '{}',
  established       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists developers_published_sort_idx on developers (published, sort_order, name);
create index if not exists developers_name_lower_idx on developers (lower(name));

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
create table if not exists properties (
  id            text primary key default knc_new_id(),
  slug          text not null unique,
  title         text not null,
  location      text not null default '',
  city          text,
  state         text,
  community     text not null default '',
  type          text not null default '',
  property_type text,
  listing_type  text,
  status        text not null default '',
  price         double precision not null default 0,
  currency      text not null default 'AED',
  bedrooms      integer not null default 0,
  bathrooms     integer not null default 0,
  size          double precision not null default 0,
  area          double precision,
  description   text not null default '',
  images        text[] not null default '{}',
  image_url     text,
  image_path    text,
  amenities     text[] not null default '{}',
  highlights    text[] not null default '{}',
  featured      boolean not null default false,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Property search: the public bar filters on listing type, location/community, category and
-- type, budget and bedrooms, then orders by featured and recency. These cover every one of
-- those paths, including the partial indexes for the published-only public queries.
create index if not exists properties_published_idx           on properties (published);
create index if not exists properties_public_order_idx        on properties (published, featured desc, created_at desc);
create index if not exists properties_listing_type_idx        on properties (listing_type) where published;
create index if not exists properties_community_lower_idx     on properties (lower(community)) where published;
create index if not exists properties_location_lower_idx      on properties (lower(location)) where published;
create index if not exists properties_type_lower_idx          on properties (lower(type)) where published;
create index if not exists properties_price_idx               on properties (price) where published;
create index if not exists properties_bedrooms_idx            on properties (bedrooms) where published;
create index if not exists properties_status_lower_idx        on properties (lower(status));
-- Free-text "q" search runs as ILIKE across these three columns.
create index if not exists properties_title_trgm_idx     on properties using gin (title gin_trgm_ops);
create index if not exists properties_location_trgm_idx  on properties using gin (location gin_trgm_ops);
create index if not exists properties_community_trgm_idx on properties using gin (community gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- projects (off-plan)
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id              text primary key default knc_new_id(),
  slug            text not null unique,
  title           text not null,
  description     text not null default '',
  developer       text not null default '',
  -- Resolved link to the developers table. The `developer` text above stays authoritative
  -- for display and for records whose developer has no profile yet.
  developer_slug  text references developers (slug) on update cascade on delete set null,
  location        text not null default '',
  category        text,
  status          text,
  starting_price  double precision not null default 0,
  handover        text not null default '',
  image           text not null default '',
  image_url       text,
  image_path      text,
  cover_image     text,
  gallery         text[] not null default '{}',
  amenities       text[] not null default '{}',
  highlights      text[] not null default '{}',
  completion_date text,
  new_launch      boolean not null default false,
  off_plan        boolean not null default false,
  featured        boolean not null default false,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists projects_published_idx        on projects (published);
create index if not exists projects_public_order_idx     on projects (published, featured desc, created_at desc);
create index if not exists projects_developer_slug_idx   on projects (developer_slug);
create index if not exists projects_developer_lower_idx  on projects (lower(developer));
create index if not exists projects_location_lower_idx   on projects (lower(location)) where published;
create index if not exists projects_category_lower_idx   on projects (lower(category)) where published;
create index if not exists projects_title_trgm_idx       on projects using gin (title gin_trgm_ops);
create index if not exists projects_location_trgm_idx    on projects using gin (location gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- posts (blog / journal)
-- ---------------------------------------------------------------------------
create table if not exists posts (
  id              text primary key default knc_new_id(),
  slug            text not null unique,
  title           text not null,
  excerpt         text not null default '',
  content         text not null default '',
  category        text not null default 'General',
  cover_image     text,
  image           text not null default '',
  image_url       text,
  image_path      text,
  featured_image  text,
  author          text not null default 'KNC Horizon',
  published       boolean not null default false,
  status          text,
  published_at    timestamptz not null default now(),
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_public_idx        on posts (published, published_at desc);
create index if not exists posts_status_idx        on posts (status);
create index if not exists posts_category_idx      on posts (category);
create index if not exists posts_admin_order_idx   on posts (updated_at desc, created_at desc);
create index if not exists posts_title_trgm_idx    on posts using gin (title gin_trgm_ops);
create index if not exists posts_excerpt_trgm_idx  on posts using gin (excerpt gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- communities
-- ---------------------------------------------------------------------------
create table if not exists communities (
  id                text primary key default knc_new_id(),
  slug              text not null unique,
  name              text not null,
  short_description text,
  description       text not null default '',
  location          text,
  image             text,
  image_url         text,
  image_path        text,
  highlights        text[] not null default '{}',
  property_types    text[] not null default '{}',
  featured          boolean not null default false,
  published         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists communities_published_sort_idx on communities (published, sort_order, name);

-- ---------------------------------------------------------------------------
-- insights (market insights)
-- ---------------------------------------------------------------------------
create table if not exists insights (
  id          text primary key default knc_new_id(),
  slug        text not null unique,
  title       text not null,
  category    text not null default 'General',
  summary     text not null default '',
  content     text not null default '',
  source      text,
  source_url  text,
  date        text,
  image       text,
  image_url   text,
  published   boolean not null default false,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists insights_published_sort_idx on insights (published, sort_order, created_at desc);
create index if not exists insights_admin_order_idx    on insights (updated_at desc, created_at desc);

-- ---------------------------------------------------------------------------
-- gallery
-- ---------------------------------------------------------------------------
create table if not exists gallery (
  id         text primary key default knc_new_id(),
  title      text not null,
  category   text not null default 'General',
  image      text not null,
  image_url  text,
  image_path text,
  alt        text not null default '',
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists gallery_public_idx on gallery (published, created_at desc);

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table if not exists testimonials (
  id          text primary key default knc_new_id(),
  name        text not null,
  designation text,
  image       text,
  review      text not null default '',
  rating      integer not null default 5,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create index if not exists testimonials_public_idx on testimonials (published, created_at desc);

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists users (
  id            text primary key default knc_new_id(),
  name          text,
  email         text not null unique,
  password_hash text not null,
  role          text not null default 'user' check (role in ('admin', 'agent', 'user')),
  created_at    timestamptz not null default now()
);

create index if not exists users_email_idx on users (lower(email));

-- ---------------------------------------------------------------------------
-- inquiries (leads)
-- ---------------------------------------------------------------------------
create table if not exists inquiries (
  id                   text primary key default knc_new_id(),
  name                 text not null,
  email                text not null,
  phone                text,
  interest             text not null default '',
  inquiry_type         text not null default 'contact',
  message              text,
  budget               text,
  property_type        text,
  location             text,
  property_slug        text,
  project_slug         text,
  -- Resolved links. Slugs above stay as written by the enquiry form, so a lead never loses
  -- what the client actually asked about if the listing is later removed.
  property_id          text references properties (id) on delete set null,
  project_id           text references projects (id) on delete set null,
  preferred_visit_date text,
  status               text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at           timestamptz not null default now()
);

create index if not exists inquiries_created_idx  on inquiries (created_at desc);
create index if not exists inquiries_status_idx   on inquiries (status);
create index if not exists inquiries_property_idx on inquiries (property_id);
create index if not exists inquiries_project_idx  on inquiries (project_id);

-- ---------------------------------------------------------------------------
-- newsletter
-- ---------------------------------------------------------------------------
create table if not exists newsletter (
  id            text primary key default knc_new_id(),
  email         text not null unique,
  subscribed_at timestamptz,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media (Cloudinary uploads shown in the admin media library)
-- ---------------------------------------------------------------------------
create table if not exists media (
  id         text primary key default knc_new_id(),
  url        text not null,
  public_id  text,
  filename   text,
  mimetype   text,
  size       bigint,
  folder     text,
  created_at timestamptz not null default now()
);

create index if not exists media_created_idx on media (created_at desc);

-- ---------------------------------------------------------------------------
-- settings (generic admin key/value; kept because the admin resource map exposes it)
-- ---------------------------------------------------------------------------
create table if not exists settings (
  id         text primary key default knc_new_id(),
  key        text unique,
  value      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SEO manager accounts
-- ---------------------------------------------------------------------------
-- Account status and the article publishing permission. Every existing account stays
-- active; publishing is off unless a super admin turns it on for an SEO manager.
alter table users add column if not exists is_active boolean not null default true;
alter table users add column if not exists can_publish_articles boolean not null default false;
alter table users add column if not exists updated_at timestamptz;

-- The role list gains seo_manager. The original inline check has a generated name, so find
-- whichever check constraint covers `role` and swap it only while it predates seo_manager.
do $$
declare
  existing text;
begin
  for existing in
    select conname from pg_constraint
     where conrelid = 'users'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%role%'
       and pg_get_constraintdef(oid) not ilike '%seo_manager%'
  loop
    execute format('alter table users drop constraint %I', existing);
  end loop;
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'users'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%seo_manager%'
  ) then
    alter table users add constraint users_role_check
      check (role in ('admin', 'agent', 'user', 'seo_manager'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- seo_meta: SEO fields for a static page, a property, a project or a blog post
-- ---------------------------------------------------------------------------
-- Exactly one target per row. Properties, projects and posts are real foreign keys, so the
-- SEO record follows its listing and disappears with it. A post's SEO title and description
-- stay in posts.seo_title / posts.seo_description, which the blog admin already edits.
create table if not exists seo_meta (
  id               text primary key default knc_new_id(),
  page_key         text unique,
  property_id      text unique references properties (id) on delete cascade,
  project_id       text unique references projects (id) on delete cascade,
  post_id          text unique references posts (id) on delete cascade,
  seo_title        text,
  meta_description text,
  focus_keyword    text,
  related_keywords text[] not null default '{}',
  canonical_url    text,
  og_title         text,
  og_description   text,
  og_image         text,
  image_alt        text,
  noindex          boolean not null default false,
  -- Articles only: hand-picked links to other pages of the site, as [{ "href", "label" }].
  internal_links   jsonb not null default '[]'::jsonb,
  -- Slugs this record used to have, so a renamed listing's old URL still resolves.
  previous_slugs   text[] not null default '{}',
  updated_by       text references users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint seo_meta_one_target check (num_nonnulls(page_key, property_id, project_id, post_id) = 1)
);

create index if not exists seo_meta_previous_slugs_idx on seo_meta using gin (previous_slugs);

-- Site-wide SEO defaults: one row, id 'seo'.
create table if not exists seo_settings (
  id                   text primary key default 'seo' check (id = 'seo'),
  site_url             text,
  default_og_image     text,
  default_og_image_alt text,
  updated_by           text references users (id) on delete set null,
  updated_at           timestamptz not null default now()
);
