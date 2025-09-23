'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres." }),
});

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "No autorizado.", error: true };
  }

  const result = profileSchema.safeParse({ username: formData.get('username') });

  if (!result.success) {
    return { message: result.error.errors[0].message, error: true };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ username: result.data.username, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (profileError) {
    return { message: "Error al actualizar el nombre de usuario. Es posible que ya esté en uso.", error: true };
  }

  const avatarFile = formData.get('avatar') as File;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: storageError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    if (storageError) {
      console.error("Error de Storage:", storageError);
      return { message: "Error al subir el avatar.", error: true };
    }

    // --- LÓGICA DE CACHE BUSTING ---
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 1. Añadimos un timestamp único a la URL para forzar la recarga
    const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;

    // 2. Guardamos la URL única en la base de datos
    const { error: urlUpdateError } = await supabase
      .from('profiles')
      .update({ avatar_url: finalUrl })
      .eq('id', user.id);
      
    if (urlUpdateError){
        return { message: "Error al guardar la URL del avatar.", error: true };
    }
  }

  // 3. Revalidamos ambas páginas para que los cambios se reflejen
  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  return { message: "Perfil actualizado con éxito.", error: false };
}