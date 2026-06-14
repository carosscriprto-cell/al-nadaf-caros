// ============================================================================
// Phase 2 · Task 6 — RLS tenant-isolation proof
// ============================================================================
// Proves that tenant A cannot read/write tenant B's rows under RLS.
//
// Run:  npx tsx scripts/test-rls.ts
//
// Env (from .env.local):
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY        (creates/destroys the disposable tenant B)
//   TEST_TENANT_A_EMAIL              (a real tenant-A user login; supply to run full proof)
//   TEST_TENANT_A_PASSWORD
//
// Safety:
//   * Disposable tenant B is named ZZZ_TEST_TENANT_B and is ALWAYS torn down in a
//     finally block (even if assertions throw).
//   * Read-only against real tenant A (only SELECTs; the UPDATE/INSERT probes
//     target tenant B and are expected to be rejected by RLS).
// ============================================================================

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import type { Database } from '../lib/supabase/database.types';

// Node < 22 has no global WebSocket; supabase-js's Realtime client needs one.
// We don't use realtime here, but createClient instantiates it — provide `ws`.
const clientOptions = {
  auth: { persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
} as const;

const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const A_EMAIL = process.env.TEST_TENANT_A_EMAIL;
const A_PASSWORD = process.env.TEST_TENANT_A_PASSWORD;

const TAG = 'ZZZ_TEST_TENANT_B';

if (!URL || !ANON || !SERVICE) {
  console.error('❌ Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string): void {
  if (cond) {
    passed++;
    console.log('  ✅', msg);
  } else {
    failed++;
    console.error('  ❌', msg);
  }
}

async function main(): Promise<void> {
  const service = createClient<Database>(URL!, SERVICE!, clientOptions);
  const anon = createClient<Database>(URL!, ANON!, clientOptions);

  let tenantBId: string | undefined;

  try {
    // ── Setup: disposable tenant B + one car (service role bypasses RLS) ──────
    const suffix = Date.now().toString(36);

    const { data: tenantB, error: tErr } = await service
      .from('tenants')
      .insert({ name: TAG, slug: `zzz-test-tenant-b-${suffix}` })
      .select('id')
      .single();
    if (tErr || !tenantB) throw new Error(`setup: create tenant B failed: ${tErr?.message}`);
    tenantBId = tenantB.id;

    const { data: carB, error: cErr } = await service
      .from('cars')
      .insert({
        tenant_id: tenantBId,
        brand: TAG,
        model: 'RLS-PROBE',
        year: 2000,
        slug: `zzz-test-car-${suffix}`,
        category: 'sedan',
        class: 'economy',
        condition: 'used',
        city: 'Testville',
        country: 'Testland',
        doors: 4,
        seats: 5,
        fuel_type: 'petrol',
        transmission: 'automatic',
        listing_type: 'sale',
      })
      .select('id')
      .single();
    if (cErr || !carB) throw new Error(`setup: create car B failed: ${cErr?.message}`);
    const carBId = carB.id;
    console.log(`Setup: tenant B=${tenantBId}  car B=${carBId}\n`);

    // ── No tenant-A creds: run the partial (anon-unauthenticated) check only ──
    if (!A_EMAIL || !A_PASSWORD) {
      console.warn('⚠️  TEST_TENANT_A_EMAIL / TEST_TENANT_A_PASSWORD not set — partial run.');
      console.warn('   Asserting unauthenticated anon sees nothing (my_tenant_id() is null).\n');

      const { data: anonSelB } = await anon.from('cars').select('id').eq('id', carBId);
      assert((anonSelB?.length ?? 0) === 0, 'unauthenticated anon cannot read tenant B car');

      const { data: anonAny } = await anon.from('cars').select('id').limit(1);
      assert((anonAny?.length ?? 0) === 0, 'unauthenticated anon sees zero cars (RLS, null tenant)');

      console.warn('\n⚠️  INCOMPLETE: supply tenant-A creds to prove cross-tenant isolation.');
      failed++; // never report a green "pass" for an incomplete run
      return;
    }

    // ── Full proof: act as a real tenant-A user via the anon client ──────────
    const { error: signInErr } = await anon.auth.signInWithPassword({ email: A_EMAIL, password: A_PASSWORD });
    if (signInErr) throw new Error(`tenant-A sign-in failed: ${signInErr.message}`);

    // Resolve A's tenant id (read-only; RLS only returns A's own membership row)
    const { data: tuA, error: tuErr } = await anon
      .from('tenant_users')
      .select('tenant_id')
      .limit(1)
      .single();
    if (tuErr || !tuA) throw new Error(`could not resolve tenant-A id: ${tuErr?.message}`);
    const tenantAId = tuA.tenant_id;
    assert(tenantAId !== tenantBId, `tenant A (${tenantAId}) is distinct from disposable tenant B`);

    // 1. A cannot SELECT tenant B's car by id
    const { data: selB } = await anon.from('cars').select('id').eq('id', carBId);
    assert((selB?.length ?? 0) === 0, 'A cannot SELECT tenant B car by id');

    // 2. Tenant B's car is absent from A's full list; A only sees its own tenant
    const { data: allCars } = await anon.from('cars').select('id, tenant_id');
    assert(!(allCars ?? []).some((c) => c.id === carBId), 'tenant B car absent from A car list');
    assert((allCars ?? []).every((c) => c.tenant_id === tenantAId), 'A only sees own-tenant cars');

    // 3. A cannot UPDATE tenant B's car (USING blocks → 0 rows affected)
    const { data: updB } = await anon.from('cars').update({ model: 'HACKED' }).eq('id', carBId).select('id');
    assert((updB?.length ?? 0) === 0, 'A cannot UPDATE tenant B car (0 rows affected)');

    // 4. A cannot INSERT a car into tenant B (WITH CHECK rejects → error)
    const { error: insErr } = await anon
      .from('cars')
      .insert({
        tenant_id: tenantBId!,
        brand: TAG,
        model: 'INJECT',
        year: 2000,
        slug: `zzz-inject-${Date.now().toString(36)}`,
        category: 'sedan',
        class: 'economy',
        condition: 'used',
        city: 'X',
        country: 'Y',
        doors: 4,
        seats: 5,
        fuel_type: 'petrol',
        transmission: 'automatic',
        listing_type: 'sale',
      })
      .select('id');
    assert(insErr !== null, 'A cannot INSERT a car into tenant B (RLS WITH CHECK rejects)');

    // 5. Positive control: A can query its own tenant's cars (read-only)
    const { error: ownErr } = await anon.from('cars').select('id').eq('tenant_id', tenantAId).limit(1);
    assert(ownErr === null, 'A can query its own-tenant cars (positive control)');
  } finally {
    // ── Teardown: ALWAYS remove disposable tenant B + ALL its cars ───────────
    await anon.auth.signOut().catch(() => {});
    if (tenantBId) {
      const { error: carDelErr } = await service.from('cars').delete().eq('tenant_id', tenantBId);
      console.log(carDelErr ? `⚠️  teardown cars failed: ${carDelErr.message}` : `Teardown: removed tenant B cars`);
      const { error: tenDelErr } = await service.from('tenants').delete().eq('id', tenantBId);
      console.log(tenDelErr ? `⚠️  teardown tenant failed: ${tenDelErr.message}` : `Teardown: removed tenant B ${tenantBId}`);
    }
  }
}

main()
  .then(() => {
    console.log(`\nRLS isolation: ${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
  })
  .catch((err: unknown) => {
    console.error('\n💥 test-rls crashed:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
