import { supabase } from "../lib/supabase";
import { deleteFile, pathFromPublicUrl } from "./storage";

/**
 * REAL SCHEMA — confirmed via the Supabase MCP connector against project
 * dtczmvbdaawnopdxqiax (`studiothirty6 films`) on 2026-07-07. No more
 * guessing: these are the actual columns.
 *
 * public.projects (RLS enabled)
 *   id            uuid, pk, default gen_random_uuid()
 *   title         text
 *   slug          text, unique
 *   client        text, nullable
 *   category      text, nullable   <- plain text, NOT a FK to categories.id
 *   year          int4, nullable
 *   description   text, nullable
 *   featured      boolean, nullable, default false
 *   thumbnail     text, nullable   <- column is `thumbnail`, not `thumbnail_url`
 *   video         text, nullable   <- column is `video`, not `video_url`
 *   duration      text, nullable
 *   published     boolean, nullable, default true
 *   created_at    timestamptz, nullable, default now()
 *   updated_at    timestamptz, nullable, default now()
 *
 * public.archive (RLS enabled) — a lightweight generic archive table, NOT
 * a full mirror of `projects`. It can only hold a title/category/url
 * snapshot, not description/duration/featured/year/client.
 *   id            uuid, pk, default gen_random_uuid()
 *   project_id    uuid, nullable, FK -> public.projects.id (ON DELETE: NO ACTION)
 *   type          text, nullable
 *   category      text, nullable
 *   title         text, nullable
 *   url           text, nullable
 *   created_at    timestamptz, nullable, default now()
 *
 * IMPORTANT: archive.project_id's FK is NO ACTION (verified via
 * pg_constraint), meaning Postgres will reject a DELETE on the
 * referenced projects row while an archive row still points at it. So
 * archiveProject() below detaches the reference (sets it back to null)
 * immediately after inserting, before deleting the project.
 *
 * public.categories (RLS enabled)
 *   id    uuid, pk, default gen_random_uuid()
 *   name  text, nullable, unique
 *   color text, nullable
 */

const SELECT_COLUMNS =
  "id, title, slug, client, category, year, description, duration, featured, published, thumbnail, video, created_at, updated_at";

const SORT_MAP = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  alphabetical: { column: "title", ascending: true },
  updated: { column: "updated_at", ascending: false },
};

/**
 * @param {object} options
 * @param {string} [options.search]
 * @param {string} [options.category] - category NAME (plain text match, no FK)
 * @param {string|number} [options.year]
 * @param {boolean} [options.featured]
 * @param {boolean} [options.published]
 * @param {keyof typeof SORT_MAP} [options.sort]
 */
export async function listProjects(options = {}) {
  const { search, category, year, featured, published, sort = "newest" } = options;

  let query = supabase.from("projects").select(SELECT_COLUMNS);

  if (search && search.trim()) {
    const term = search.trim().replace(/[%,]/g, "");
    query = query.or(
      `title.ilike.%${term}%,client.ilike.%${term}%,description.ilike.%${term}%`
    );
  }

  if (category) query = query.eq("category", category);
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
    .maybeSingle();

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
  const thumbPath = pathFromPublicUrl("thumbnails", project.thumbnail);
  const videoPath = pathFromPublicUrl("videos", project.video);

  await Promise.allSettled([
    thumbPath ? deleteFile("thumbnails", thumbPath) : Promise.resolve(),
    videoPath ? deleteFile("videos", videoPath) : Promise.resolve(),
  ]);
}

/**
 * Moves a project into the (lightweight) archive table, then deletes it
 * from `projects`. Because archive.project_id -> projects.id is a NO
 * ACTION foreign key, the reference has to be cleared before the project
 * row can be deleted — otherwise Postgres rejects the delete.
 *
 * Note the archive table only has room for a title/category/url snapshot
 * (whichever of video/thumbnail exists, preferring video). Description,
 * duration, featured, year, and client are NOT preserved by this schema.
 */
export async function archiveProject(project) {
  const archiveRow = {
    project_id: project.id,
    type: "project",
    category: project.category ?? null,
    title: project.title,
    url: project.video || project.thumbnail || null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("archive")
    .insert([archiveRow])
    .select("id")
    .single();
  if (insertError) throw insertError;

  // Detach the reference so the FK (NO ACTION on delete) doesn't block
  // removing the project row below.
  const { error: detachError } = await supabase
    .from("archive")
    .update({ project_id: null })
    .eq("id", inserted.id);
  if (detachError) throw detachError;

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id);

  if (deleteError) {
    // Roll back the archive insert so we don't leave an orphaned archive
    // row if the project couldn't actually be removed.
    await supabase.from("archive").delete().eq("id", inserted.id);
    throw deleteError;
  }
}

export async function setFeatured(id, featured) {
  const { error } = await supabase
    .from("projects")
    .update({ featured, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function setPublished(id, published) {
  const { error } = await supabase
    .from("projects")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function duplicateProject(project) {
  const copy = {
    ...omit(project, ["id", "created_at", "updated_at"]),
    title: `${project.title} (Copy)`,
    slug: `${project.slug}-copy-${Math.random().toString(36).slice(2, 6)}`,
    published: false,
  };

  return createProject(copy);
}

/** Strips fields Postgres doesn't have a column for before writes. */
function toRow(payload) {
  return omit(payload, ["categories"]);
}

function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}
