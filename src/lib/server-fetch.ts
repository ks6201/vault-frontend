import { getToken } from 'next-auth/jwt';
import { isVaultTokenExpired } from '@/lib/jwt-expiry';

const VAULT_URL = process.env.NEXT_PUBLIC_VAULT_URL || 'http://localhost:3000';

export async function serverFetch(req: Request, path: string, init?: RequestInit): Promise<Response> {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.accessToken || isVaultTokenExpired(token.accessToken as string)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token.accessToken}`);
  headers.set('Content-Type', 'application/json');

  return fetch(`${VAULT_URL}${path}`, {
    ...init,
    headers,
  });
}
