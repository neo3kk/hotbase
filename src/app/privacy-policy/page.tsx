import { type Metadata } from 'next'
import PrivacyPolicyView from './privacy-policy-view'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />
}