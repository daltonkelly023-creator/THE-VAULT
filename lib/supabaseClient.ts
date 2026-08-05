import { createClient } from "@supabase/supabase-js";

// CLIENT - safe for browser, respects RLS
// Use this in any file with "use client"
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);