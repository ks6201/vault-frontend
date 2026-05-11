'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Menu, Settings, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function SidebarContent({ session, pathname }: { session: ReturnType<typeof useSession>['data']; pathname: string | null }) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        <Link href="/projects" className="flex items-center gap-2 text-primary font-semibold text-lg">
          <Shield className="w-5 h-5" />
          Vault
        </Link>
        <ThemeToggle />
      </div>
      <Separator className="bg-border" />
      <nav className="flex-1 p-3 space-y-1">
        <Link href="/projects">
          <Button
            variant={pathname?.startsWith('/projects') ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
          >
            Projects
          </Button>
        </Link>
        <Link href="/settings">
          <Button
            variant={pathname === '/settings' ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </Link>
      </nav>
      <Separator className="bg-border" />
      <div className="p-3">
        <p className="text-xs text-muted-foreground truncate px-2 mb-2">{session?.user?.email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={async () => { await signOut({ redirect: false }); router.push('/login'); }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-border bg-sidebar shrink-0 flex-col">
        <SidebarContent session={session} pathname={pathname} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              className="absolute inset-0 bg-background/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute top-3 right-3">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SidebarContent session={session} pathname={pathname} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {/* Hamburger, mobile only */}
        <div className="md:hidden mb-4">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}
