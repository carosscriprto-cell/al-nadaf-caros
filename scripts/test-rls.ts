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

    // ── P4 public-read model (anon role) — runs regardless of tenant-A creds ──
    // A fresh, never-authenticated anon client. The "public read" policies are
    // scoped TO anon, so this exercises exactly the storefront's access.
    {
      console.log('Anon public-read model (P4):');
      const anonPublic = createClient<Database>(URL!, ANON!, clientOptions);

      // anon CAN read active-tenant AVAILABLE public cars (storefront catalog)
      const { data: pubCars } = await anonPublic
        .from('cars').select('id, available').eq('available', true).limit(100);
      assert((pubCars?.length ?? 0) > 0, 'anon reads active-tenant available public cars (>0)');
      assert((pubCars ?? []).every((c) => c.available === true), 'anon public cars are all available=true');

      // anon CANNOT read leads (PII) — seed one for B via service, expect anon sees 0
      await service.from('leads').insert({ tenant_id: tenantBId, name: TAG, phone: '000000' });
      const { data: anonLeads } = await anonPublic.from('leads').select('id');
      assert((anonLeads?.length ?? 0) === 0, 'anon CANNOT read leads (PII protected, no anon policy)');

      // anon CAN INSERT a lead for an ACTIVE tenant (public storefront capture).
      // IMPORTANT: no .select()/RETURNING — anon has no select policy on leads,
      // so reading the row back is denied (42501) and would roll the insert back.
      // We assert the write succeeds, then confirm via the service role it landed.
      const { error: anonLeadErr } = await anonPublic
        .from('leads')
        .insert({ tenant_id: tenantBId, name: TAG, phone: '111111', type: 'inquiry', source: 'rls-test' });
      assert(anonLeadErr === null, 'anon CAN INSERT a lead for an active tenant (P5b public capture, no RETURNING)');
      const { count: landed } = await service
        .from('leads').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantBId).eq('source', 'rls-test');
      assert((landed ?? 0) === 1, 'the anon-inserted lead actually persisted (service-role count)');

      // anon CANNOT INSERT a lead for a NON-EXISTENT tenant (tightened WITH CHECK).
      // No .select() so the only thing that can fail is the WITH CHECK gate itself.
      const { error: anonBadTenantErr } = await anonPublic
        .from('leads')
        .insert({ tenant_id: '00000000-0000-0000-0000-000000000000', name: TAG, phone: '222222' });
      assert(anonBadTenantErr !== null, 'anon CANNOT INSERT a lead for a non-existent/inactive tenant (RLS rejects)');

      // anon STILL cannot read leads after inserting one (write-only for the public)
      const { data: anonLeads2 } = await anonPublic.from('leads').select('id');
      assert((anonLeads2?.length ?? 0) === 0, 'anon CANNOT read leads even ones it just inserted');

      // anon CANNOT write a car (INSERT WITH CHECK = my_tenant_id() is null → rejected)
      const { error: anonInsErr } = await anonPublic.from('cars').insert({
        tenant_id: tenantBId, brand: TAG, model: 'ANON-INJECT', year: 2000,
        slug: `zzz-anon-${Date.now().toString(36)}`, category: 'sedan', class: 'economy',
        condition: 'used', city: 'X', country: 'Y', doors: 4, seats: 5,
        fuel_type: 'petrol', transmission: 'automatic', listing_type: 'sale',
      }).select('id');
      assert(anonInsErr !== null, 'anon CANNOT INSERT a car (write blocked by RLS)');
      console.log('');
    }

    // ── No tenant-A creds: cross-tenant (authenticated) proof needs a login ───
    if (!A_EMAIL || !A_PASSWORD) {
      console.warn('⚠️  TEST_TENANT_A_EMAIL / TEST_TENANT_A_PASSWORD not set — partial run.');
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

    // ── Leads isolation (P5b) ─────────────────────────────────────────────────
    // 6. A's lead list never includes tenant B's leads (seeded above for B)
    const { data: aLeads } = await anon.from('leads').select('id, tenant_id');
    assert((aLeads ?? []).every((l) => l.tenant_id === tenantAId), 'A only sees own-tenant leads');

    // 7. A cannot UPDATE tenant B's lead status (USING blocks → 0 rows affected)
    const { data: updLeadB } = await anon
      .from('leads').update({ status: 'closed' }).eq('tenant_id', tenantBId).select('id');
    assert((updLeadB?.length ?? 0) === 0, 'A cannot UPDATE tenant B leads (0 rows affected)');
  } finally {
    // ── Teardown: ALWAYS remove disposable tenant B + ALL its cars ───────────
    await anon.auth.signOut().catch(() => {});
    if (tenantBId) {
      await service.from('leads').delete().eq('tenant_id', tenantBId);
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
