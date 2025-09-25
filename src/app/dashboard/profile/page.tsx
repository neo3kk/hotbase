import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { UpdateProfileForm } from "./_components/update-profile-form";
import { UserAvatar } from "@/components/user-avatar";
import { DeleteProfileButton } from "./_components/delete-profile-button";

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-xl py-8">
      <div className="space-y-2 mb-8 text-center">
        <div className="flex justify-center mb-4">
          <UserAvatar />
        </div>
        <h1 className="text-3xl font-bold">Tu Perfil</h1>
        <p className="text-gray-400">
          Actualiza tu nombre de usuario y avatar.
        </p>
      </div>
      <UpdateProfileForm profile={profile} />

      <div className="mt-8 pt-8 border-t border-red-500/30">
        <h2 className="text-lg font-semibold text-red-500">Zona de Peligro</h2>
        <p className="text-sm text-gray-400 mb-4">
          Estas acciones son destructivas y no se pueden revertir.
        </p>
        <DeleteProfileButton />
      </div>
    </div>
  );
}