import { supabase } from "../lib/supabase";

/**
 * public.page_content: id, page, section, content (jsonb), UNIQUE(page, section)
 * One row per editable content block. Generic by design so new
 * pages/sections don't need new tables.
 */

export async function getPageContent(page) {
  const { data, error } = await supabase.from("page_content").select("section, content").eq("page", page);
  if (error) throw error;

  const bySection = {};
  (data ?? []).forEach((row) => {
    bySection[row.section] = row.content || {};
  });
  return bySection;
}

export async function savePageContent(page, section, content) {
  const { data, error } = await supabase
    .from("page_content")
    .upsert(
      { page, section, content, updated_at: new Date().toISOString() },
      { onConflict: "page,section" }
    )
    .select("section, content")
    .single();

  if (error) throw error;
  return data;
}
