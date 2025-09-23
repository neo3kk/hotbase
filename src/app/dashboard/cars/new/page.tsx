// src/app/dashboard/cars/new/page.tsx
import { AddCarForm } from "./_components/add-car-form";

export default function AddCarPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Añadir Nuevo Coche</h1>
        <p className="text-gray-400">
          Rellena los detalles de tu nuevo Hot Wheels para añadirlo a la colección.
        </p>
      </div>
      <AddCarForm />
    </div>
  );
}