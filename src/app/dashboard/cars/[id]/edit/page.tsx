import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditCarForm } from "./_components/edit-car-form";

export default async function EditCarPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: car, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !car) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Editar Coche</h1>
        <p className="text-gray-400">
          Actualiza los detalles de tu {car.name}.
        </p>
      </div>
      <EditCarForm car={car} />
    </div>
  );
}