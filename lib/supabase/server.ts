// lib/supabase/server.ts
// ─────────────────────────────────────────────────────────────────────────────
// Auth-aware Supabase client for Server Components / Server Actions / Route
// Handlers. Uses @supabase/ssr with the request cookies, so queries run as the
// LOGGED-IN USER (authenticated role) — RLS my_tenant_id() applies, which keeps
// dashboard reads/writes tenant-isolated (test-rls 11/11 stays valid).
//
// This is distinct from:
//   * createPublicServerClient (client.ts) — anon storefront reads.
//   * createServerClient        (client.ts) — service-role, admin/scripts only.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In a pure Server Component cookie writes throw — that's fine, the
          // middleware refreshes the session cookie on every request. Server
          // Actions / Route Handlers CAN write, so we still attempt it.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* no-op: Server Component render context */
          }
        },
      },
    },
  );
}
