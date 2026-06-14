// ============================================================================
// Phase 3 · Step 0 — Data Unification VERIFY (READ-ONLY)
// ============================================================================
// Verifies the core assumption before ANY wipe/seed:
//   "static data/cars.ts is newer; live Supabase rows are stale."
//
// Does NOT write, insert, update, or delete. SELECT only.
//
// Run:  npx tsx scripts/p3-verify.ts
//
// Env (from .env.local):
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY        (read past RLS to see ALL tenant rows)
//   NEXT_PUBLIC_TENANT_ID            (the target tenant whose rows would be wiped)
// ============================================================================

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import type { Database } from '../lib/supabase/database.types';
import { cars as staticCars } from '../data/cars';

const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`❌ Missing env: ${name} (set it in .env.local)`);
    process.exit(1);
  }
  return value;
}

const url = requireEnv('SUPABASE_URL', URL);
const service = requireEnv('SUPABASE_SERVICE_ROLE_KEY', SERVICE);
const tenantId = requireEnv('NEXT_PUBLIC_TENANT_ID', TENANT);

const supabase = createClient<Database>(url, service, {
  auth: { persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});

// ── Identity key for matching across sources ────────────────────────────────
const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
const idKey = (c: { brand: string; model: string; year: number }) =>
  `${norm(c.brand)}|${norm(c.model)}|${c.year}`;

type Row = { id: string; slug: string; brand: string; model: string; year: number; category: string; fuel_type: string; available: boolean };

async function main() {
  console.log('\n=== Phase 3 · Step 0 — READ-ONLY VERIFY ===\n');
  console.log(`Tenant (NEXT_PUBLIC_TENANT_ID): ${tenantId}\n`);

  // ── Live rows (ALL for tenant, service role bypasses RLS + available filter) ─
  const { data: live, error } = await supabase
    .from('cars')
    .select('id, slug, brand, model, year, category, fuel_type, available')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('❌ Failed to read live cars:', error.message);
    process.exit(1);
  }
  const liveRows = (live ?? []) as Row[];

  // ── Counts ────────────────────────────────────────────────────────────────
  console.log('── COUNTS ──────────────────────────────────────────────');
  console.log(`  static data/cars.ts : ${staticCars.length}`);
  console.log(`  live Supabase cars  : ${liveRows.length}`);
  console.log('');

  // ── Live category distribution (electric flag) ──────────────────────────────
  const liveCatDist = liveRows.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log('── LIVE category distribution ──────────────────────────');
  Object.entries(liveCatDist)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k.padEnd(14)} : ${v}`));
  const electricRows = liveRows.filter((r) => r.category === 'electric');
  console.log(`\n  category='electric' rows (P3 remap target): ${electricRows.length}`);
  electricRows.forEach((r) =>
    console.log(`    - ${r.slug}  (${r.brand} ${r.model} ${r.year}, fuel=${r.fuel_type})`),
  );
  console.log('');

  // ── Match maps ──────────────────────────────────────────────────────────────
  const staticBySlug = new Map(staticCars.map((c) => [norm(c.slug), c]));
  const staticByKey = new Map(staticCars.map((c) => [idKey(c), c]));
  const liveBySlug = new Map(liveRows.map((r) => [norm(r.slug), r]));
  const liveByKey = new Map(liveRows.map((r) => [idKey(r), r]));

  // ── Live rows that WOULD BE DELETED with NO static equivalent ───────────────
  const orphanDeletes = liveRows.filter(
    (r) => !staticBySlug.has(norm(r.slug)) && !staticByKey.has(idKey(r)),
  );
  console.log('── ⚠️  LIVE rows that WIPE deletes with NO static equivalent ──');
  console.log(`   (matched by slug OR brand/model/year)`);
  if (orphanDeletes.length === 0) {
    console.log('   ✅ none — every live row has a static counterpart\n');
  } else {
    console.log(`   ❌ ${orphanDeletes.length} live rows would be LOST:\n`);
    orphanDeletes.forEach((r) =>
      console.log(`    - ${r.slug.padEnd(34)} ${r.brand} ${r.model} ${r.year}  [${r.category}/${r.fuel_type}]`),
    );
    console.log('');
  }

  // ── Static rows that would be INSERTED (new, not in live) ───────────────────
  const newInserts = staticCars.filter(
    (c) => !liveBySlug.has(norm(c.slug)) && !liveByKey.has(idKey(c)),
  );
  console.log('── Static rows the SEED would INSERT as NEW (not in live) ──');
  if (newInserts.length === 0) {
    console.log('   none — every static car already exists live\n');
  } else {
    console.log(`   ${newInserts.length} new rows:\n`);
    newInserts.forEach((c) =>
      console.log(`    + ${c.slug.padEnd(34)} ${c.brand} ${c.model} ${c.year}  [${c.category}/${c.fuelType}]`),
    );
    console.log('');
  }

  // ── Matched (updated in place) ──────────────────────────────────────────────
  const matchedBySlug = staticCars.filter((c) => liveBySlug.has(norm(c.slug)));
  console.log('── Matched by slug (seed UPDATES in place) ─────────────');
  console.log(`   ${matchedBySlug.length} rows\n`);

  // ── Net effect summary ──────────────────────────────────────────────────────
  console.log('── NET EFFECT IF WIPE+SEED RUNS ────────────────────────');
  console.log(`   live now            : ${liveRows.length}`);
  console.log(`   would be deleted    : ${liveRows.length}  (full wipe under tenant)`);
  console.log(`   would be inserted   : ${staticCars.length}  (from static)`);
  console.log(`   final count         : ${staticCars.length}`);
  console.log(`   ⚠️  orphan losses     : ${orphanDeletes.length}  (live rows with no static match)`);
  console.log('\n=== END REPORT — NO CHANGES WERE MADE ===\n');
}

main().catch((err) => {
  console.error('\n❌ Verify failed:', err);
  process.exit(1);
});
