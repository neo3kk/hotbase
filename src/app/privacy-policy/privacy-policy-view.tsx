'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function GoBackButton() {
  const router = useRouter()
  return <Button onClick={() => router.back()}>Volver</Button>
}

export default function PrivacyPolicyView() {
  return (
    <div className="prose prose-invert mx-auto py-12">
      <h1>Política de Privacidad</h1>
      <p>Última actualización: 30 de septiembre de 2025</p>

      <p>
        Bienvenido a hotbase. Tu privacidad es de suma importancia para nosotros.
        Esta política de privacidad describe cómo recogemos, usamos, divulgamos
        y protegemos tu información cuando visitas nuestro sitio web.
      </p>

      <h2>1. Información que Recopilamos</h2>
      <p>
        Podemos recopilar información sobre ti de varias maneras. La información
        que podemos recopilar en el Sitio incluye:
      </p>
      <ul>
        <li>
          <strong>Datos Personales</strong>: Información de identificación
          personal, como tu nombre, dirección de correo electrónico, que nos
          proporcionas voluntariamente cuando te registras en el Sitio o cuando
          eliges participar en diversas actividades relacionadas con el Sitio.
        </li>
        <li>
          <strong>Datos de Uso</strong>: Información que nuestro servidor recopila
          automáticamente cuando accedes al Sitio, como tu dirección IP, tipo de
          navegador, sistema operativo, tiempos de acceso y las páginas que has
          visto directamente antes y después de acceder al Sitio.
        </li>
      </ul>

      <h2>2. Uso de Tu Información</h2>
      <p>
        Tener información precisa sobre ti nos permite ofrecerte una
        experiencia fluida, eficiente y personalizada. Específicamente,
        podemos usar la información recopilada sobre ti a través del Sitio para:
      </p>
      <ul>
        <li>Crear y gestionar tu cuenta.</li>
        <li>Enviarte un correo electrónico de confirmación.</li>
        <li>Aumentar la eficiencia y el funcionamiento del Sitio.</li>
        <li>Prevenir actividades fraudulentas y supervisar la seguridad.</li>
        <li>Solicitar comentarios y contactarte sobre tu uso del Sitio.</li>
      </ul>

      <h2>3. Divulgación de Tu Información</h2>
      <p>
        No compartiremos, venderemos, alquilaremos ni cederemos tu información
        a terceros sin tu consentimiento, excepto en las situaciones descritas
        a continuación:
      </p>
      <ul>
        <li>
          <strong>Por Ley o para Proteger Derechos</strong>: Si creemos que la
          divulgación de información sobre ti es necesaria para responder a un
          proceso legal, para investigar o remediar posibles violaciones de
          nuestras políticas, o para proteger los derechos, la propiedad y la
          seguridad de otros.
        </li>
        <li>
          <strong>Proveedores de Servicios de Terceros</strong>: Podemos compartir
          tu información con terceros que realizan servicios para nosotros o en
          nuestro nombre, incluidos el procesamiento de pagos, el análisis de
          datos, el envío de correos electrónicos, los servicios de hosting y el
          servicio al cliente.
        </li>
      </ul>

      <h2>4. Seguridad de Tu Información</h2>
      <p>
        Utilizamos medidas de seguridad administrativas, técnicas y físicas para
        ayudar a proteger tu información personal. Si bien hemos tomado medidas
        razonables para proteger la información personal que nos proporcionas,
        ten en cuenta que a pesar de nuestros esfuerzos, ninguna medida de
        seguridad es perfecta o impenetrable.
      </p>

      <h2>5. Tus Derechos de Privacidad</h2>
      <p>
        De acuerdo con el RGPD, tienes derecho a acceder, rectificar, suprimir
        tus datos, así como otros derechos, como se explica en la información
        adicional. Puedes ejercer tus derechos enviando un correo electrónico a
        [dirección de correo electrónico de contacto].
      </p>

      <h2>6. Contacto</h2>
      <p>
        Si tienes preguntas o comentarios sobre esta Política de Privacidad,
        por favor contáctanos en:
      </p>
      <p>Hotbase</p>
      <p></p>
      <p>hotbaseapp@gmail.com</p>

      <div className="flex justify-center py-4">
        <GoBackButton />
      </div>
    </div>
  )
}
