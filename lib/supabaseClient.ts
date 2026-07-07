import { createClient } from "@supabase/supabase-js";

// Reads from your Vault project's env vars — NOT the NEXUS ones.
// .env.local should have:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);