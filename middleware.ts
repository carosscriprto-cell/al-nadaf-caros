import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTenantId } from '@/lib/tenant/resolveTenant';

// Self-contained 404 body for an unresolved host. Returned directly from
// middleware so the status is a real 404 — every app route sits under a
// loading.tsx boundary, so a notFound() in the render tree would stream a 200
// first (wrong for SEO). Kept minimal/neutral: the tenant is unknown, so there
// is no branding to apply.
const TENANT_NOT_FOUND_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Site not found</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;align-items:center;justify-content:center;
    font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    background:#0b0f1a;color:#e5e7eb}
  .box{text-align:center;max-width:32rem;padding:2rem}
  h1{font-size:3rem;margin:0 0 .5rem}
  p{color:#9ca3af;line-height:1.6}
</style></head>
<body><div class="box">
  <h1>404</h1>
  <p>No site is configured for this address.</p>
</div></body></html>`;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Locale routing ──────────────────────────────────────────
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // ─── Runtime tenant resolution (P4) ──────────────────────────
  // Resolve the tenant from the request host and forward it to the app as a
  // request header. Server components read it via getTenantId() (next/headers).
  const host = request.headers.get('host') ?? '';
  const tenantId = await resolveTenantId(host);

  // Unknown host → hard 404 (no tenant exists for this address).
  if (!tenantId) {
    return new NextResponse(TENANT_NOT_FOUND_HTML, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-host', host);
  requestHeaders.set('x-tenant-id', tenantId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on every request except Next internals and static asset files.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
};
