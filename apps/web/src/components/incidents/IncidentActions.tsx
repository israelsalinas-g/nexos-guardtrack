'use client';

import { useTransition } from 'react';
import { MoreHorizontal, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { updateIncidentStatus } from '@/lib/actions/incidents';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IncidentActionsProps {
  incidentId: string;
  currentEstado: 'nuevo' | 'revisado';
}

export function IncidentActions({ incidentId, currentEstado }: IncidentActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (nextEstado: 'revisado' | 'cerrado') => {
    startTransition(async () => {
      await updateIncidentStatus(incidentId, nextEstado);
    });
  };

  if (isPending) {
    return <Loader2 size={16} className="animate-spin text-muted-foreground" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
          <MoreHorizontal size={16} />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-border/50 bg-card">
        {currentEstado === 'nuevo' && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => handleUpdate('revisado')}
          >
            <CheckCircle size={14} className="text-amber-400" />
            Marcar como Revisado
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="gap-2 cursor-pointer text-rose-400 focus:text-rose-400"
          onClick={() => handleUpdate('cerrado')}
        >
          <XCircle size={14} />
          Cerrar Incidente
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
