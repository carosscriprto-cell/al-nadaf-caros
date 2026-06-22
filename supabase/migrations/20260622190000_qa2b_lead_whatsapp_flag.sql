-- ============================================================================
-- QA 2b · 4.9 — Lead "opened WhatsApp" follow-up flag
-- ============================================================================
-- New lead flow: the capture form's [Send] saves the lead FIRST (always), then
-- offers WhatsApp as a conscious choice. We record whether the visitor then
-- opened WhatsApp so the dealer can tell "lead only" vs "opened WhatsApp".
--
-- anon has NO update/select policy on leads (PII), and the write-only insert
-- never returns the id — so the flag can't be set by a normal client UPDATE.
-- A SECURITY DEFINER function flips it on the visitor's just-submitted lead,
-- identified by tenant + phone + recency (no id needed). Runs as owner so it
-- bypasses the leads RLS; search_path pinned per the harden convention.
--
-- APPLY: review, then run in the Supabase SQL editor. Idempotent.
-- ============================================================================

alter table public.leads
  add column if not exists whatsapp_opened boolean not null default false;

create or replace function public.mark_latest_lead_whatsapp(p_tenant_id uuid, p_phone text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only an ACTIVE tenant's most-recent matching lead, within a short window.
  update public.leads
     set whatsapp_opened = true
   where id = (
     select l.id
       from public.leads l
       join public.tenants t on t.id = l.tenant_id and t.active = true
      where l.tenant_id = p_tenant_id
        and l.phone is not distinct from p_phone
        and l.created_at > now() - interval '15 minutes'
      order by l.created_at desc
      limit 1
   );
end;
$$;

revoke all on function public.mark_latest_lead_whatsapp(uuid, text) from public;
grant execute on function public.mark_latest_lead_whatsapp(uuid, text) to anon, authenticated;
