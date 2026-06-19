// lib/leads/persistThenWhatsApp.ts — client helper.
//
// Persist the lead/booking FIRST, then fire the WhatsApp deep-link. We open a
// blank tab SYNCHRONOUSLY inside the user gesture so awaiting the server action
// doesn't trip popup blockers, then redirect that tab to wa.me once the row is
// written. If persistence fails we still open WhatsApp — the channel must work
// even when the DB write doesn't.

import { submitLead } from './submit';
import type { LeadSubmitInput } from './schema';

export async function persistThenWhatsApp(
  lead: LeadSubmitInput,
  whatsappUrl: string,
): Promise<void> {
  // NOTE: no 'noopener' here — that flag makes window.open() return null, which
  // would defeat the pre-open. We null out opener manually after redirecting.
  const win = window.open('about:blank', '_blank');

  try {
    await submitLead(lead);
  } catch {
    /* swallow — WhatsApp is the guaranteed channel */
  }

  if (win) {
    win.opener = null;
    win.location.href = whatsappUrl;
  } else {
    // Pre-open was blocked — fall back to a direct (possibly blocked) open.
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }
}
