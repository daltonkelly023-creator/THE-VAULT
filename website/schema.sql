-- ============================================================
-- ATELIER VAULT — Clean Schema for Buyers
-- Run this in a NEW Supabase project's SQL editor, top to bottom.
-- ============================================================

-- 1. PRODUCTS TABLE
-- Full schema including all columns from the final build.
-- Buyers should replace placeholder data with their own products.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  category text not null check (category in ('necklace','bracelet','earring','ring','watch')),
  collection text not null check (collection in ('altera','terra')),
  price_cents integer not null check (price_cents >= 0),
  description text,

  metal text,               -- e.g. 'yellow-gold', 'platinum', 'black-titanium'
  asset_type text not null default 'photo_only'
    check (asset_type in ('parametric','turntable','model3d','photo_only')),

  -- storage paths (simple root-level names — just upload to bucket root)
  hero_image_path text,          -- e.g. 'celestial-cascade.png' (uploaded to vault-assets root)
  gallery_paths text[] default '{}', -- array of additional image paths for product detail
  turntable_folder_path text,    -- folder prefix inside bucket, e.g. 'turntables/{product_id}/'
  model3d_path text,             -- path to the .glb file, if asset_type = 'model3d'

  -- editorial / detail fields
  stone text,               -- e.g. "VVS1 Diamonds", "Raw Diamond", "Obsidian"
  carat text,               -- e.g. "3.40 ct total", "1.85 ct" — kept as text for flexibility
  story text,               -- the narrative paragraph shown on the Private Viewing Room page
  specifications jsonb not null default '[]'::jsonb, -- array of short strings: ["18k white gold", "Pavé-set diamonds"]

  is_published boolean not null default false
);

-- keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();


-- 2. ROW LEVEL SECURITY
alter table public.products enable row level security;

-- public (anon) can only read published products
create policy "Public can view published products"
  on public.products
  for select
  using (is_published = true);

-- admin full access — REPLACE EMAIL BELOW WITH YOUR OWN ADMIN EMAIL
-- This is the email you will use to log into the admin dashboard.
create policy "Admin full access"
  on public.products
  for all
  using (auth.jwt() ->> 'email' = 'your-admin-email@example.com')
  with check (auth.jwt() ->> 'email' = 'your-admin-email@example.com');


-- 3. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('vault-assets', 'vault-assets', true)
on conflict (id) do nothing;

-- anyone can view files in the bucket (product photos need to be publicly loadable)
create policy "Public can view vault assets"
  on storage.objects
  for select
  using (bucket_id = 'vault-assets');

-- only the admin can upload/replace/delete — REPLACE EMAIL BELOW
create policy "Admin can upload vault assets"
  on storage.objects
  for insert
  with check (bucket_id = 'vault-assets' and auth.jwt() ->> 'email' = 'your-admin-email@example.com');

create policy "Admin can update vault assets"
  on storage.objects
  for update
  using (bucket_id = 'vault-assets' and auth.jwt() ->> 'email' = 'your-admin-email@example.com');

create policy "Admin can delete vault assets"
  on storage.objects
  for delete
  using (bucket_id = 'vault-assets' and auth.jwt() ->> 'email' = 'your-admin-email@example.com');


-- 4. HELPFUL INDEX for the storefront's default listing query
create index if not exists idx_products_published_collection
  on public.products (is_published, collection, category);


-- 5. SAMPLE DATA (PLACEHOLDERS — replace with your own products)
-- These are demo entries so the site looks populated on first deploy.
-- Replace image paths with your own after uploading to the vault-assets bucket ROOT.
-- Just upload to bucket root — no folders needed.

insert into public.products (
  name, category, collection, price_cents, description,
  metal, asset_type, hero_image_path, gallery_paths, is_published,
  stone, carat, story, specifications
) values
(
  'Celestial Cascade',
  'necklace',
  'altera',
  420000,
  'A waterfall of light descending from the collarbone. Each link hand-forged to catch illumination from any angle.',
  'white-gold',
  'photo_only',
  'celestial-cascade.png',    -- upload this to vault-assets bucket ROOT
  '{}',
  true,
  'VVS1 Diamonds',
  '3.40 ct total',
  'Inspired by the Pleiades star cluster, each stone represents a sister of the celestial formation.',
  '["18k white gold chain", "Pavé-set diamonds", "Invisible clasp", "Silk presentation pouch"]'
),
(
  'Aurora Solitaire',
  'ring',
  'altera',
  185000,
  'A masterwork of light and shadow. Hand-forged platinum setting with a tension-set diamond.',
  'platinum',
  'photo_only',
  'aurora-solitaire.png',     -- upload this to vault-assets bucket ROOT
  '{}',
  true,
  'VVS1 Diamond',
  '1.85 ct',
  'Forged under moonlight in the atelier, the Aurora captures the first light of dawn within its facets.',
  '["Tension-set mounting", "Platinum 950", "Leather presentation case included", "Lifetime care plan"]'
),
(
  'Helios Stud',
  'earring',
  'terra',
  95000,
  'A fragment of the sun, cooled and shaped. Worn by those who carry their own light.',
  'yellow-gold',
  'photo_only',
  'helios-stud.png',          -- upload this to vault-assets bucket ROOT
  '{}',
  true,
  null,
  null,
  'Crafted during the summer solstice. Each piece carries the warmth of its forging.',
  '["14k gold", "Hammered texture", "Surgical steel post", "Travel pouch"]'
),
(
  'Chronos Keeper',
  'watch',
  'altera',
  320000,
  'Timekeeping stripped to its essence. No numerals, no indices — only the sweep of hands against void-black ceramic.',
  'black-ceramic',
  'photo_only',
  'chronos-void.png',         -- upload this to vault-assets bucket ROOT
  '{}',
  true,
  'Sapphire Crystal',
  null,
  'The dial absorbs 99.4% of visible light. Reading time becomes an act of intention.',
  '["Grade 5 titanium case", "Swiss automatic movement", "Sapphire exhibition caseback", "Alligator strap", "50m water resistance"]'
),
(
  'Helix Chain',
  'bracelet',
  'altera',
  89000,
  'A bracelet that defies closure. The Helix appears to wrap infinitely, each link rotating freely around the next.',
  'rose-gold',
  'photo_only',
  'helix-chain.png',          -- upload this to vault-assets bucket ROOT
  '{}',
  true,
  null,
  null,
  'Inspired by the double-helix structure of DNA. Each link is individually articulated.',
  '["18k rose gold", "Articulated links", "Claspless design", "Custom sizing", "Velvet roll case"]'
),
(
  'Abyss Cuff',
  'bracelet',
  'terra',
  145000,
  'A single band of forged darkness. Wraps the wrist in matte black titanium with a single exposed diamond at the pulse point.',
  'black-titanium',
  'photo_only',
  'abyss-cuff.png',           -- upload this to vault-assets bucket ROOT
  '{}',
  true,
  'Raw Diamond',
  '0.85 ct',
  'Mined from the deepest kimberlite pipe. The raw stone is left uncut by request.',
  '["Grade 5 titanium", "Raw uncut diamond", "Magnetic closure", "Carbon fiber case"]'
);
