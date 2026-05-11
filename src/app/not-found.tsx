'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

const COUNTDOWN_SECONDS = 5;

export default function NotFoundPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [count, setCount] = useState(COUNTDOWN_SECONDS);

  const destination = session ? '/projects' : '/login';

  useEffect(() => {
    if (count <= 0) {
      router.push(destination);
    }
  }, [count, router, destination]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="border-border max-w-md w-full text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-950/50 border border-amber-900 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-6xl font-bold text-foreground tabular-nums">404</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg text-foreground font-medium">This page took a wrong turn at Albuquerque.</p>
            <p className="text-sm text-muted-foreground mt-1">
              It's not you, it's us, mostly the URL. Double-check it, or just admit defeat and click below.
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            Redirecting to {destination} in {count}s
          </p>

          <div className="w-full bg-muted rounded-full h-1">
            <div
              className="bg-amber-600 h-1 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(count / COUNTDOWN_SECONDS) * 100}%` }}
            />
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go Back
            </Button>
            <Button size="sm" onClick={() => router.push(destination)}>
              <Home className="w-4 h-4 mr-1" />
              Take Me Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
