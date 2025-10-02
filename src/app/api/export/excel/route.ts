import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  console.log("Iniciando exportación a Excel...");
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error de autenticación en Excel:", userError);
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }
  console.log("Usuario autenticado en Excel:", user.id);

  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('name, yearly_collection_number, collection_or_series_name, condition, notes, series_number, purchase_price, model_year')
    .eq('user_id', user.id);

  if (carsError) {
    console.error("Error al obtener los coches en Excel:", carsError);
    return new NextResponse(JSON.stringify({ error: 'Error al obtener los coches' }), { status: 500 });
  }

  if (!cars || cars.length === 0) {
    console.log("No se encontraron coches para exportar en Excel.");
    return new NextResponse(JSON.stringify({ message: 'No hay coches para exportar' }), { status: 200 });
  }
  console.log(`Se encontraron ${cars.length} coches para exportar a Excel.`);

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mi Colección');

    worksheet.columns = [
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Nombre de la colección', key: 'collection_or_series_name', width: 30 },
      { header: 'Serie anual', key: 'yearly_collection_number', width: 15 },
      { header: 'Serie coleccion', key: 'series_number', width: 15 },
      { header: 'Año', key: 'model_year', width: 10 },
      { header: 'Condición', key: 'condition', width: 15 },
      { header: 'Precio de compra (€)', key: 'purchase_price', width: 20 },
      { header: 'Notas', key: 'notes', width: 50 },
    ];

    worksheet.getRow(1).font = { bold: true };

    const processedCars = cars.map(car => ({
      name: car.name || '',
      collection_or_series_name: car.collection_or_series_name || '',
      yearly_collection_number: car.yearly_collection_number || '',
      series_number: car.series_number || '',
      model_year: car.model_year || '',
      condition: car.condition || '',
      purchase_price: car.purchase_price || '',
      notes: car.notes || ''
    }));

    processedCars.forEach(car => {
      worksheet.addRow(car);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    console.log("Excel generado correctamente.");

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', 'attachment; filename="hotbase_collection.xlsx"');

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Error al generar el Excel:", error);
    return new NextResponse(JSON.stringify({ error: 'Error interno al generar el Excel' }), { status: 500 });
  }
}
