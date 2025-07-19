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