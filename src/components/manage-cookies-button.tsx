'use client'

import { resetCookieConsentValue } from 'react-cookie-consent'

export default function ManageCookiesButton() {
  const handleManageCookies = () => {
    resetCookieConsentValue('hotbase-cookie-consent')
    window.location.reload()
  }

  return (
    <button onClick={handleManageCookies} className="underline">
      Preferencias de Cookies
    </button>
  )
}
