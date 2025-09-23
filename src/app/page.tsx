import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="space-y-6">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
          Bienvenido a <span className="text-blue-500">hotbase</span>
        </h1>
        <p className="max-w-[700px] mx-auto text-lg text-muted-foreground md:text-xl">
          La plataforma definitiva para gestionar, analizar y compartir tu
          colección de Hot Wheels. 🚗🔥
        </p>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">Ir a mi Colección</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/signup">Registrarse Gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}