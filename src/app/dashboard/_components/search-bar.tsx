'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Esta función retrasa la ejecución para no hacer una petición en cada tecla
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300); // Espera 300ms después de la última pulsación

  return (
    <Input
      placeholder="Buscar por nombre..."
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('q')?.toString()}
      className="max-w-sm"
    />
  );
}