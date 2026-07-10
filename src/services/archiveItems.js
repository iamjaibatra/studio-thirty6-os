import { supabase } from "../lib/supabase";

/**
 * public.archive_items — cards on the PUBLIC website's Archive page
 * (contact-sheet frames). Not to be confused with the CMS's own
 * `archive` table (soft-deleted/archived projects) — different concept,
 * unfortunate name overlap inherited from the brief.
 */

const SELECT_COLUMNS = "id, title, category, media_id, metadata, display_order";

export async function listArchiveItems() {
  const { data, error } = await supabase
    .from("archive_items")
    .select(`${SELECT_COLUMNS}, media:media_id ( id, name, url )`)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createArchiveItem(payload) {
  const { data, error } = await supabase
    .from("archive_items")
    .insert([toRow(payload)])
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateArchiveItem(id, payload) {
  const { data, error } = await supabase
    .from("archive_items")
    .update(toRow(payload))
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArchiveItem(id) {
  const { error } = await supabase.from("archive_items").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderArchiveItems(orderedIds) {
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("archive_items").update({ display_order: i }).eq("id", id))
  );
}

function toRow(payload) {
  const row = { ...payload };
  delete row.media;
  return row;
}
