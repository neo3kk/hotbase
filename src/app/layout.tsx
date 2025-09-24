import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "hotbase",
  description: "Gestiona tu colección de Hot Wheels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.className} flex flex-col min-h-screen bg-background`}>
        <main className="flex-grow flex flex-col">
          <div className="w-full max-w-screen-xl mx-auto px-4">
            {children}
          </div>
        </main>
        <Toaster richColors />
      </body>
    </html>
  );
}