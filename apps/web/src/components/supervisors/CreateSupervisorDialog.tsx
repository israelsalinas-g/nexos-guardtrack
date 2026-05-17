'use client';

import { useEffect, useState, useActionState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { createSupervisor } from '@/lib/actions/supervisors';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type State = { success: boolean; error?: string } | null;

export function CreateSupervisorDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState<State, FormData>(createSupervisor, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 active:scale-95 transition-all">
          <Plus size={16} />
          Nuevo Supervisor
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl border-border/50 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">Nuevo Supervisor</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: María García"
              required
              className="rounded-xl bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="maria@empresa.com"
              required
              className="rounded-xl bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña inicial *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              className="rounded-xl bg-secondary/50 border-border/50"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl active:scale-95 transition-all"
            >
              {isPending ? (
                <><Loader2 size={14} className="mr-2 animate-spin" />Guardando...</>
              ) : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
