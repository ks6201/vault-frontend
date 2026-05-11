'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Acceptance of terms</h2>
            <p className="text-muted-foreground">
              By using Vault, you agree to these terms. If you are using the software on behalf of an organization, you represent that you have the authority to bind that organization to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Description of service</h2>
            <p className="text-muted-foreground">
              Vault is an open-source, self-hosted encrypted storage application. You are responsible for deploying, hosting, and maintaining your instance. The software is provided as-is, without warranties of any kind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. User responsibilities</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your credentials and encryption keys. We cannot recover lost passwords or keys, if you lose them, your encrypted data is permanently inaccessible. This is by design and is not a defect.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Acceptable use</h2>
            <p className="text-muted-foreground">
              You agree not to use the software for any unlawful purpose or in violation of applicable laws. You are solely responsible for the data you store and the manner in which you use the software.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Intellectual property</h2>
            <p className="text-muted-foreground">
              Vault is open-source software. You may use, modify, and distribute it under the terms of its license. The Vault name and logo are trademarks of the project and may not be used to endorse derivative works without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Limitation of liability</h2>
            <p className="text-muted-foreground">
              The software is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. In no event shall the authors be liable for any claim, damages, or other liability arising from the use of the software. You acknowledge that the security of your data depends on your proper management of encryption keys and credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Changes to terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to update these terms at any time. Continued use of the software after changes constitutes acceptance of the new terms. Material changes will be communicated through the application.
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
