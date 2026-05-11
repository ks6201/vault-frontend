import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DEFAULT_LOGIN_REDIRECT, authRoutes, isRouteMatch, protectedRoutes } from '@/lib/routes';
import { isVaultTokenExpired } from '@/lib/jwt-expiry';

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token?.accessToken && !isVaultTokenExpired(token.accessToken as string);

  // Disable registration when ALLOW_REGISTRATION=false
  if (pathname === '/register' && process.env.ALLOW_REGISTRATION === 'false' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  const isAuthRoute = isRouteMatch(pathname, authRoutes);
  const isProtectedRoute = isRouteMatch(pathname, protectedRoutes);

  // Authenticated users on auth pages → redirect to /projects
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // Unauthenticated users on protected pages → redirect to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
