'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} variant="outline">
      Volver a la colección
    </Button>
  );
}
