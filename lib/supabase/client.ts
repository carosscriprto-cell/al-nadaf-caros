// ============================================================
// CAROS — Supabase Client + Typed Queries
// lib/supabase/
// ============================================================

// ─── lib/supabase/client.ts ───────────────────────────────────
// للاستخدام في Server Components و API Routes

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';


// Server client (يستخدم service role في server-side فقط)
export function createServerClient() {
  return createSupabaseClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Browser client (يستخدم anon key في client-side)
export function createBrowserClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
