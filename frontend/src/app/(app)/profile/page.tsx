"use client";

import { useEffect } from "react";
import { ProfilePageTemplate } from "@/template/page/profile.template";
import { useCurrentUser } from "@/hooks/use-users";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { useRouter } from "next/navigation";
import { useCurrentAuthUser } from "@/hooks/use-auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useCurrentAuthUser();
  const { user, isLoading, updateProfile, isUpdating } = useCurrentUser();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen type="profile" />;
  }

  if (!user && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <ProfilePageTemplate
      user={user}
      onUpdateProfile={updateProfile}
      isUpdating={isUpdating}
    />
  );
}

