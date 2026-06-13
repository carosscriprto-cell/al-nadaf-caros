import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ar'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only redirect if the path is exactly '/'
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // If the path starts with a valid locale, do nothing
  if (locales.some(locale => pathname.startsWith(`/${locale}`))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}


// middleware.ts
// ─────────────────────────────────────────────────────────────
// يتعامل مع:
// 1. Locale routing (موجود مسبقاً)
// 2. حماية /dashboard/* بـ Supabase Auth
// 3. حماية /auth/login (redirect لو عنده session)
// ─────────────────────────────────────────────────────────────

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { createServerClient as createSupabaseMiddlewareClient } from '@supabase/ssr';

// const locales = ['en', 'ar'];

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // ─── 1. Locale routing (لم يتغير) ──────────────────────────
//   if (pathname === '/') {
//     return NextResponse.redirect(new URL('/en', request.url));
//   }

//   if (locales.some(locale => pathname.startsWith(`/${locale}`))) {
//     return NextResponse.next();
//   }

//   // ─── 2. Dashboard + Auth routes ────────────────────────────
//   const isDashboard = pathname.startsWith('/dashboard');
//   const isAuthPage  = pathname.startsWith('/auth');

//   if (!isDashboard && !isAuthPage) {
//     return NextResponse.next();
//   }

//   // إنشاء Supabase client للـ middleware
//   let response = NextResponse.next({ request });

//   const supabase = createSupabaseMiddlewareClient(
//     {
//       url:    process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     },
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value)
//           );
//           response = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             response.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   // التحقق من الـ session
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // لو dashboard وما عنده session → login
//   if (isDashboard && !user) {
//     const loginUrl = new URL('/auth/login', request.url);
//     loginUrl.searchParams.set('redirectTo', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // لو auth page وعنده session → dashboard
//   if (isAuthPage && user) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// };