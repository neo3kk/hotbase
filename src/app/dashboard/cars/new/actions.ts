'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const carSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  model_year: z.coerce.number().optional(),
  release_year: z.coerce.number().optional(),
  series: z.string().optional(),
  collection_number: z.string().optional(),
  color: z.string().optional(),
  condition: z.string(),
  notes: z.string().optional(),
  purchase_price: z.coerce.number().optional(),
});

export async function addCar(_prevState: unknown, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: 'No autorizado.', error: true };
  }

  const result = carSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    return { message: result.error.errors[0].message, error: true };
  }

  const { data: carData, error: carError } = await supabase
    .from('cars')
    .insert({ ...result.data, user_id: user.id })
    .select('id')
    .single();

  if (carError) {
    return { message: 'No se pudo añadir el coche.', error: true };
  }

  const images = formData.getAll('images') as File[];
  for (const image of images) {
    if (image && image.size > 0) {
      const filePath = `${user.id}/${carData.id}/${Date.now()}-${image.name}`;
      const { error: storageError } = await supabase.storage.from('car-images').upload(filePath, image);
      if (storageError) continue;
      
      const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(filePath);
      await supabase.from('car_images').insert({ car_id: carData.id, user_id: user.id, image_url: publicUrl });
    }
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}