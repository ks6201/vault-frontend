'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listUserProjects, createProject, deleteProject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Key, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { generateSalt, deriveApiKey } from '@/lib/vault-sdk';
import { motion } from 'motion/react';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: listUserProjects });
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const [newName, setNewName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectResult, setNewProjectResult] = useState<{ apiKey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const salt = generateSalt();
      const apiKey = session?.masterKey
        ? await deriveApiKey(session.masterKey, salt)
        : 'vault_' + Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
      return createProject(name, { salt, apiKey });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewName('');
      setNewProjectResult(data);
    },
  });

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your vault projects and API keys</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/80" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            {newProjectResult ? (
              <div className="space-y-4">
                <p className="text-sm text-primary">Project created!</p>
                <div className="space-y-2">
                  <Label>API Key (copy now, not shown again)</Label>
                  <div className="flex gap-2">
                    <Input value={newProjectResult.apiKey} readOnly className="font-mono text-xs" />
                    <Button size="icon" variant="outline" onClick={() => copyKey(newProjectResult.apiKey)}>
                      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => { setNewProjectResult(null); setDialogOpen(false); }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (newName) createMutation.mutate(newName); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Project name</Label>
                  <Input
                    id="name"
                    placeholder="my-app"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-32 bg-muted" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {projects?.map((p) => (
            <motion.div
              key={p.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } } }}
            >
            <Card
              className="cursor-pointer hover:border-primary transition-colors h-32 relative group"
              onClick={() => router.push(`/projects/${p.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription className="text-xs font-mono flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  {p.salt.slice(0, 12)}...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Created {new Date(p.createdAt).toLocaleDateString()}</p>
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(p.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete this project?"
        description="All environments and secrets will be permanently deleted. This cannot be undone."
        confirmLabel="Delete Project"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
      />
    </div>
  );
}
