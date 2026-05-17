'use client';

import { useEffect, useState, useActionState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { createShift } from '@/lib/actions/shifts';
import { DaySelector } from '@/components/shifts/DaySelector';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type State = { success: boolean; error?: string } | null;

interface Establishment {
  id: string;
  nombre: string;
}

interface CreateShiftDialogProps {
  establishments: Establishment[];
  preselectedEstablishmentId?: string;
}

export function CreateShiftDialog({ establishments, preselectedEstablishmentId }: CreateShiftDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState<State, FormData>(createShift as (state: State, formData: FormData) => Promise<State>, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 active:scale-95 transition-all">
          <Plus size={16} />
          Nuevo Turno
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl border-border/50 bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">Nuevo Turno</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="establecimiento_id">Establecimiento *</Label>
            {preselectedEstablishmentId ? (
              <>
                <p className="text-sm text-muted-foreground px-3 py-2 rounded-xl bg-secondary/30 border border-border/30">
                  {establishments.find((e) => e.id === preselectedEstablishmentId)?.nombre ?? 'Establecimiento'}
                </p>
                <input type="hidden" name="establecimiento_id" value={preselectedEstablishmentId} />
              </>
            ) : (
              <select
                id="establecimiento_id"
                name="establecimiento_id"
                required
                className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecciona un establecimiento</option>
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>{est.nombre}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del turno *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Turno Mañana"
              required
              className="rounded-xl bg-secondary/50 border-border/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora inicio *</Label>
              <Input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                required
                className="rounded-xl bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_fin">Hora fin *</Label>
              <Input
                id="hora_fin"
                name="hora_fin"
                type="time"
                required
                className="rounded-xl bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Días de la semana *</Label>
            <DaySelector />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intervalo_ronda_min">Intervalo de ronda (minutos)</Label>
            <Input
              id="intervalo_ronda_min"
              name="intervalo_ronda_min"
              type="number"
              min={15}
              max={480}
              defaultValue={60}
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
