'use server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { z } from 'zod';

const signupSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres.'),
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export async function signup(_prevState: unknown, formData: FormData) {
  const supabase = createClient();
  const result = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return { message: result.error.errors[0].message, error: true };
  }

  const { username, email, password } = result.data;
  const origin = headers().get('origin');
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { username },
    },
  });

  if (error) {
    return { message: 'No se pudo crear la cuenta. El email o usuario podría ya estar en uso.', error: true };
  }

  return { message: '¡Registro exitoso! Revisa tu email para confirmar tu cuenta.', error: false };
}