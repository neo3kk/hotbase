'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteCarButton } from "./_components/delete-car-button";
import { BackButton } from "./_components/back-button";

// Definiendo los tipos para el coche y las imágenes
type CarImage = { id: string; image_url: string; };
type Car = { 
  id: string; 
  name: string; 
  collection_or_series_name: string | null;
  model_year: string | null;
  series_number: string | null;
  yearly_collection_number: string | null;
  color: string | null;
  condition: string | null;
  purchase_price: number | null;
  notes: string | null;
  car_images: CarImage[];
};

export default function CarDetailsPage({ params: { id } }: { params: { id: string } }) {
  const [car, setCar] = useState<Car | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchCar = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select(`*, car_images (id, image_url)`)
        .eq('id', id)
        .single();

      if (error || !data) {
        notFound();
      } else {
        setCar(data as Car);
      }
    };

    fetchCar();
  }, [id]);

  if (!car) {
    return <div className="container mx-auto max-w-4xl py-8"><p>Cargando...</p></div>; // O un componente de esqueleto
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Galería de Imágenes */}
          <div>
            {car.car_images && car.car_images.length > 0 ? (
              <div className="space-y-4">
                <div 
                  className="aspect-video w-full relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(car.car_images[0].image_url)}
                >
                  <Image 
                    src={car.car_images[0].image_url} 
                    alt={`Imagen principal de ${car.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {car.car_images.slice(1).map((image: CarImage) => (
                    <div 
                      key={image.id} 
                      className="aspect-video w-full relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(image.image_url)}
                    >
                      <Image 
                        src={image.image_url} 
                        alt={`Imagen secundaria de ${car.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
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
              <p className="text-lg text-gray-400">{car.collection_or_series_name || 'Sin serie'}</p>
            </div>

            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href={`/dashboard/cars/${car.id}/edit`}>Editar</Link>
              </Button>
              <DeleteCarButton carId={car.id} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1"><p className="text-gray-500">Año</p><p>{car.model_year || 'N/A'}</p></div>
              <div className="space-y-1"><p className="text-gray-500">Numero en miniserie</p><p>{car.series_number || 'N/A'}</p></div>
              <div className="space-y-1"><p className="text-gray-500">Nº serie colección anual</p><p>{car.yearly_collection_number || 'N/A'}</p></div>
              <div className="space-y-1"><p className="text-gray-500">Color</p><p>{car.color || 'N/A'}</p></div>
              <div className="space-y-1"><p className="text-gray-500">Condición</p><p className="capitalize">{car.condition || 'N/A'}</p></div>
              <div className="space-y-1"><p className="text-gray-500">Precio Compra</p><p>{car.purchase_price ? `${car.purchase_price}€` : 'N/A'}</p></div>
            </div>
            {car.notes && (
              <div className="space-y-1"><p className="text-gray-500">Notas</p><p className="whitespace-pre-wrap">{car.notes}</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full max-w-5xl max-h-screen p-4">
            <Image
              src={selectedImage}
              alt="Imagen ampliada"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
      <div className="flex justify-center py-8">
        <BackButton />
      </div>
    </>
  );
}