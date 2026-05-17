'use client';

import { useTransition } from 'react';
import { MoreHorizontal, UserMinus, Loader2 } from 'lucide-react';
import { deactivateAssignment } from '@/lib/actions/assignments';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AssignmentActions({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDeactivate = () => {
    startTransition(async () => {
      await deactivateAssignment(assignmentId);
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
        <DropdownMenuItem
          className="gap-2 cursor-pointer text-rose-400 focus:text-rose-400"
          onClick={handleDeactivate}
        >
          <UserMinus size={14} />
          Finalizar asignación
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
