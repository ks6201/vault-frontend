'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSecrets, createSecret, getSecret, deleteSecret, getProject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Eye, Copy, Check, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { deriveApiKey, deriveProjectKey, encrypt, decrypt, encodeBlob, decodeBlob } from '@/lib/vault-sdk';

export default function SecretsPage() {
  const { projectId, envId } = useParams<{ projectId: string; envId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const masterKey = session?.masterKey;

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [envIdCopied, setEnvIdCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [revealDialog, setRevealDialog] = useState<{ name: string; value: string } | null>(null);
  const [revealCopied, setRevealCopied] = useState(false);

  const { data: secrets, isLoading } = useQuery({
    queryKey: ['secrets', envId],
    queryFn: () => listSecrets(envId),
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  });

  const getProjectKey = useCallback(async () => {
    if (!masterKey) throw new Error('Session not ready, no master key');
    if (!project) throw new Error('Project not loaded');
    const rawKey = (await deriveApiKey(masterKey, project.salt)).slice(6);
    return deriveProjectKey(rawKey, project.salt);
  }, [masterKey, project]);

  const createMutation = useMutation({
    mutationFn: async ({ name, value }: { name: string; value: string }) => {
      const key = await getProjectKey();
      const blob = await encrypt(value, key);
      return createSecret(envId, name, encodeBlob(blob));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets', envId] });
      setNewName('');
      setNewValue('');
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => deleteSecret(envId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['secrets', envId] }),
  });

  async function reveal(name: string) {
    if (!masterKey) return alert('Session not ready');
    if (!project) return alert('Project not loaded');
    try {
      const secret = await getSecret(envId, name);
      const key = await getProjectKey();
      const blob = decodeBlob(secret.encryptedValue);
      const plaintext = await decrypt(blob, key);
      setRevealDialog({ name, value: plaintext });
      setRevealCopied(false);
    } catch {
      alert('Failed to decrypt. The master key may not match the key used to encrypt this secret.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Secrets</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1 min-w-0">
            <span className="truncate">Environment: {envId}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={async () => {
                await navigator.clipboard.writeText(envId);
                setEnvIdCopied(true);
                setTimeout(() => setEnvIdCopied(false), 2000);
              }}
            >
              {envIdCopied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            </Button>
          </p>
        </div>
      </div>

      {/* Create button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Secret
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Secret</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newName && newValue && masterKey) createMutation.mutate({ name: newName, value: newValue });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="secret-name">Name</Label>
              <Input
                id="secret-name"
                placeholder="DATABASE_URL"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-value">Value</Label>
              <Input
                id="secret-value"
                placeholder="postgres://..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                required
              />
            </div>
            {createMutation.isError && (
              <p className="text-sm text-destructive">{(createMutation.error as Error).message}</p>
            )}
            <Button type="submit" className="w-full" disabled={createMutation.isPending || !masterKey}>
              {createMutation.isPending ? 'Encrypting...' : 'Encrypt & Store'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Secrets table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : secrets && secrets.length > 0 ? (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px] md:w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="pl-0">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => reveal(s.name)}
                        disabled={!masterKey}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(s.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No secrets yet. Add one to get started.</p>
      )}

      {/* Reveal dialog */}
      <Dialog open={revealDialog !== null} onOpenChange={(open) => { if (!open) setRevealDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-mono">{revealDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted border border-border rounded-lg p-3">
              <p className="font-mono text-sm text-primary break-all">{revealDialog?.value}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={async () => {
                if (!revealDialog) return;
                await navigator.clipboard.writeText(revealDialog.value);
                setRevealCopied(true);
                setTimeout(() => setRevealCopied(false), 2000);
              }}
            >
              {revealCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-primary" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Value
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Delete secret "${deleteTarget}"?`}
        description="This cannot be undone. The secret will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
      />
    </div>
  );
}
