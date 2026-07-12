import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState(undefined); // undefined = not checked yet
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setSession(data.session);
      })
      .catch((err) => {
        console.error("[CMS] Failed to check auth session:", err);
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}
