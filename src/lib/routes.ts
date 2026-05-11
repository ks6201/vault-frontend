export const DEFAULT_LOGIN_REDIRECT = '/projects';

export const publicRoutes = ['/', '/privacy', '/terms'];

export const authRoutes = ['/login', '/register'];

export const protectedRoutes = ['/projects', '/settings'];

export function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
