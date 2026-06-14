# Archived scripts — Phase 3 (Data Unification)

These are one-time scripts from the Phase 3 static→Supabase migration. They are
**archived, not maintained**, and are excluded from typecheck (`tsconfig.json`
excludes `scripts/_archive`).

## migrate-to-supabase.ts
Seeded the static `data/cars.ts` + `data/cars-content/{en,ar}.ts` into the
Supabase `cars` / `car_content` tables under the target tenant.

- Modes: dry-run (default), `--write`, `--write --wipe` (safety-export → delete → seed).
- It imports `../data/cars` and `../data/cars-content/{en,ar}`, which were
  **deleted at the end of Phase 3**. To re-run it you must restore those files
  from git history (the commit that introduced this archive is the last one that
  contained them).

## p3-verify.ts
Read-only Step 0 diff: compared static `data/cars.ts` against the live Supabase
rows (counts, orphan deletes, electric-category rows). Also depends on the
deleted static data. Kept for provenance of the migration decision.

## Safety export
The pre-wipe export of the previous live rows lives in `scripts/_backups/`
(gitignored — it contains live tenant data). That JSON is the recovery path for
the 25 rows the wipe removed.
