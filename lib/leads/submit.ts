'use server';

// lib/leads/submit.ts — PUBLIC lead/booking capture (storefront).
//
// Every storefront inquiry/booking persists a row here FIRST; the WhatsApp
// deep-link is then fired client-side as the delivery channel. DB = the record,
// WhatsApp = the channel — both happen, neither replaces the other.
//
// Runs as ANON (createPublicServerClient): the "leads: insert public" RLS policy
// permits the insert but only for an ACTIVE tenant. tenant_id is resolved
// server-side from the request host header (x-tenant-id) — never trusted from
// the client — so a visitor cannot file a lead against another dealer.
//
// NOTE: the insert deliberately has NO .select()/RETURNING. anon has no select
// policy on leads (PII protection), so `insert(...).select()` would issue
// INSERT … RETURNING, the read-back would be denied (42501), and the row would
// roll back. We write-only here and never return the id to the public client.

import { headers } from 'next/headers';
import { createPublicServerClient } from '@/lib/supabase/client';
import { leadSubmitSchema, type LeadSubmitInput } from './schema';

export type SubmitLeadResult = { ok: true } | { ok: false; error: string };

export async function submitLead(input: LeadSubmitInput): Promise<SubmitLeadResult> {
  const parsed = leadSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  // Tenant comes from the resolved request host (middleware → x-tenant-id).
  const h = await headers();
  const tenantId = h.get('x-tenant-id');
  if (!tenantId) return { ok: false, error: 'Tenant not resolved' };

  const d = parsed.data;
  const supabase = createPublicServerClient();

  // Write-only: no .select()/RETURNING (anon cannot read leads back).
  const { error } = await supabase.from('leads').insert({
    tenant_id: tenantId,
    type: d.type,
    source: d.source ?? null,
    name: d.name || null,
    email: d.email || null,
    phone: d.phone || null,
    message: d.message || null,
    car_id: d.car_id ?? null,
    locale: d.locale ?? null,
    rental_start: d.rental_start ?? null,
    rental_end: d.rental_end ?? null,
    pickup_location: d.pickup_location || null,
    status: 'new',
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
