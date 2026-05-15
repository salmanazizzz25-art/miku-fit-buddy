import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/hooks/use-session";
import { getMyProfile } from "@/lib/profile.functions";
import { MikuCharacter } from "@/components/MikuCharacter";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const fetchProfile = useServerFn(getMyProfile);

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    } else if (user && data && !data.profile?.onboarding_complete) {
      navigate({ to: "/onboarding" });
    }
  }, [user, loading, data, navigate]);

  if (loading || (user && isLoading) || !user || (data && !data.profile?.onboarding_complete)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <MikuCharacter size={120} mood="happy" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
