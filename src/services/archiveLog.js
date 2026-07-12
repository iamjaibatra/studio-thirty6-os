import { supabase } from "../lib/supabase";

/**
 * public.archive — log of projects moved out of active use via the
 * "Archive" action in Projects. Read-only here: id, project_id, type,
 * category, title, url, created_at.
 */
export async function listArchiveLog() {
  const { data, error } = await supabase
    .from("archive")
    .select("id, project_id, type, category, title, url, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
