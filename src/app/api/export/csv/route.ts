import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'json2csv';

export async function GET(req: NextRequest) {
  console.log("Iniciando exportación a CSV...");
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error de autenticación en CSV:", userError);
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }
  console.log("Usuario autenticado en CSV:", user.id);

  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('name, yearly_collection_number, collection_or_series_name, condition, notes, series_number, purchase_price, model_year')
    .eq('user_id', user.id);

  if (carsError) {
    console.error("Error al obtener los coches en CSV:", carsError);
    return new NextResponse(JSON.stringify({ error: 'Error al obtener los coches' }), { status: 500 });
  }

  if (!cars || cars.length === 0) {
    console.log("No se encontraron coches para exportar en CSV.");
    return new NextResponse(JSON.stringify({ message: 'No hay coches para exportar' }), { status: 200 });
  }
  console.log(`Se encontraron ${cars.length} coches para exportar a CSV.`);

  const fields = ['name', 'collection_or_series_name', 'yearly_collection_number', 'series_number', 'model_year', 'condition', 'purchase_price', 'notes'];
  const opts = { fields, header: true };

  try {
    const csv = parse(cars, opts);
    console.log("CSV generado correctamente.");

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', 'attachment; filename="hotbase_collection.csv"');

    return new NextResponse(csv, { headers });
  } catch (err) {
    console.error("Error al generar el CSV:", err);
    return new NextResponse(JSON.stringify({ error: 'Error al generar el CSV' }), { status: 500 });
  }
}
