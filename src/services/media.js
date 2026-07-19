import { supabase } from "../lib/supabase";
import { uploadFile, deleteFile, buildStoragePath, pathFromPublicUrl } from "./storage";

/**
 * public.media
 *   id, name, type (image|video|logo|icon|document), url, storage_path,
 *   bucket, alt_text, tags (text[]), created_at, updated_at
 *
 * All uploads for this library go to the `media-library` bucket, kept
 * separate from the `thumbnails`/`videos` buckets used directly by
 * project.thumbnail/video (those stay exactly as they were).
 */

const BUCKET = "media-library";
const SELECT_COLUMNS = "id, name, type, url, storage_path, bucket, alt_text, tags, created_at, updated_at";

const TYPE_BY_MIME = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
};

export async function getMediaByIds(ids) {
  const list = ids.filter(Boolean);
  if (!list.length) return {};
  const { data, error } = await supabase.from("media").select(SELECT_COLUMNS).in("id", list);
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((m) => [m.id, m]));
}

export async function listMedia({ type, search, tag } = {}) {
  let query = supabase.from("media").select(SELECT_COLUMNS).order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (tag) query = query.contains("tags", [tag]);
  if (search && search.trim()) {
    const term = search.trim().replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${term}%,alt_text.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Uploads a file to the media-library bucket and creates its `media` row.
 * @param {File} file
 * @param {{ name?: string, type?: 'image'|'video'|'logo'|'icon'|'document', altText?: string, tags?: string[] }} meta
 * @param {(percent:number)=>void} [onProgress]
 */
export async function uploadMedia(file, meta = {}, onProgress) {
  const type = meta.type || TYPE_BY_MIME(file);
  const path = buildStoragePath("library", file);
  const { publicUrl } = await uploadFile(BUCKET, file, path, onProgress);

  const { data, error } = await supabase
    .from("media")
    .insert([
      {
        name: meta.name || file.name,
        type,
        url: publicUrl,
        storage_path: path,
        bucket: BUCKET,
        alt_text: meta.altText || null,
        tags: meta.tags || [],
      },
    ])
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedia(id, { name, altText, tags }) {
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name;
  if (altText !== undefined) patch.alt_text = altText;
  if (tags !== undefined) patch.tags = tags;

  const { data, error } = await supabase
    .from("media")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMedia(asset) {
  const { error } = await supabase.from("media").delete().eq("id", asset.id);
  if (error) throw error;

  const path = asset.storage_path || pathFromPublicUrl(asset.bucket || BUCKET, asset.url);
  if (path) {
    await deleteFile(asset.bucket || BUCKET, path).catch(() => {});
  }
}

/** How many places (projects gallery, services, archive, timeline) reference this asset. */
export async function countMediaUsage(mediaId) {
  const [gallery, services, archiveItems, timelineStages] = await Promise.all([
    supabase.from("project_gallery").select("id", { count: "exact", head: true }).eq("media_id", mediaId),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .or(`icon_media_id.eq.${mediaId},image_media_id.eq.${mediaId},video_media_id.eq.${mediaId}`),
    supabase.from("archive_items").select("id", { count: "exact", head: true }).eq("media_id", mediaId),
    supabase.from("timeline_stages").select("id", { count: "exact", head: true }).eq("media_id", mediaId),
  ]);

  return (
    (gallery.count || 0) + (services.count || 0) + (archiveItems.count || 0) + (timelineStages.count || 0)
  );
}
