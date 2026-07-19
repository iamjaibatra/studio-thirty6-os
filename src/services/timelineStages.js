import { supabase } from "../lib/supabase";

/**
 * public.timeline_stages — Edit page stages (Brief → Research → ... →
 * Delivery). media_id (renamed from video_media_id in Sprint 2 — now
 * holds either an image or a video) and project_id are optional
 * per-stage attachments; description was added in Phase 6.
 */
const SELECT_COLUMNS = "id, label, description, stage_order, media_id, project_id";

export async function listTimelineStages() {
  const { data, error } = await supabase
    .from("timeline_stages")
    .select(`${SELECT_COLUMNS}, media:media_id ( id, name, url, type ), project:project_id ( id, title )`)
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
  delete row.media;
  delete row.project;
  return row;
}
