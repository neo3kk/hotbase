'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchBar } from './search-bar';

// Recibimos las series únicas como una prop
export function FilterControls({ series }: { series: string[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (filterName: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(filterName, value);
    } else {
      params.delete(filterName);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <SearchBar />
      
      <Select
        onValueChange={(value) => handleFilterChange('series', value)}
        defaultValue={searchParams.get('series')?.toString() || 'all'}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por serie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las series</SelectItem>
          {series.map(s => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => handleFilterChange('condition', value)}
        defaultValue={searchParams.get('condition')?.toString() || 'all'}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por condición" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las condiciones</SelectItem>
          <SelectItem value="en-blister">En blíster</SelectItem>
          <SelectItem value="suelto">Suelto</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
          <SelectItem value="otro">Otro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}