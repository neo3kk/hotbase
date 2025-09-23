'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteCar(carId: string) {
  const supabase = createClient();

  // Borra el coche de la base de datos que coincida con el ID
  const { error } = await supabase.from('cars').delete().eq('id', carId);

  if (error) {
    console.error("Error al eliminar el coche:", error);
    return;
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}