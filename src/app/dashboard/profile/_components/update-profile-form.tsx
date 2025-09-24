'use client';

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { updateProfile } from "../actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/types/supabase";

const initialState = { message: "", error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Actualizando..." : "Actualizar Perfil"}</Button>;
}

export function UpdateProfileForm({ profile }: { profile: Tables<'profiles'> }) {
  const [state, formAction] = useFormState(updateProfile, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.error) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Información Pública</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input id="username" name="username" defaultValue={profile.username} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avatar">Avatar</Label>
            <Input id="avatar" name="avatar" type="file" />
            <p className="text-sm text-gray-500 mt-2">Sube una imagen para tu foto de perfil.</p>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}