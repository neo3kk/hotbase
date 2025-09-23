// src/middleware.ts

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware' // Crearemos este cliente a continuación

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresca la sesión del usuario si ha expirado.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Si el usuario no está logueado y пытается acceder al dashboard, redirige a /login
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si el usuario está logueado, no puede acceder a /login o /signup
  if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}