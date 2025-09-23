'use client';
import { logout } from '@/app/actions';
import { Button } from './ui/button';

export function LogoutButton() {
  return (
    <form action={logout} className="w-full">
      <Button type="submit" variant="ghost" className="w-full justify-start p-0 h-auto font-normal">
        Cerrar Sesión
      </Button>
    </form>
  );
}