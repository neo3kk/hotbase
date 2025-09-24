import { SignUpForm } from './_components/signup-form';
import Image from 'next/image';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Image src="/logo600.png" alt="hotbase logo" width={300} height={90} />
      </Link>
      <SignUpForm />
    </div>
  );
}