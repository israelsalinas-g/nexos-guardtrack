'use client';

import { useEffect, useState, useActionState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { createAssignment } from '@/lib/actions/assignments';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type State = { success: boolean; error?: string } | null;

interface Guard {
  id: string;
  nombre: string | null;
  email: string | null;
}

interface Shift {
  id: string;
  nombre: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  establecimientos: { nombre: string } | null;
}

interface CreateAssignmentDialogProps {
  guards: Guard[];
  shifts: Shift[];
}

export function CreateAssignmentDialog({ guards, shifts }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState<State, FormData>(createAssignment, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 active:scale-95 transition-all">
          <Plus size={16} />
          Nueva Asignación
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl border-border/50 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">Nueva Asignación</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="guardia_id">Guardia *</Label>
            <select
              id="guardia_id"
              name="guardia_id"
              required
              className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona un guardia</option>
              {guards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre ?? g.email ?? g.id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="turno_id">Turno *</Label>
            <select
              id="turno_id"
              name="turno_id"
              required
              className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona un turno</option>
              {shifts.map((s) => {
                const estName = (s.establecimientos as { nombre: string } | null)?.nombre;
                const horario = `${s.hora_inicio?.slice(0, 5) ?? ''} – ${s.hora_fin?.slice(0, 5) ?? ''}`;
                return (
                  <option key={s.id} value={s.id}>
                    {estName ? `${estName} · ` : ''}{s.nombre ?? ''} ({horario})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha inicio *</Label>
              <Input
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                required
                className="rounded-xl bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha fin</Label>
              <Input
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                className="rounded-xl bg-secondary/50 border-border/50"
              />
            </div>
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
