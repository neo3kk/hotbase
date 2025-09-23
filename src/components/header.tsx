import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";
import { LogoutButton } from "./logout-button";
import { headers } from "next/headers";
import Image from "next/image";

export async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = headers().get("next-url");

  const hideAuthButtons = !user && (pathname === "/login" || pathname === "/signup");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-screen-xl mx-auto px-4 flex items-center justify-between">
        {/* Lado Izquierdo: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            <Image src="/logo600.png" alt="hotbase logo" width={200} height={60} />
          </Link>
        </div>
        
        {/* Lado Derecho: Acciones de Usuario */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80">
                  <UserAvatar />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata.username || "Usuario"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/profile">Mi Perfil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/cars/new">Añadir Coche</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0"><LogoutButton /></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !hideAuthButtons && (
              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost"><Link href="/login">Iniciar Sesión</Link></Button>
                <Button asChild><Link href="/signup">Registrarse</Link></Button>
              </nav>
            )
          )}
        </div>
      </div>
    </header>
  );
}