import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies',
}

export default function CookiePolicyPage() {
  return (
    <div className="prose prose-invert mx-auto py-12">
      <h1>Política de Cookies</h1>
      <p>Última actualización: 30 de septiembre de 2025</p>

      <h2>¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños ficheros de texto que se instalan en el equipo
        terminal del usuario (ordenador, dispositivo móvil, etc.) cuando visita
        un sitio web, con la finalidad de almacenar datos que podrán ser
        actualizados y recuperados por la entidad responsable de su instalación.
      </p>

      <h2>¿Qué tipos de cookies utiliza esta página web?</h2>
      <p>A continuación, se muestra un cuadro con las cookies utilizadas en este sitio web:</p>
      <ul>
        <li>
          <strong>Cookies técnicas (esenciales)</strong>: Son aquéllas que
          permiten al usuario la navegación a través de una página web, plataforma
          o aplicación y la utilización de las diferentes opciones o servicios que
          en ella existan como, por ejemplo, controlar el tráfico y la
          comunicación de datos, identificar la sesión o realizar el proceso de
          compra de un pedido.
        </li>
        <li>
          <strong>hotbase-cookie-consent</strong>: Cookie propia, técnica, que almacena el
          consentimiento del usuario para la instalación de cookies.
          Caducidad: 150 días.
        </li>
        {/* TODO: Añadir aquí otras cookies (analíticas, publicitarias, etc.) */}
      </ul>

      <h2>¿Cómo puedo desactivar o eliminar las cookies?</h2>
      <p>
        Puede usted permitir, bloquear o eliminar las cookies instaladas en su
        equipo mediante la configuración de las opciones del navegador instalado
        en su ordenador. En caso de que no permita la instalación de cookies en
        su navegador es posible que no pueda acceder a alguna de las secciones
        de nuestra web.
      </p>
      <p>
        Para más información sobre cómo gestionar las cookies, puede consultar
        la guía de su navegador.
      </p>

      <h2>Cambios en la Política de Cookies</h2>
      <p>
        Podemos actualizar la Política de Cookies de nuestro Sitio Web, por ello
        le recomendamos revisar esta política cada vez que acceda a nuestro
        Sitio Web con el objetivo de estar adecuadamente informado sobre cómo y
        para qué usamos las cookies.
      </p>
    </div>
  )
}
