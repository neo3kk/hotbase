'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(_prevState: unknown, formData: FormData) {
  const supabase = createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'El email y la contraseña son requeridos.', error: true };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: 'Credenciales inválidas. Por favor, inténtalo de nuevo.', error: true };
  }
  redirect('/dashboard');
}