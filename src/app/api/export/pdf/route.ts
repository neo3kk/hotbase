import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(req: NextRequest) {
  console.log("Iniciando exportación a PDF...");
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error de autenticación:", userError);
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }
  console.log("Usuario autenticado:", user.id);

  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('name, yearly_collection_number, collection_or_series_name, condition, notes, series_number, purchase_price, model_year')
    .eq('user_id', user.id);

  if (carsError) {
    console.error("Error al obtener los coches:", carsError);
    return new NextResponse(JSON.stringify({ error: 'Error al obtener los coches' }), { status: 500 });
  }

  if (!cars || cars.length === 0) {
    console.log("No se encontraron coches para exportar.");
    return new NextResponse(JSON.stringify({ message: 'No hay coches para exportar' }), { status: 200 });
  }
  console.log(`Se encontraron ${cars.length} coches para exportar.`);

  try {
    const doc = new jsPDF();
    const tableData = cars.map(car => [
      car.name || '',
      car.collection_or_series_name || '',
      car.yearly_collection_number,
      car.series_number || '',
      car.model_year || '',
      car.condition || '',
      car.purchase_price || '',
      car.notes || ''
    ]);

    autoTable(doc, {
      head: [['Nombre', 'Nombre de la colección', 'Serie anual', 'Serie coleccion', 'Año', 'Condición', 'Precio de compra (€)', 'Notas']],
      body: tableData,
    });

    const pdfOutput = doc.output('arraybuffer');
    console.log("PDF generado correctamente.");

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename="hotbase_collection.pdf"');

    return new NextResponse(pdfOutput, { headers });
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    return new NextResponse(JSON.stringify({ error: 'Error interno al generar el PDF' }), { status: 500 });
  }
}
