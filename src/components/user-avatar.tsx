import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export async function UserAvatar() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single();

  const avatarUrl = profile?.avatar_url;

  return (
    <>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar de usuario"
          width={80}
          height={80}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-white">
          {user.email?.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
}