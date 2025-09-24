'use client';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { signup } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const initialState = { message: '', error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Creando cuenta...' : 'Crear cuenta'}</Button>;
}

export function SignUpForm() {
  const [state, formAction] = useFormState(signup, initialState);
  const supabase = createClient();

  useEffect(() => {
    if (state?.message) {
      if (state.error) toast.error(state.message);
      else toast.success(state.message);
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
          <CardTitle className="text-2xl">Registro</CardTitle>
          <CardDescription>Introduce tus datos para unirte a hotbase.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pb-4">
          <div className="grid gap-2"><Label htmlFor="username">Nombre de usuario</Label><Input id="username" name="username" required /></div>
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="password">Contraseña</Label><Input id="password" name="password" type="password" required minLength={6} /></div>
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
        <p className="text-xs text-center text-gray-400">¿Ya tienes una cuenta?{' '}<Link href="/login" className="underline">Inicia sesión</Link></p>
      </CardFooter>
    </Card>
  );
}