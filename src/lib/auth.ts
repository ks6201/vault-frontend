import CredentialsProvider from 'next-auth/providers/credentials';
import type { AuthOptions } from 'next-auth';
import { deriveKEK, decryptMasterKey, decodeBlob } from '@/lib/vault-sdk';

const VAULT_URL = process.env.NEXT_PUBLIC_VAULT_URL || 'http://localhost:3000';

interface LoginResponse {
  token: string;
  user: { id: string; email: string };
  encryptedMasterKey?: string | null;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${VAULT_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });

        if (!res.ok) return null;

        const data = (await res.json()) as LoginResponse;

        let masterKey: string | undefined;
        if (data.encryptedMasterKey) {
          try {
            const kek = await deriveKEK(credentials.password, credentials.email);
            const blob = decodeBlob(data.encryptedMasterKey);
            masterKey = await decryptMasterKey(blob, kek);
          } catch {
            // If decryption fails (corrupted blob, legacy user), masterKey stays undefined
          }
        }

        return {
          id: data.user.id,
          email: data.user.email,
          accessToken: data.token,
          masterKey,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.email = user.email;
        token.masterKey = user.masterKey;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
      };
      session.accessToken = token.accessToken;
      session.masterKey = token.masterKey;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
