import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FilterControls } from "./_components/filter-controls";
import Image from "next/image";

type Car = {
  id: string;
  name: string;
  series: string | null;
  car_images: { image_url: string }[] | [];
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { 
    q?: string;
    series?: string;
    condition?: string;
  };
}) {
  const supabase = createClient();
  const query = searchParams?.q || '';
  const seriesFilter = searchParams?.series;
  const conditionFilter = searchParams?.condition;

  const { data: seriesData, error: seriesError } = await supabase
    .from('cars')
    .select('series')
    .not('series', 'is', null);

  const uniqueSeries = seriesData 
    ? [...new Set(seriesData.map(item => item.series).filter(Boolean) as string[])] 
    : [];

  let carQuery = supabase
    .from("cars")
    .select(`id, name, series, car_images ( image_url )`)
    .order('created_at', { ascending: false })
    .limit(1, { foreignTable: "car_images" });

  if (query) carQuery = carQuery.ilike('name', `%${query}%`);
  if (seriesFilter && seriesFilter !== 'all') carQuery = carQuery.eq('series', seriesFilter);
  if (conditionFilter && conditionFilter !== 'all') carQuery = carQuery.eq('condition', conditionFilter);

  const { data: cars, error } = await carQuery;

  if (error || seriesError) {
    console.error("Error al obtener los coches:", error || seriesError);
    return <div className="text-center text-red-500">Hubo un error al cargar tu colección.</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mi Colección</h1>
          <p className="text-muted-foreground">
            {cars.length} {cars.length === 1 ? 'coche' : 'coches'} en tu garaje.
          </p>
        </div>
      </div>
      
      <div>
        <FilterControls series={uniqueSeries} />
      </div>
      
      {cars && cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center mt-12">
          <h2 className="mt-6 text-xl font-semibold">No se encontraron resultados</h2>
          <p className="mt-2 text-muted-foreground">Prueba a cambiar los filtros o el término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(cars as Car[])?.map((car) => (
            <Link href={`/dashboard/cars/${car.id}`} key={car.id}>
              <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground transition-all hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden">
                  {car.car_images.length > 0 ? (
                    <Image src={car.car_images[0].image_url} alt={`Imagen de ${car.name}`} fill className="object-cover transition-transform group-hover:scale-105"/>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted"><span className="text-sm text-muted-foreground">Sin imagen</span></div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="truncate font-semibold">{car.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{car.series || "Sin serie"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}