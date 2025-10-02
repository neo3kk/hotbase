import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Header } from "@/components/header";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the type for a news item
type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  imageUrl: string | null;
};

async function NewsSection() {
  // Use production domain for server-side fetching in production
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://hotbaseapp.com' 
    : 'http://localhost:3000';
  
  let newsItems: NewsItem[] = [];
  let fetchError = false;

  try {
    // The fetch call is automatically memoized by Next.js on the server
    const res = await fetch(`${baseUrl}/api/news`);

    if (!res.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await res.json();
    newsItems = data.items;
  } catch (error) {
    console.error(error);
    fetchError = true;
  }

  if (fetchError || !newsItems || newsItems.length === 0) {
    // Don't render the section if fetching fails or there are no items
    return null;
  }

  return (
    <div className="mt-24 w-full max-w-5xl">
      <h2 className="text-3xl font-bold text-center mb-8">Últimas Noticias</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {newsItems.map((item) => (
          <a href={item.link} target="_blank" rel="noopener noreferrer" key={item.link} className="block">
            <Card className="h-full hover:border-blue-500 transition-colors duration-300 ease-in-out overflow-hidden">
              {item.imageUrl && (
                <div className="aspect-video relative w-full">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.title || 'Imagen de la noticia'} 
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.snippet}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      {user && <Header />}

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        
        {!user && (
          <div className="mb-8">
            <Image src="/logo600.png" alt="hotbase logo" width={400} height={120} />
          </div>
        )}

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

        <NewsSection />

      </div>
    </>
  );
}