'use server';

// lib/leads/markWhatsapp.ts — flags the visitor's just-submitted lead as
// "opened WhatsApp" (QA 2b · 4.9). Called after the [Send] save when the visitor
// chooses to continue on WhatsApp. anon can't UPDATE leads, so this goes through
// the SECURITY DEFINER mark_latest_lead_whatsapp(tenant, phone) RPC, which flips
// the flag on the most recent matching lead. tenant_id comes from the resolved
// request host header — never trusted from the client. Best-effort (the lead is
// already saved either way).

import { headers } from 'next/headers';
import { createPublicServerClient } from '@/lib/supabase/client';

export async function markLeadWhatsapp(phone: string): Promise<void> {
  const cleaned = phone.trim();
  if (!cleaned) return;

  const h = await headers();
  const tenantId = h.get('x-tenant-id');
  if (!tenantId) return;

  const supabase = createPublicServerClient();
  await supabase.rpc('mark_latest_lead_whatsapp', { p_tenant_id: tenantId, p_phone: cleaned });
}
