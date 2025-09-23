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

const initialState = { message: '', error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Iniciando sesión...' : 'Iniciar sesión'}</Button>;
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);
  useEffect(() => {
    if (state?.message && state.error) {
      toast.error(state.message);
    }
  }, [state]);

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
          <p className="text-xs text-center text-gray-400">¿No tienes una cuenta?{' '}<Link href="/signup" className="underline">Regístrate</Link></p>
        </CardFooter>
      </form>
    </Card>
  );
}