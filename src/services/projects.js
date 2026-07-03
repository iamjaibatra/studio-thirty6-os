import { supabase } from "../lib/supabase";
import { deleteFile, pathFromPublicUrl } from "./storage";

/**
 * ASSUMED SCHEMA — this repo's live Supabase schema wasn't available while
 * building this module. If your real `projects` / `archive` tables use
 * different column names, this is the only file that needs updating.
 *
 * projects
 *   id             uuid, primary key, default gen_random_uuid()
 *   title          text
 *   slug           text, unique
 *   client         text
 *   category_id    uuid, references categories(id), nullable
 *   year           int4
 *   description    text
 *   duration       text            e.g. "2:45"
 *   featured       boolean, default false
 *   published      boolean, default false
 *   thumbnail_url  text, nullable
 *   video_url      text, nullable
 *   created_at     timestamptz, default now()
 *   updated_at     timestamptz, default now()
 *
 * archive — same columns as `projects`, plus:
 *   archived_at    timestamptz, default now()
 */

const SELECT_COLUMNS =
  "id, title, slug, client, category_id, year, description, duration, featured, published, thumbnail_url, video_url, created_at, updated_at, categories:category_id ( id, name )";

const SORT_MAP = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  alphabetical: { column: "title", ascending: true },
  updated: { column: "updated_at", ascending: false },
};

/**
 * @param {object} options
 * @param {string} [options.search]
 * @param {string} [options.categoryId]
 * @param {string|number} [options.year]
 * @param {boolean} [options.featured]
 * @param {boolean} [options.published]
 * @param {keyof typeof SORT_MAP} [options.sort]
 */
export async function listProjects(options = {}) {
  const { search, categoryId, year, featured, published, sort = "newest" } = options;

  let query = supabase.from("projects").select(SELECT_COLUMNS);

  if (search && search.trim()) {
    const term = search.trim().replace(/[%,]/g, "");
    query = query.or(
      `title.ilike.%${term}%,client.ilike.%${term}%,description.ilike.%${term}%`
    );
  }

  if (categoryId) query = query.eq("category_id", categoryId);
  if (year) query = query.eq("year", year);
  if (featured !== undefined && featured !== null) query = query.eq("featured", featured);
  if (published !== undefined && published !== null) query = query.eq("published", published);

  const { column, ascending } = SORT_MAP[sort] ?? SORT_MAP.newest;
  query = query.order(column, { ascending });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getProject(id) {
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(payload) {
  const { data, error } = await supabase
    .from("projects")
    .insert([toRow(payload)])
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id, payload) {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...toRow(payload), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(project) {
  const { error } = await supabase.from("projects").delete().eq("id", project.id);
  if (error) throw error;

  // Best-effort file cleanup — a failed storage delete shouldn't block the
  // row already being gone, so these are not awaited into the throw path.
  const thumbPath = pathFromPublicUrl("thumbnails", project.thumbnail_url);
  const videoPath = pathFromPublicUrl("videos", project.video_url);

  await Promise.allSettled([
    thumbPath ? deleteFile("thumbnails", thumbPath) : Promise.resolve(),
    videoPath ? deleteFile("videos", videoPath) : Promise.resolve(),
  ]);
}

export async function archiveProject(project) {
  const archiveRow = {
    ...toRow(project),
    id: project.id,
    archived_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("archive").insert([archiveRow]);
  if (insertError) throw insertError;

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id);

  if (deleteError) throw deleteError;
}

export async function setFeatured(id, featured) {
  const { error } = await supabase
    .from("projects")
    .update({ featured, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function duplicateProject(project) {
  const copy = {
    ...omit(project, ["id", "categories", "created_at", "updated_at"]),
    title: `${project.title} (Copy)`,
    slug: `${project.slug}-copy-${Math.random().toString(36).slice(2, 6)}`,
    published: false,
  };

  return createProject(copy);
}

/** Strips UI-only fields (like the joined `categories` object) before writes. */
function toRow(payload) {
  return omit(payload, ["categories"]);
}

function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}
