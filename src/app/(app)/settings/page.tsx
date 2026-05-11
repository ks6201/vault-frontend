'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVaultStore } from '@/lib/vault-store';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const baseUrl = useVaultStore((s) => s.baseUrl);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Account and connection details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your user account details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground break-all">Email: <span className="text-foreground">{session?.user?.email}</span></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
          <CardDescription>Vault service endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground break-all">URL: <span className="text-foreground font-mono">{baseUrl}</span></p>
        </CardContent>
      </Card>

      <Card className="border-red-900">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={async () => { await signOut({ redirect: false }); router.push('/login'); }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
