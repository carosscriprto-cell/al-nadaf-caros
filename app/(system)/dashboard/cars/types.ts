// Plain (non-"use server") module for inventory-action types/constants.
// 'use server' files (actions.ts) may export ONLY async functions, so shared
// types/constants live here.

export type ActionResult = { ok: true } | { ok: false; error: string };
