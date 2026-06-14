-- ============================================================================
-- Phase 2 · Task 2 — Market-complete enum extension
-- ============================================================================
-- Adds the enum values that real (live + future) dealership inventory needs so
-- the catalog enums are market-complete for a multi-tenant SaaS.
--
-- IMPORTANT (non-transactional requirement):
--   `ALTER TYPE ... ADD VALUE` may not run inside a transaction block that also
--   *uses* the new value. This migration ONLY adds values (it never references
--   them), and every statement is idempotent via `IF NOT EXISTS`, so it is safe
--   to apply on its own. Do NOT wrap these statements in BEGIN/COMMIT, and do
--   NOT insert/compare against the new values in this same migration.
--
-- Not changed (already market-complete): car_class, car_condition, drivetrain.
-- `electric` is intentionally KEPT in car_category (live rows use it); a P3 data
-- migration will remap those rows to a real category + fuel_type='electric'.
-- ============================================================================

-- ── car_category ────────────────────────────────────────────────────────────
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'wagon';
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'crossover';
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'van';
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'minivan';
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'truck';
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'mpv';
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'supercar';
ALTER TYPE "public"."car_category" ADD VALUE IF NOT EXISTS 'roadster';

-- ── transmission ────────────────────────────────────────────────────────────
ALTER TYPE "public"."transmission" ADD VALUE IF NOT EXISTS 'cvt';
ALTER TYPE "public"."transmission" ADD VALUE IF NOT EXISTS 'dual-clutch';
ALTER TYPE "public"."transmission" ADD VALUE IF NOT EXISTS 'semi-automatic';

-- ── fuel_type ───────────────────────────────────────────────────────────────
ALTER TYPE "public"."fuel_type" ADD VALUE IF NOT EXISTS 'plug-in-hybrid';
