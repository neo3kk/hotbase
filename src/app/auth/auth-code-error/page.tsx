'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Error de Autenticación</CardTitle>
          <CardDescription>
            Hubo un problema al intentar iniciar sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            No se pudo completar el proceso de autenticación. Esto puede deberse a un problema temporal o a que se denegó el acceso.
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">
            Por favor, intenta volver a la página de inicio de sesión y empezar de nuevo.
          </p>
          <Link href="/login" className="inline-block mt-6 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Volver a Login
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
