'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

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
    // Construct the path to be user-id/avatar.ext to comply with RLS policy
    const filePath = `${user.id}/avatar.${fileExt}`;

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

export async function deleteProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not found.');
  }

  const userId = user.id;

  // --- 1. Delete files from storage ---
  try {
    // List and delete files from the 'avatars' bucket
    const { data: avatarFiles, error: avatarListError } = await supabaseAdmin.storage.from('avatars').list(userId);
    if (avatarListError) throw avatarListError;
    if (avatarFiles && avatarFiles.length > 0) {
      const filesToRemove = avatarFiles.map((file) => `${userId}/${file.name}`);
      await supabaseAdmin.storage.from('avatars').remove(filesToRemove);
    }

    // --- Correctly delete files from the 'car-images' bucket ---
    // 1. Get all image URLs from the database for the user
    const { data: carImageRecords, error: dbError } = await supabaseAdmin
      .from('car_images')
      .select('image_url')
      .eq('user_id', userId);

    if (dbError) {
      console.error('Error fetching car image records:', dbError);
      throw new Error('Could not fetch car images for cleanup.');
    }

    if (carImageRecords && carImageRecords.length > 0) {
      // 2. Parse the storage path from each URL
      const bucketUrlPart = `/storage/v1/object/public/car-images/`;
      const filesToRemove = carImageRecords.map(record => {
        const url = new URL(record.image_url);
        return url.pathname.substring(url.pathname.indexOf(bucketUrlPart) + bucketUrlPart.length);
      });

      // 3. Remove the files from storage
      const { error: removeError } = await supabaseAdmin.storage.from('car-images').remove(filesToRemove);
      if (removeError) {
        console.error('Error removing car images from storage:', removeError);
        // Do not throw an error here, allow user deletion to proceed anyway
      }
    }

  } catch (storageError) {
    console.error('Error deleting storage objects:', storageError);
    throw new Error('Could not clean up user files.');
  }

  // --- 2. Delete the user from auth ---
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('Error deleting user:', deleteError);
    throw new Error('Could not delete user.');
  }

  // --- 3. Sign out and redirect ---
  await supabase.auth.signOut();
  redirect('/');
}