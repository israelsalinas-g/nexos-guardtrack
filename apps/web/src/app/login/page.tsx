'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { login } from '@/lib/actions/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield } from 'lucide-react';

type LoginState = { error: string } | null;

export default function LoginPage() {
  const [state, action, isPending] = useActionState<LoginState, FormData>(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Radial background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.208_0.042_265.755)_0%,oklch(0.129_0.042_264.695)_70%)] pointer-events-none" />

      <Card className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-8 space-y-8">
          {/* Logo & header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative w-20 h-10">
              <Image
                src="/assets/logo_nexos_guardtrack.png"
                alt="Nexos GuardTrack"
                fill
                className="object-contain"
                onError={() => {}}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Shield size={20} className="text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">GuardTrack</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Ingresa tus credenciales para continuar
              </p>
            </div>
          </div>

          {/* Error alert */}
          {state?.error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle size={16} />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Login form */}
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                autoComplete="email"
                className="rounded-xl bg-secondary/50 border-border/50 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="rounded-xl bg-secondary/50 border-border/50 focus-visible:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl active:scale-95 transition-all mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Olvidaste tu contraseña?{' '}
            <a href="#" className="text-primary hover:underline transition-colors">
              Recuperar acceso
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
