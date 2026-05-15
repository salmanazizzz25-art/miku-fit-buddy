import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export function usePremium() {
  const { user } = useSession();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPremiumStatus();
  }, [user]);

  const fetchPremiumStatus = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("premium")
      .eq("id", user!.id)
      .single();
    setIsPremium(data?.premium || false);
    setLoading(false);
  };

  const togglePremium = async () => {
    const newVal = !isPremium;
    setIsPremium(newVal);
    await supabase
      .from("profiles")
      .update({ premium: newVal })
      .eq("id", user!.id);
  };

  return { isPremium, loading, togglePremium, refetch: fetchPremiumStatus };
}
