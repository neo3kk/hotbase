'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { editCar } from '../actions';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Tables } from '@/types/supabase'; // Crearemos este tipo a continuación

const initialState = { message: '', error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Guardando Cambios...' : 'Guardar Cambios'}</Button>;
}

export function EditCarForm({ car }: { car: Tables<'cars'> }) {
  // Usamos .bind para pasar el ID del coche a la Server Action
  const editCarWithId = editCar.bind(null, car.id);
  const [state, formAction] = useFormState(editCarWithId, initialState);

  useEffect(() => {
    if (state?.message && state.error) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            <div><Label htmlFor="name">Nombre del Coche</Label><Input id="name" name="name" defaultValue={car.name} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="model_year">Año del Modelo</Label><Input id="model_year" name="model_year" type="number" defaultValue={car.model_year ?? ''} /></div>
              <div><Label htmlFor="release_year">Año de Lanzamiento</Label><Input id="release_year" name="release_year" type="number" defaultValue={car.release_year ?? ''} /></div>
            </div>
            <div><Label htmlFor="series">Serie</Label><Input id="series" name="series" defaultValue={car.series ?? ''} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="collection_number">Número de Colección</Label><Input id="collection_number" name="collection_number" defaultValue={car.collection_number ?? ''} /></div>
              <div><Label htmlFor="color">Color</Label><Input id="color" name="color" defaultValue={car.color ?? ''} /></div>
            </div>
          </div>
          {/* Columna Derecha */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Condición</Label>
              <Select name="condition" defaultValue={car.condition ?? 'suelto'}>
                <SelectTrigger><SelectValue placeholder="Selecciona una condición" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-blister">En blíster</SelectItem>
                  <SelectItem value="suelto">Suelto</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="purchase_price">Precio de Compra (€)</Label><Input id="purchase_price" name="purchase_price" type="number" step="0.01" defaultValue={car.purchase_price ?? ''} /></div>
            <div><Label htmlFor="notes">Notas</Label><Textarea id="notes" name="notes" defaultValue={car.notes ?? ''} /></div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6"><SubmitButton /></div>
    </form>
  );
}