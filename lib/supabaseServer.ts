import { createClient } from "@supabase/supabase-js";

// SERVER - BYPASSES RLS, has full access
// Use this ONLY in server components and /api/* routes
// NEVER import in a "use client" file - it would leak service key
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Alias for backwards compatibility with old imports
export const supabase = supabaseServer;