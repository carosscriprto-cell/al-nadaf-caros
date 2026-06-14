-- ============================================================================
-- DRAFT · P5 (lead-capture phase) — DO NOT APPLY IN P2
-- ============================================================================
-- Location note: this file lives in supabase/drafts/ (NOT supabase/migrations/)
-- specifically so `supabase db push` will NOT pick it up. Move it into
-- migrations/ with a real timestamp when P5 is built.
--
-- PROBLEM (flagged in P2 RLS audit):
--   The live policy `leads: insert public` uses WITH CHECK (true), so ANY caller
--   (including unauthenticated anon) can insert a lead with ANY tenant_id. This
--   is a spam + cross-tenant lead-injection vector: a bad actor can pollute any
--   tenant's leads, or insert leads for tenant_ids that don't exist.
--
-- WHY NOT FIX NOW:
--   Public lead capture is intentional (storefront visitors aren't authenticated
--   to a tenant). The complete fix belongs with the actual lead-capture build:
--     (a) DB-side  — constrain tenant_id to an existing ACTIVE tenant (below), and
--     (b) APP-side — rate limiting + (ideally) set tenant_id server-side from the
--         resolved storefront tenant rather than trusting the client payload,
--         plus bot mitigation (captcha/turnstile).
--   (a) alone is necessary but not sufficient — without (b) it still allows spam
--   into valid tenants. Ship both together in P5.
--
-- DB-SIDE DRAFT (part a):
-- ============================================================================

drop policy if exists "leads: insert public" on public.leads;
create policy "leads: insert public"
  on public.leads for insert to public
  with check (
    exists (
      select 1 from public.tenants t
      where t.id = leads.tenant_id
        and t.active
    )
  );

-- Follow-ups for P5 (not expressible as a single policy):
--   * Prefer setting leads.tenant_id server-side (service role / edge function)
--     from the resolved storefront tenant, instead of trusting client input.
--   * Add rate limiting (per IP / per tenant) at the app/edge layer.
--   * Consider a captcha/turnstile gate on the public lead form.
