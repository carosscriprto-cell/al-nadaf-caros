import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { resolveTenantId } from '@/lib/tenant/resolveTenant';

// Self-contained 404 body for an unresolved host. Returned directly from
// middleware so the status is a real 404 — every app route sits under a
// loading.tsx boundary, so a notFound() in the render tree would stream a 200
// first (wrong for SEO). Kept minimal/neutral: the tenant is unknown.
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

  const isAuth = pathname.startsWith('/auth');
  const isDashboard = pathname.startsWith('/dashboard');

  // ─── Auth-gated app routes (P5a) ─────────────────────────────
  // /dashboard and /auth are tenant-scoped by the logged-in USER (tenant_users),
  // not by the storefront host — so skip host resolution / 404 here and run the
  // Supabase session check instead (also refreshes the session cookie).
  if (isAuth || isDashboard) {
    // Fail CLOSED, never throw — a thrown error here is MIDDLEWARE_INVOCATION_FAILED
    // (a hard 500). When we can't validate a session (missing env or the auth call
    // rejects), treat the user as unauthenticated: /dashboard → login, /auth → allow.
    const failClosed = () => {
      if (isDashboard) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next({ request });
    };

    // Same URL fallback the storefront resolver uses (SUPABASE_URL == the public
    // project URL per env spec). Guard BEFORE constructing the client — the
    // non-null assertions were compile-time only; a blank value throws inside
    // createServerClient.
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return failClosed();

    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // getUser() validates the token with Supabase (secure; not just decode). A
    // rejected fetch here would also 500 — catch it and fail closed instead.
    const result = await supabase.auth.getUser().catch(() => null);
    if (!result) return failClosed();
    const user = result.data.user;

    if (isDashboard && !user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAuth && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // ─── Storefront: runtime tenant resolution (P4) ──────────────
  const host = request.headers.get('host') ?? '';

  // ─── Single-tenant lock (opt-in — FORCE_SINGLE_TENANT="true") ─
  // When enabled, EVERY storefront host serves the one DEFAULT_TENANT_SLUG
  // tenant; subdomain/domain extraction is bypassed entirely, so no host can
  // ever surface a different dealer (no fallback, no leak). Purely additive:
  // when the flag is unset/false this block is skipped and the multi-tenant
  // path below is byte-identical to before.
  const forceSingle = (process.env.FORCE_SINGLE_TENANT ?? '').trim() === 'true';

  let tenantId: string | null;
  if (forceSingle) {
    // Require an explicit slug in this mode — fail LOUD (500), never silently
    // serve a hard-coded default. Sanitize exactly like resolveTenant does.
    const rawSlug = process.env.DEFAULT_TENANT_SLUG ?? '';
    const slug = rawSlug.trim().replace(/^["']+|["']+$/g, '').trim();
    if (!slug) {
      return new NextResponse(
        'Server misconfigured: FORCE_SINGLE_TENANT is on but DEFAULT_TENANT_SLUG is not set.',
        { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      );
    }
    // Resolve straight to DEFAULT_TENANT_SLUG by handing resolveTenantId a host
    // with NO subdomain and NOT a custom domain: 'localhost' short-circuits both
    // the subdomain lookup and the domain lookup and lands on the resolver's
    // DEFAULT_TENANT_SLUG branch — reusing its existing resolution + env
    // sanitization, with no new resolveTenantId error semantics.
    tenantId = await resolveTenantId('localhost');
    // Slug is set but did not resolve → a deployment error, not a bad host.
    if (!tenantId) {
      return new NextResponse(
        `Server misconfigured: FORCE_SINGLE_TENANT tenant "${slug}" did not resolve.`,
        { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      );
    }
  } else {
    // Multi-tenant path — UNCHANGED. Host → tenant; unknown host → real 404.
    tenantId = await resolveTenantId(host);
    if (!tenantId) {
      return new NextResponse(TENANT_NOT_FOUND_HTML, {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
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
