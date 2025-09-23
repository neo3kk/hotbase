'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

export async function editCar(carId: string, _prevState: unknown, formData: FormData) {
  const supabase = createClient();

  const result = carSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return { message: result.error.errors[0].message, error: true };
  }

  const { error } = await supabase
    .from('cars')
    .update(result.data)
    .eq('id', carId);

  if (error) {
    console.error("Error al actualizar el coche:", error);
    return { message: "No se pudo actualizar el coche.", error: true };
  }

  // Revalidamos tanto la página de detalles como el dashboard
  revalidatePath(`/dashboard/cars/${carId}`);
  revalidatePath('/dashboard');
  redirect(`/dashboard/cars/${carId}`);
}