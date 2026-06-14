// ============================================================
// CAROS — Supabase Client + Typed Queries
// lib/supabase/
// ============================================================

// ─── lib/supabase/client.ts ───────────────────────────────────
// للاستخدام في Server Components و API Routes

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';


// Service-role client — bypasses RLS. RESTRICTED to admin/scripts and trusted
// server mutations. Do NOT use for public storefront reads (use the public
// anon client below so RLS applies).
export function createServerClient() {
  return createSupabaseClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Public read client — anon key, RLS enforced. Used by the storefront server
// query layer (P4). Anon sees only active-tenant public rows per the
// "public read" RLS policies; tenant selection is done with .eq('tenant_id').
export function createPublicServerClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

// Browser client (يستخدم anon key في client-side)
export function createBrowserClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
