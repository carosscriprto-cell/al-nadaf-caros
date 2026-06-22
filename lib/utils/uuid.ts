// lib/utils/uuid.ts
// Safe UUID v4 generator that works in ALL contexts — HTTPS, localhost, AND
// plain HTTP (e.g. dealer2.lvh.me) and Node.
//
// WHY: `crypto.randomUUID()` only exists in SECURE contexts (HTTPS / localhost).
// On a non-secure HTTP origin the browser still exposes `crypto` but NOT
// `crypto.randomUUID`, so a direct call throws "crypto.randomUUID is not a
// function" and crashes the page. `crypto.getRandomValues`, however, IS available
// on HTTP — so we use it for a proper RFC4122 v4 fallback. Always use this util;
// never call crypto.randomUUID() directly.

export function safeRandomUUID(): string {
  const c: Crypto | undefined =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

  // 1) Native (secure browser contexts + Node 16+).
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }

  // 2) getRandomValues-based RFC4122 v4 — available on plain HTTP too.
  if (c && typeof c.getRandomValues === 'function') {
    const b = new Uint8Array(16);
    c.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0'));
    return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
  }

  // 3) Last-resort (no Web Crypto at all) — still RFC4122-shaped.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const val = ch === 'x' ? r : (r & 0x3) | 0x8;
    return val.toString(16);
  });
}
