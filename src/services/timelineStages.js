import { supabase } from "../lib/supabase";

/**
 * public.timeline_stages — Edit page stages (Brief → Research → ... →
 * Delivery). video_media_id and project_id are optional per-stage
 * attachments; description was added in Phase 6.
 */
const SELECT_COLUMNS = "id, label, description, stage_order, video_media_id, project_id";

export async function listTimelineStages() {
  const { data, error } = await supabase
    .from("timeline_stages")
    .select(`${SELECT_COLUMNS}, video:video_media_id ( id, name, url ), project:project_id ( id, title )`)
    .order("stage_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createTimelineStage(payload) {
  const { data, error } = await supabase
    .from("timeline_stages")
    .insert([toRow(payload)])
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTimelineStage(id, payload) {
  const { data, error } = await supabase
    .from("timeline_stages")
    .update(toRow(payload))
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTimelineStage(id) {
  const { error } = await supabase.from("timeline_stages").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderTimelineStages(orderedIds) {
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("timeline_stages").update({ stage_order: i }).eq("id", id))
  );
}

function toRow(payload) {
  const row = { ...payload };
  delete row.video;
  delete row.project;
  return row;
}
