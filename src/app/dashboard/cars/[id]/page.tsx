import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteCarButton } from "./_components/delete-car-button";

type CarImage = { id: string; image_url: string; };

export default async function CarDetailsPage({ params: { id } }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: car, error } = await supabase
    .from('cars')
    .select(`*, car_images (id, image_url)`)
    .eq('id', id)
    .single();

  if (error || !car) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de Imágenes */}
        <div>
          {car.car_images && car.car_images.length > 0 ? (
            <div className="space-y-4">
              <div className="aspect-video w-full relative overflow-hidden rounded-lg">
                <Image 
                  src={car.car_images[0].image_url} 
                  alt={`Imagen principal de ${car.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {car.car_images.slice(1).map((image: CarImage) => (
                  <div key={image.id} className="aspect-video w-full relative overflow-hidden rounded-lg">
                    <Image 
                      src={image.image_url} 
                      alt={`Imagen secundaria de ${car.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full flex items-center justify-center bg-gray-800 rounded-lg">
              <span className="text-gray-500">Sin imágenes</span>
            </div>
          )}
        </div>

        {/* Detalles del Coche */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{car.name}</h1>
            <p className="text-lg text-gray-400">{car.series || 'Sin serie'}</p>
          </div>

          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href={`/dashboard/cars/${car.id}/edit`}>Editar</Link>
            </Button>
            <DeleteCarButton carId={car.id} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1"><p className="text-gray-500">Año Modelo</p><p>{car.model_year || 'N/A'}</p></div>
            <div className="space-y-1"><p className="text-gray-500">Año Lanzamiento</p><p>{car.release_year || 'N/A'}</p></div>
            <div className="space-y-1"><p className="text-gray-500">Color</p><p>{car.color || 'N/A'}</p></div>
            <div className="space-y-1"><p className="text-gray-500">Nº Colección</p><p>{car.collection_number || 'N/A'}</p></div>
            <div className="space-y-1"><p className="text-gray-500">Condición</p><p className="capitalize">{car.condition || 'N/A'}</p></div>
            <div className="space-y-1"><p className="text-gray-500">Precio Compra</p><p>{car.purchase_price ? `${car.purchase_price}€` : 'N/A'}</p></div>
          </div>
          {car.notes && (
            <div className="space-y-1"><p className="text-gray-500">Notas</p><p className="whitespace-pre-wrap">{car.notes}</p></div>
          )}
        </div>
      </div>
    </div>
  );
}