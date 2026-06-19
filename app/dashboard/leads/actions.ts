'use server';

// app/dashboard/leads/actions.ts — dealer-side lead status mutations.
// Run via the AUTHENTICATED server client, so RLS ("leads: update own tenant" →
// my_tenant_id()) enforces that a dealer can only touch its OWN tenant's leads.
// zod validates every input. There is intentionally no delete (no RLS delete
// policy on leads — leads are an audit trail, status-tracked not destroyed).

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { LEAD_STATUSES } from '@/lib/leads/schema';
import type { ActionResult } from '@/app/dashboard/cars/types';

const idSchema = z.string().uuid();
const idsSchema = z.array(z.string().uuid()).min(1).max(500);
const statusSchema = z.enum(LEAD_STATUSES);

function revalidate() {
  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');
}

// ─── Set status (single) ──────────────────────────────────────────────────────
export async function setLeadStatus(input: { id: string; status: string }): Promise<ActionResult> {
  const parsed = z.object({ id: idSchema, status: statusSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('leads')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

// ─── Bulk status change (multi-select) ────────────────────────────────────────
export async function bulkSetLeadStatus(input: { ids: string[]; status: string }): Promise<ActionResult> {
  const parsed = z.object({ ids: idsSchema, status: statusSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('leads')
    .update({ status: parsed.data.status })
    .in('id', parsed.data.ids);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}
