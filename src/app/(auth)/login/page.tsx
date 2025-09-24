import { LoginForm } from './_components/login-form';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Image src="/logo600.png" alt="hotbase logo" width={300} height={90} />
      </Link>
      <LoginForm />
    </div>
  );
}