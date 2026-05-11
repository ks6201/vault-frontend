'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createEnvironment, deleteEnvironment, getProject, listEnvironments } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'motion/react';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newEnvName, setNewEnvName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: project } = useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId) });
  const { data: environments, isLoading } = useQuery({
    queryKey: ['environments', projectId],
    queryFn: () => listEnvironments(projectId),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createEnvironment(projectId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments', projectId] });
      setNewEnvName('');
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (envId: string) => deleteEnvironment(projectId, envId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['environments', projectId] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project?.name || 'Loading...'}</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold">Environments</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Environment
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Environment</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); if (newEnvName) createMutation.mutate(newEnvName); }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="env-name">Name</Label>
                <Input
                  id="env-name"
                  placeholder="production"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Environment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => <Card key={i} className="animate-pulse h-24 bg-muted" />)}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
        {environments?.map((env: { id: string; name: string; createdAt: string }) => (
          <motion.div
            key={env.id}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <Card
              className="cursor-pointer hover:border-primary transition-colors h-24 relative group"
              onClick={() => router.push(`/projects/${projectId}/environments/${env.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-base">{env.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(env.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(env.id);
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
        title="Delete this environment?"
        description="All secrets in this environment will be permanently deleted. This cannot be undone."
        confirmLabel="Delete Environment"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
      />
    </div>
  );
}
