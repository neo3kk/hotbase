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

const initialState = { message: '', error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Creando cuenta...' : 'Crear cuenta'}</Button>;
}

export function SignUpForm() {
  const [state, formAction] = useFormState(signup, initialState);
  useEffect(() => {
    if (state?.message) {
      if (state.error) toast.error(state.message);
      else toast.success(state.message);
    }
  }, [state]);

  return (
    <Card className="w-full max-w-sm">
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="text-2xl">Registro</CardTitle>
          <CardDescription>Introduce tus datos para unirte a hotbase.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2"><Label htmlFor="username">Nombre de usuario</Label><Input id="username" name="username" required /></div>
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="password">Contraseña</Label><Input id="password" name="password" type="password" required minLength={6} /></div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <p className="text-xs text-center text-gray-400">¿Ya tienes una cuenta?{' '}<Link href="/login" className="underline">Inicia sesión</Link></p>
        </CardFooter>
      </form>
    </Card>
  );
}