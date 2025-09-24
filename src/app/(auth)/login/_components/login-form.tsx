'use client';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { login } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const initialState = { message: '', error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Iniciando sesión...' : 'Iniciar sesión'}</Button>;
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);
  const supabase = createClient();

  useEffect(() => {
    if (state?.message && state.error) {
      toast.error(state.message);
    }
  }, [state]);

  const handleLoginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Introduce tu email para acceder a tu colección.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="password">Contraseña</Label><Input id="password" name="password" type="password" required /></div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
        </CardFooter>
      </form>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>
      <div className="px-6 pb-4">
        <Button variant="outline" className="w-full" onClick={handleLoginWithGoogle}>Continuar con Google</Button>
      </div>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-xs text-center text-gray-400">¿No tienes una cuenta?{' '}<Link href="/signup" className="underline">Regístrate</Link></p>
      </CardFooter>
    </Card>
  );
}