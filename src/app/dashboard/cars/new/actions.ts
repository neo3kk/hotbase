'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const carSchema = z.object({
  name: z.string().min(1, { message: 'El nombre del coche es requerido.' }),
  model_year: z.coerce.number().optional(), // Changed from year
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

  console.log('User ID:', user.id); // Log user ID
  console.log('Parsed car data:', result.data); // Log parsed data

  const { data: carInsertData, error: carError } = await supabase
    .from('cars')
    .insert({ ...result.data, user_id: user.id })
    .select('id'); // Removed .single()

  console.log('Supabase insert carInsertData:', carInsertData); // Log raw data
  console.log('Supabase insert carError:', carError); // Log raw error

  if (carError) {
    console.error('Error al añadir el coche:', carError);
    return { message: 'No se pudo añadir el coche.', error: true };
  }

  if (!carInsertData || carInsertData.length === 0 || !carInsertData[0].id) {
    console.error('Error: Car ID not returned after insert, but no error reported.');
    return { message: 'No se pudo añadir el coche (ID no devuelto). ', error: true };
  }

  const newCarId = carInsertData[0].id; // Get the ID from the first (and only) returned row

  const images = formData.getAll('images') as File[];
  for (const image of images) {
    if (image && image.size > 0) {
      const filePath = `${user.id}/${newCarId}/${Date.now()}-${image.name}`;
      const { error: storageError } = await supabase.storage.from('car-images').upload(filePath, image);
      if (storageError) {
        console.error('Error uploading image:', storageError); // Log storage errors too
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(filePath);
      const { error: imageInsertError } = await supabase.from('car_images').insert({ car_id: newCarId, user_id: user.id, image_url: publicUrl }); // Use newCarId
      if (imageInsertError) {
        console.error('Error inserting image URL:', imageInsertError); // Log image insert errors
      }
    }
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}