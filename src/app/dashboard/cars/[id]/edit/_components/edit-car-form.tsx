'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { editCar } from '../actions';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Tables } from '@/types/supabase';

const initialState = { message: '', error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Guardando Cambios...' : 'Guardar Cambios'}</Button>;
}

export function EditCarForm({ car }: { car: Tables<'cars'> }) {
  const editCarWithId = editCar.bind(null, car.id);
  const [state, formAction] = useFormState(editCarWithId, initialState);
  const [allCollections, setAllCollections] = useState<string[]>([]);

  useEffect(() => {
    fetch('/colecciones.json')
      .then(response => response.json())
      .then(data => setAllCollections(data))
      .catch(error => console.error("Error fetching colecciones.json:", error));
  }, []);

  useEffect(() => {
    if (state?.message) {
      if (state.error) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="name">Nombre del Coche</Label><Input id="name" name="name" defaultValue={car.name} required /></div>
            <div className="grid gap-2">
              <Label htmlFor="series">Nombre de la Colección/Serie</Label>
              <Input id="series" name="series" defaultValue={car.series ?? ''} list="collections-list" />
              <datalist id="collections-list">
                {allCollections.map((collection) => (
                  <option key={collection} value={collection} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label htmlFor="model_year">Año del Modelo</Label><Input id="model_year" name="model_year" type="number" defaultValue={car.model_year ?? ''} /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="collection_number">Número de Serie</Label><Input id="collection_number" name="collection_number" defaultValue={car.collection_number ?? ''} /></div>
            <div className="grid gap-2"><Label htmlFor="release_year">Número de Colección Anual</Label><Input id="release_year" name="release_year" defaultValue={car.release_year ?? ''} /></div>
            <div className="grid gap-2"><Label htmlFor="color">Color</Label><Input id="color" name="color" defaultValue={car.color ?? ''} /></div>
          </div>
          {/* Columna Derecha */}
          <div className="space-y-4">
            <div className="grid gap-2">
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
            <div className="grid gap-2"><Label htmlFor="purchase_price">Precio de Compra (€)</Label><Input id="purchase_price" name="purchase_price" type="number" step="0.01" defaultValue={car.purchase_price ?? ''} /></div>
            <div className="grid gap-2"><Label htmlFor="notes">Notas</Label><Textarea id="notes" name="notes" defaultValue={car.notes ?? ''} /></div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6"><SubmitButton /></div>
    </form>
  );
}