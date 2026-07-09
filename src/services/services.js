import { supabase } from "../lib/supabase";

/**
 * public.services (created in Phase 1, full CMS management arrives with
 * the Lenses phase). listServices() here is just enough for Transmit to
 * show which services currently populate its dropdown.
 */
export async function listServices() {
  const { data, error } = await supabase
    .from("services")
    .select("id, title, enabled, display_order")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
