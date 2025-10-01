'use client'

import CookieConsent from 'react-cookie-consent'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CookieConsentBanner() {
  const router = useRouter()

  const handleAccept = () => {
    router.push('/dashboard')
  }

  const handleDecline = () => {
    router.push('/dashboard')
  }

  return (
    <CookieConsent
      location="bottom"
      buttonText="Aceptar"
      declineButtonText="Rechazar"
      enableDeclineButton
      cookieName="hotbase-cookie-consent"
      style={{ background: '#2B373B' }}
      buttonStyle={{ color: '#4e503b', fontSize: '13px' }}
      declineButtonStyle={{
        margin: '10px 10px 10px 0',
        background: '#808080',
        fontSize: '13px',
      }}
      expires={150}
      onAccept={handleAccept}
      onDecline={handleDecline}
    >
      Este sitio web utiliza cookies para mejorar la experiencia del usuario.
      <Link href="/cookie-policy" className="ml-2 text-sm underline">
        Leer más
      </Link>
    </CookieConsent>
  )
}
