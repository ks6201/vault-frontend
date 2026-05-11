'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-primary font-semibold text-lg">
          <Shield className="w-5 h-5" />
          Vault
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/" className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" />
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Data we collect</h2>
            <p className="text-muted-foreground">
              Vault is a self-hosted application. We do not collect, store, or process any personal data on our servers. All data resides on the infrastructure you control.
            </p>
            <p className="text-muted-foreground">
              When you create an account, we store your email address and a hashed password. We never see your plaintext password or the encryption keys derived from it. Your encrypted data is opaque to us, we cannot decrypt it under any circumstances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Encryption</h2>
            <p className="text-muted-foreground">
              All sensitive data is encrypted client-side before transmission. We use AES-256-GCM encryption with keys derived from credentials you control. The server acts as an opaque blob store, it receives only encrypted ciphertext and never possesses the keys required to decrypt it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Cookies</h2>
            <p className="text-muted-foreground">
              We use a single session cookie to maintain your authenticated state. This cookie is HttpOnly and cannot be accessed by client-side JavaScript. We do not use tracking cookies, analytics cookies, or third-party cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Logs</h2>
            <p className="text-muted-foreground">
              The server maintains an internal audit log of operations (create, access, delete) for security purposes. These logs include timestamps and resource identifiers but never contain plaintext data or encryption keys. Logs are stored on your infrastructure and are not transmitted externally.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Third parties</h2>
            <p className="text-muted-foreground">
              We do not share data with any third party. There are no analytics providers, advertising networks, or external services integrated into the application. The software is fully self-contained.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Changes</h2>
            <p className="text-muted-foreground">
              If this policy changes, the updated version will be published here with a revised date. Material changes will be communicated through the application.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border px-4 py-8">
        <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-primary mx-auto mb-2" />
          <p>Vault</p>
        </div>
      </footer>
    </div>
  );
}
