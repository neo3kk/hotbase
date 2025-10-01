import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import ManageCookiesButton from "@/components/manage-cookies-button";
import Link from "next/link";

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
      <head>
        <script src="https://js.puter.com/v2/"></script>
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-background`}>
        <main className="flex-grow flex flex-col">
          <div className="w-full max-w-screen-xl mx-auto px-4">
            {children}
          </div>
        </main>
        <CookieConsentBanner />
        <Toaster richColors />
        <footer className="text-center text-xs text-white/50 py-2 flex justify-center items-center space-x-4">
          <p>v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
          <Link href="/privacy-policy" className="underline">Política de Privacidad</Link>
          <ManageCookiesButton />
        </footer>
      </body>
    </html>
  );
}