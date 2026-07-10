import { supabase } from "../lib/supabase";

/**
 * public.services (created Phase 1, seeded Phase 3, full CMS management
 * here in Phase 7): id, title, description, icon_media_id, image_media_id,
 * video_media_id, specs (jsonb: focal, aperture_spec, format, dof,
 * deliverables[]), duration, price, display_order, enabled.
 */
const SELECT_COLUMNS =
  "id, title, description, specs, duration, price, display_order, enabled, icon_media_id, image_media_id, video_media_id";

export async function listServices() {
  const { data, error } = await supabase
    .from("services")
    .select(`${SELECT_COLUMNS}, icon:icon_media_id ( id, name, url ), image:image_media_id ( id, name, url ), video:video_media_id ( id, name, url )`)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createService(payload) {
  const { data, error } = await supabase
    .from("services")
    .insert([toRow(payload)])
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(id, payload) {
  const { data, error } = await supabase
    .from("services")
    .update(toRow(payload))
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderServices(orderedIds) {
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("services").update({ display_order: i }).eq("id", id))
  );
}

function toRow(payload) {
  const row = { ...payload };
  delete row.icon;
  delete row.image;
  delete row.video;
  return row;
}
