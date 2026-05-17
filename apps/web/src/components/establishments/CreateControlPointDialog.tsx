'use client';

import { useEffect, useState, useActionState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { createControlPoint } from '@/lib/actions/establishments';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type State = { success: boolean; error?: string } | null;

interface CreateControlPointDialogProps {
  establishmentId: string;
}

export function CreateControlPointDialog({ establishmentId }: CreateControlPointDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState<State, FormData>(
    createControlPoint as (state: State, formData: FormData) => Promise<State>,
    null
  );

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 active:scale-95 transition-all">
          <Plus size={16} />
          Agregar Punto
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl border-border/50 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">Nuevo Punto de Control</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-2">
          <input type="hidden" name="establecimiento_id" value={establishmentId} />

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Entrada Principal"
              required
              className="rounded-xl bg-secondary/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              name="descripcion"
              placeholder="Ej: Puerta de acceso norte"
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
