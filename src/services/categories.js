import { supabase } from "../lib/supabase";

/**
 * ASSUMED SCHEMA — adjust here if your live `categories` table differs:
 *   id         uuid, primary key
 *   name       text
 *   created_at timestamptz
 */

export async function listCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
